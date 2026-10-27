"""只读私密登记文件迁移与独立迁移 Bearer 上传；不部署、不读取服务配置。"""
import argparse
import ctypes
import hashlib
import http.client
import ipaddress
import json
import os
import re
import sqlite3
import ssl
import stat
import sys
from collections import Counter
from contextlib import closing, contextmanager
from pathlib import Path
from urllib.parse import quote, urlsplit


MAX_UPLOAD_BYTES = 64 * 1024 * 1024
CHUNK_BYTES = 1024 * 1024
RECONNECT_CODE = 'MIGRATION_RECONNECT_REQUIRED'
OBJECT_NAMESPACE = 'artifacts'
SCHEMA_VERSION = 1
EXCLUDED_KINDS = frozenset({
    'portal_sessions', 'auth_throttles', 'auth_throttle', 'login_throttles',
    'auth_attempts', 'auth_failures', 'login_attempts', 'executor_credentials', 'credentials',
    'leases', 'executor_leases',
})
SECRET_FIELDS = frozenset({
    'token', 'token_hash', 'api_key', 'secret', 'app_secret', 'client_secret',
    'access_token', 'refresh_token', 'auth_token', 'session_token', 'csrf',
    'authorization', 'actor_authorization', 'executor_token', 'executor_credentials',
    'credentials', 'bearer_token', 'http_headers',
})
SECRET_SEGMENTS = frozenset({
    'secret', 'secrets', 'credential', 'credentials', 'token', 'tokens',
    'password', 'passwords', 'account', 'accounts', 'auth', 'codex-accounts', 'node_modules', '__pycache__',
})
SECRET_NAMES = frozenset({
    'auth.json', 'services.json', 'supply-config.json', 'portal-env.json',
    'id_rsa', 'id_ed25519', 'environment.json', 'platform.sqlite3', 'users.json',
    'server.key', 'client.key', 'tls.key', 'ssl.key', 'private.key',
})


class TransferError(ValueError):
    """只携带可回显的固定错误，不包含源数据、路径或凭据。"""


def safe_path(value):
    if not isinstance(value, str) or not value or any(ord(c) < 32 or ord(c) == 127 for c in value):
        raise TransferError('无效产物路径')
    if any(c in value for c in '\\:%?#') or value.startswith('/'):
        raise TransferError('拒绝非规范产物路径')
    parts = value.split('/')
    for part in parts:
        lower = part.lower()
        if not part or part in ('.', '..') or part.startswith('.') or part.endswith((' ', '.')):
            raise TransferError('拒绝隐藏、目录穿越或非规范路径')
        if re.fullmatch(r'(?i)(con|prn|aux|nul|com[1-9]|lpt[1-9])(\..*)?', part):
            raise TransferError('拒绝保留文件名')
        if lower in SECRET_SEGMENTS or lower in SECRET_NAMES or lower.endswith(('.pem', '.pfx', '.sqlite', '.sqlite3', '.db')):
            raise TransferError('拒绝密钥或服务配置路径')
        if set(re.split(r'[._-]', lower)) & {'secret', 'secrets', 'credential', 'credentials', 'token', 'password', 'account', 'accounts', 'auth'}:
            raise TransferError('拒绝密钥或凭据路径')
    return value


def safe_artifact_id(value):
    safe_path(value)
    if '/' in value or not re.fullmatch(r'[A-Za-z0-9_-]{1,160}', value):
        raise TransferError('无效产物 ID')
    return value


def object_key(artifact_id, path):
    return f'{OBJECT_NAMESPACE}/{safe_artifact_id(artifact_id)}/{safe_path(path)}'


def checked_path(value, *, directory=False):
    path = Path(os.path.abspath(os.fspath(value)))
    # 先检查每层 lstat，再 resolve；Windows 所有 reparse point 一律拒绝。
    for part in (*reversed(path.parents), path):
        info = part.lstat()
        if stat.S_ISLNK(info.st_mode) or getattr(info, 'st_file_attributes', 0) & 0x400:
            raise TransferError('拒绝符号链接、Junction 或其他重解析点')
    info = path.lstat()
    if directory and not stat.S_ISDIR(info.st_mode):
        raise TransferError('需要已有目录')
    if not directory and not stat.S_ISREG(info.st_mode):
        raise TransferError('只接受普通文件，拒绝目录及设备')
    return path


@contextmanager
def checked_open(path):
    path = checked_path(path)
    before = path.stat()
    flags = os.O_RDONLY | getattr(os, 'O_BINARY', 0) | getattr(os, 'O_NOFOLLOW', 0)
    fd = os.open(path, flags)
    with os.fdopen(fd, 'rb') as stream:
        opened = os.fstat(stream.fileno())
        if not stat.S_ISREG(opened.st_mode) or (before.st_dev, before.st_ino) != (opened.st_dev, opened.st_ino):
            raise TransferError('文件在打开时变化')
        checked_path(path)
        if path.suffix.lower() == '.key':
            # 游戏可使用 .key 数据文件；常见私钥内容仍拒绝，不因放行配置目录泄露。
            prefix = stream.read(4096)
            stream.seek(0)
            if b'-----BEGIN ' in prefix and b'PRIVATE KEY-----' in prefix:
                raise TransferError('拒绝私钥文件内容')
        yield stream
        after = os.fstat(stream.fileno())
        current = checked_path(path).stat()
        signature = lambda s: (s.st_dev, s.st_ino, s.st_size, s.st_mtime_ns)
        # Windows 的路径 stat ctime 是创建时间，句柄 fstat ctime 是变更时间。
        if (signature(before) != signature(opened) or signature(opened) != signature(after)
                or signature(after) != signature(current) or opened.st_ctime_ns != after.st_ctime_ns
                or before.st_ctime_ns != current.st_ctime_ns):
            raise TransferError('读取期间文件变化，迁移中止')


def hash_stream(stream, aggregate=None):
    digest = hashlib.sha256()
    size = 0
    while chunk := stream.read(CHUNK_BYTES):
        digest.update(chunk)
        if aggregate is not None:
            aggregate.update(chunk)
        size += len(chunk)
    return digest.hexdigest(), size


def validate_digest(expected, observed):
    if not isinstance(expected, str) or not re.fullmatch(r'[0-9a-fA-F]{64}', expected):
        raise TransferError('无效登记 SHA-256')
    if expected.lower() != observed:
        raise TransferError('登记 SHA-256 与文件不一致')


class ReadOnlySource:
    """沿用 Store.get 的 records JSON 结构，不实例化有写入副作用的 Store。"""
    @staticmethod
    def get(db, kind, key):
        row = db.execute('SELECT data FROM records WHERE kind=? AND id=?', (kind, key)).fetchone()
        return json.loads(row[0]) if row else None


def artifact_files(source, db, artifact_id, root):
    artifact_id = safe_artifact_id(artifact_id)
    artifact = source.get(db, 'artifacts', artifact_id)
    if not isinstance(artifact, dict) or artifact.get('id') != artifact_id:
        raise TransferError('产物登记结构不一致')
    registered = artifact.get('files')
    if isinstance(registered, dict):
        entries = [(name, meta) for name, meta in registered.items()]
    elif isinstance(registered, list):
        entries = [(item, {}) if isinstance(item, str) else (item.get('path'), item)
                   for item in registered if isinstance(item, (str, dict))]
        if len(entries) != len(registered):
            raise TransferError('无效登记文件清单')
    else:
        raise TransferError('产物缺少登记文件清单')
    names = [safe_path(name) for name, _ in entries]
    if not names or len(set(names)) != len(names):
        raise TransferError('登记文件为空或重复')
    if len({name.casefold() for name in names}) != len(names):
        raise TransferError('登记文件存在大小写碰撞')
    entry = safe_path(artifact.get('entry'))
    if entry not in names:
        raise TransferError('产物入口不在登记文件清单')
    if 'runtime_local' in artifact and type(artifact['runtime_local']) is not bool:
        raise TransferError('无效 runtime_local 标志')
    base = checked_path(root / artifact_id, directory=True)
    aggregate = hashlib.sha256()
    rows = []
    # 与 import_local_review.snapshot 相同：路径排序，UTF-8 路径 + NUL + 原始字节。
    for name, meta in sorted(entries):
        target = checked_path(base / name)
        if not target.is_relative_to(base):
            raise TransferError('产物文件越界')
        aggregate.update(name.encode('utf-8') + b'\0')
        with checked_open(target) as stream:
            digest, size = hash_stream(stream, aggregate)
        if isinstance(meta, dict) and 'sha256' in meta:
            validate_digest(meta['sha256'], digest)
        if isinstance(meta, dict) and 'bytes' in meta and (type(meta['bytes']) is not int or meta['bytes'] != size):
            raise TransferError('登记文件大小不一致')
        rows.append({'artifact_id': artifact_id, 'path': name, 'object_key': object_key(artifact_id, name),
                     'sha256': digest, 'bytes': size, 'source_path': target.as_posix()})
    if 'sha256' in artifact:
        validate_digest(artifact['sha256'], aggregate.hexdigest())
    if 'size' in artifact and (type(artifact['size']) is not int or artifact['size'] != sum(row['bytes'] for row in rows)):
        raise TransferError('登记产物总大小不一致')
    return rows


def clean_record(kind, row, excluded_fields):
    def clean(value):
        if isinstance(value, list):
            return [clean(item) for item in value]
        if not isinstance(value, dict):
            return value
        result = {}
        for key, item in value.items():
            lower = key.lower()
            if lower in SECRET_FIELDS or lower.startswith('lease_'):
                excluded_fields[lower] += 1
            else:
                result[key] = clean(item)
        return result
    result = clean(row)
    # 只处理当前执行态；嵌套历史 status 不改写，密码 hash 不重算。
    if kind in {'jobs', 'candidates', 'discovery_runs', 'supply'} and result.get('status') == 'running':
        previous = {key: result[key] for key in ('status', 'blocker', 'reason') if key in result}
        if 'migration' in result or 'previous_status' in result:
            raise TransferError('记录已有迁移状态，拒绝覆盖历史')
        result['migration'] = {'previous_status': 'running', 'previous_state': previous}
        result['previous_status'] = 'running'
        result['status'] = 'blocked'
        result['blocker'] = {'code': RECONNECT_CODE, 'reason': '迁移后原执行连接和租约失效',
                             'next_action': '重新授权执行器并核对历史检查点后显式恢复；不得自动验收'}
        result['reason'] = result['blocker']['reason']
    if kind == 'tools':
        result['migration_previous_enabled'] = result.get('enabled')
        result['enabled'] = False
        for key in ('last_seen', 'online'):
            if key in result:
                excluded_fields[key] += 1
                result.pop(key)
    return result


def sql_quote(value):
    if not isinstance(value, str):
        raise TransferError('SQL 文本类型无效')
    if any(ord(c) < 32 or ord(c) == 127 for c in value):
        return "CAST(X'" + value.encode('utf-8').hex() + "' AS TEXT)"
    return "'" + value.replace("'", "''") + "'"


def _windows_private_acl(path):
    from ctypes import wintypes as w
    adv = ctypes.WinDLL('advapi32', use_last_error=True)
    kernel = ctypes.WinDLL('kernel32', use_last_error=True)
    adv.OpenProcessToken.argtypes = [w.HANDLE, w.DWORD, ctypes.POINTER(w.HANDLE)]
    adv.GetTokenInformation.argtypes = [w.HANDLE, ctypes.c_int, w.LPVOID, w.DWORD, ctypes.POINTER(w.DWORD)]
    adv.ConvertSidToStringSidW.argtypes = [w.LPVOID, ctypes.POINTER(w.LPWSTR)]
    adv.ConvertStringSecurityDescriptorToSecurityDescriptorW.argtypes = [w.LPCWSTR, w.DWORD, ctypes.POINTER(w.LPVOID), ctypes.POINTER(w.DWORD)]
    adv.SetFileSecurityW.argtypes = [w.LPCWSTR, w.DWORD, w.LPVOID]
    kernel.GetCurrentProcess.restype = w.HANDLE
    kernel.CloseHandle.argtypes = [w.HANDLE]
    kernel.LocalFree.argtypes = [w.LPVOID]
    kernel.LocalFree.restype = w.LPVOID
    token, sid_text, descriptor = w.HANDLE(), w.LPWSTR(), w.LPVOID()
    try:
        if not adv.OpenProcessToken(kernel.GetCurrentProcess(), 8, ctypes.byref(token)):
            raise TransferError('无法建立私密输出 ACL')
        length = w.DWORD()
        adv.GetTokenInformation(token, 1, None, 0, ctypes.byref(length))
        if not length.value:
            raise TransferError('无法读取当前身份以保护输出')
        buffer = ctypes.create_string_buffer(length.value)
        if not adv.GetTokenInformation(token, 1, buffer, length, ctypes.byref(length)):
            raise TransferError('无法读取当前身份以保护输出')
        sid = ctypes.cast(buffer, ctypes.POINTER(w.LPVOID))[0]
        if not adv.ConvertSidToStringSidW(sid, ctypes.byref(sid_text)):
            raise TransferError('无法建立私密输出 ACL')
        sddl = f'D:P(A;OICI;FA;;;{sid_text.value})'
        if not adv.ConvertStringSecurityDescriptorToSecurityDescriptorW(sddl, 1, ctypes.byref(descriptor), None):
            raise TransferError('无法建立私密输出 ACL')
        if not adv.SetFileSecurityW(str(path), 0x80000004, descriptor):
            raise TransferError('无法限制私密输出 ACL')
    finally:
        if descriptor:
            kernel.LocalFree(descriptor)
        if sid_text:
            kernel.LocalFree(ctypes.cast(sid_text, w.LPVOID))
        if token:
            kernel.CloseHandle(token)


def private_directory(path):
    parent = checked_path(path.parent, directory=True)
    path = parent / path.name
    path.mkdir(mode=0o700, exist_ok=False)
    if os.name == 'nt':
        _windows_private_acl(path)
    else:
        os.chmod(path, 0o700)
    return path


def private_write(path, content):
    fd = os.open(path, os.O_WRONLY | os.O_CREAT | os.O_EXCL | getattr(os, 'O_BINARY', 0), 0o600)
    with os.fdopen(fd, 'wb') as stream:
        stream.write(content)
        stream.flush()
        os.fsync(stream.fileno())


def prepare(database, artifacts, output):
    """返回数量摘要；private.sql 与 manifest.json 不得分享或提交 Git。"""
    database = checked_path(database)
    root = checked_path(artifacts, directory=True)
    output = Path(os.path.abspath(os.fspath(output)))
    checked_path(output.parent, directory=True)
    if os.path.lexists(output):
        raise TransferError('输出必须为尚不存在的新目录')
    if output.is_relative_to(root):
        raise TransferError('输出不能位于不可变产物根目录')
    source = ReadOnlySource()
    exported, files = [], []
    source_counts, excluded_counts, counts, excluded_fields = Counter(), Counter(), Counter(), Counter()
    version_status_counts = Counter()
    source_digest = hashlib.sha256()
    with closing(sqlite3.connect(database.as_uri() + '?mode=ro', uri=True, isolation_level=None)) as db:
        try:
            db.execute('PRAGMA query_only=ON')
            db.execute('PRAGMA trusted_schema=OFF')
            db.execute('BEGIN')
            tables = {name for name, in db.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")}
            if 'records' not in tables:
                raise TransferError('源数据库缺少 records 表')
            for position, kind, key, raw in db.execute('SELECT rowid,kind,id,data FROM records ORDER BY kind,id'):
                if not all(isinstance(value, str) for value in (kind, key, raw)):
                    raise TransferError('无效源记录类型')
                for value in (kind, key, raw):
                    encoded = value.encode('utf-8')
                    source_digest.update(len(encoded).to_bytes(8, 'big') + encoded)
                source_counts[kind] += 1
                if kind.lower() in EXCLUDED_KINDS:
                    excluded_counts[kind] += 1
                    continue
                row = json.loads(raw)
                if not isinstance(row, dict) or row.get('id') != key:
                    raise TransferError('源记录 ID 或 JSON 结构不一致')
                cleaned = clean_record(kind, row, excluded_fields)
                if kind == 'artifacts':
                    files.extend(artifact_files(source, db, key, root))
                if kind == 'versions':
                    version_status_counts[str(row.get('status', 'unknown'))] += 1
                exported.append((position, kind, key, json.dumps(cleaned, ensure_ascii=True, sort_keys=True, separators=(',', ':'), allow_nan=False)))
                counts[kind] += 1
            excluded_tables = {}
            for name in sorted(tables - {'records'}):
                identifier = '"' + name.replace('"', '""') + '"'
                excluded_tables[name] = db.execute(f'SELECT COUNT(*) FROM {identifier}').fetchone()[0]
        finally:
            db.rollback()
    # 不复制在线 SQLite/WAL。源 hash 为同一只读事务的原始 records 长度前缀摘要。
    sql = [
        'CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(kind,id));',
        'CREATE TABLE IF NOT EXISTS credentials (token_hash TEXT PRIMARY KEY,tool_id TEXT NOT NULL);',
        'CREATE TABLE IF NOT EXISTS artifact_files (artifact_id TEXT NOT NULL,path TEXT NOT NULL,object_key TEXT NOT NULL UNIQUE,sha256 TEXT NOT NULL,bytes INTEGER NOT NULL,PRIMARY KEY(artifact_id,path));',
        'CREATE TABLE __cloudflare_transfer_empty_guard (empty INTEGER NOT NULL CHECK(empty=1));',
        'INSERT INTO __cloudflare_transfer_empty_guard(empty) SELECT CASE WHEN EXISTS(SELECT 1 FROM records) OR EXISTS(SELECT 1 FROM credentials) OR EXISTS(SELECT 1 FROM artifact_files) THEN 0 ELSE 1 END;',
        'DROP TABLE __cloudflare_transfer_empty_guard;',
    ]
    # 原 Store.all 按 rowid 倒序读取；插入顺序保留原始历史先后。
    sql.extend('INSERT INTO records(kind,id,data) VALUES (' + ','.join(sql_quote(value) for value in row[1:]) + ');'
               for row in sorted(exported))
    sql.extend('INSERT INTO artifact_files(artifact_id,path,object_key,sha256,bytes) VALUES (' +
               ','.join(sql_quote(row[key]) for key in ('artifact_id', 'path', 'object_key', 'sha256')) + f",{row['bytes']});" for row in files)
    sql_bytes = ('\n'.join(sql) + '\n').encode('utf-8')
    manifest = {
        'schema_version': SCHEMA_VERSION, 'private': True,
        'scope': 'registered-artifact-files-and-records',
        'not_included': ['git-working-library', 'runs/checkpoints', 'backup-archives',
                         'unregistered-artifact-files-including-runtime'],
        'coverage': {'file_selection': 'database-registered-files-only', 'unregistered_files_scanned': False,
                     'warning': '仅包含数据库登记文件与清理后的记录，不代表整个服务器迁移完成；未登记 runtime/** 不采集也不检查'},
        'object_namespace': OBJECT_NAMESPACE, 'object_mode': 'source_path',
        'source': {'database': database.as_posix(), 'artifacts': root.as_posix(),
                   'hash_algorithm': 'sha256-records-length-prefixed-utf8-kind-id-data-order-by-kind-id',
                   'sha256': source_digest.hexdigest()},
        'counts': {'source_kinds': dict(source_counts), 'kinds': dict(counts),
                   'excluded_kinds': dict(excluded_counts), 'excluded_tables': excluded_tables,
                   'excluded_fields': dict(excluded_fields), 'version_statuses': dict(version_status_counts),
                   'records': len(exported), 'files': len(files), 'bytes': sum(row['bytes'] for row in files)},
        'sql': {'path': 'private.sql', 'sha256': hashlib.sha256(sql_bytes).hexdigest(),
                'requires_empty_target': True, 'requires_exclusive_import': True,
                'stop_on_first_error': True},
        'upload': {'endpoint_contract': 'PUT /api/executor/artifacts/<artifact_id>/files/<encoded_path>',
                   'max_file_bytes': MAX_UPLOAD_BYTES, 'lease_contract': 'pre-registered-artifact-copy-only',
                   'authorization': {'type': 'bearer-migration-token', 'server_binding': 'MIGRATION_UPLOAD_TOKEN',
                                     'task_lease': False},
                   'requires_registered_bytes_match': True,
                   'headers': ['Authorization', 'Content-Length', 'X-Content-SHA256', 'X-Object-Key', 'Idempotency-Key'],
                   'requires_registered_hash_match': True, 'requires_immutable_object': True},
        'files': files,
    }
    output = private_directory(output)
    private_write(output / 'private.sql', sql_bytes)
    # 清单最后写入；没有完整清单的目录不可导入，也不覆盖失败现场。
    private_write(output / 'manifest.json', (json.dumps(manifest, ensure_ascii=True, indent=2, allow_nan=False) + '\n').encode('utf-8'))
    return {'records': len(exported), 'files': len(files), 'bytes': manifest['counts']['bytes'],
            'excluded_records': sum(excluded_counts.values()), 'excluded_table_rows': sum(excluded_tables.values())}


def upload_target(url, artifact_id, path, allow_loopback=False):
    safe_artifact_id(artifact_id)
    safe_path(path)
    if not isinstance(url, str) or any(ord(c) <= 32 or ord(c) == 127 for c in url) or '\\' in url:
        raise TransferError('无效上传地址')
    try:
        parts = urlsplit(url)
        host, port = parts.hostname, parts.port
        if not host or parts.username is not None or parts.password is not None or parts.query or parts.fragment or parts.path not in ('', '/'):
            raise TransferError('上传地址只能为无凭据、无查询的服务根地址')
        if port is not None and not 1 <= port <= 65535:
            raise TransferError('无效上传端口')
        try:
            loopback = ipaddress.ip_address(host).is_loopback
        except ValueError:
            loopback = host.lower() == 'localhost'
        if parts.scheme not in ('http', 'https') or (parts.scheme != 'https' and not (allow_loopback and loopback)):
            raise TransferError('上传必须使用 HTTPS；隔离回环 HTTP 需要 --allow-loopback')
        if parts.scheme == 'http' and host.lower() == 'localhost':
            host = '127.0.0.1'
        target = '/api/executor/artifacts/' + quote(artifact_id, safe='') + '/files/' + quote(path, safe='/')
        return parts.scheme, host, port, target
    except ValueError as exc:
        if isinstance(exc, TransferError):
            raise
        raise TransferError('无效上传地址') from None


def read_token(token_file):
    with checked_open(token_file) as stream:
        data = stream.read(8193)
    if len(data) > 8192:
        raise TransferError('令牌文件超限')
    try:
        token = data.decode('ascii').strip()
    except UnicodeError:
        raise TransferError('令牌文件格式无效') from None
    if not re.fullmatch(r'[A-Za-z0-9._~+/-]+=*', token):
        raise TransferError('令牌文件格式无效')
    return token


def upload_file(url, artifact_id, path, file, token_file, *, allow_loopback=False):
    """独立迁移 token 仅复制预登记不可变文件；最多重试一次，非任务租约。"""
    scheme, host, port, target = upload_target(url, artifact_id, path, allow_loopback)
    file = checked_path(file)
    safe_path(file.name)
    token_path = checked_path(token_file)
    if os.path.samefile(file, token_path) or file.name.lower() == 'private.sql' or (file.parent / 'private.sql').exists():
        raise TransferError('拒绝上传令牌文件或私密数据库导出')
    if file.stat().st_size > MAX_UPLOAD_BYTES:
        raise TransferError('单文件超过 64 MiB；分块协议尚未实现，拒绝上传')
    token = read_token(token_file)
    key = object_key(artifact_id, path)
    idem = hashlib.sha256(key.encode('utf-8')).hexdigest()
    with checked_open(file) as stream:
        digest, size = hash_stream(stream)
        if size > MAX_UPLOAD_BYTES:
            raise TransferError('单文件超过 64 MiB；拒绝上传')
        for attempt in range(2):
            stream.seek(0)
            connection = (http.client.HTTPSConnection(host, port, timeout=60, context=ssl.create_default_context())
                          if scheme == 'https' else http.client.HTTPConnection(host, port, timeout=60))
            try:
                connection.putrequest('PUT', target)
                for name, value in {'Authorization': 'Bearer ' + token, 'Content-Type': 'application/octet-stream',
                                    'Content-Length': str(size), 'X-Content-SHA256': digest,
                                    'X-Object-Key': quote(key, safe='/'), 'Idempotency-Key': idem}.items():
                    connection.putheader(name, value)
                connection.endheaders()
                sent_digest = hashlib.sha256()
                remaining = size
                while remaining:
                    chunk = stream.read(min(CHUNK_BYTES, remaining))
                    if not chunk:
                        raise TransferError('上传期间文件缩短')
                    sent_digest.update(chunk)
                    connection.send(chunk)
                    remaining -= len(chunk)
                if stream.read(1) or sent_digest.hexdigest() != digest:
                    raise TransferError('上传期间文件变化；不得认定成功')
                response = connection.getresponse()
                status = response.status
                # 不解析或回显服务端正文，也不跟随重定向发送 Bearer。
                if 200 <= status < 300:
                    result = {'files': 1, 'bytes': size, 'attempts': attempt + 1}
                    break
                if status in (408, 429, 500, 502, 503, 504) and attempt == 0:
                    continue
                raise TransferError(f'上传被拒绝（HTTP {status}）；未验证远端下载或验收')
            except (OSError, http.client.HTTPException):
                if attempt == 0:
                    continue
                raise TransferError('上传网络失败；至多重试一次，不回显凭据或响应') from None
            finally:
                connection.close()
        else:
            raise TransferError('上传未完成')
    # checked_open 的退出校验也必须通过，HTTP 2xx 不能越过本地一致性检查。
    return result


class PrivateArgumentParser(argparse.ArgumentParser):
    def __init__(self, *args, **kwargs):
        kwargs['allow_abbrev'] = False
        kwargs['add_help'] = False
        super().__init__(*args, **kwargs)
        self.add_argument('-h', '--help', action='help', help='查看帮助并退出')
        self._optionals.title = '选项'
        self._positionals.title = '位置参数'

    def error(self, message):
        # argparse 的默认错误会回显未知 argv；禁止意外回显 --token 等输入。
        self.print_usage(sys.stderr)
        self.exit(2, '参数无效；使用 --help 查看契约，令牌只允许 --token-file。\n')


def main(argv=None):
    parser = PrivateArgumentParser(description='私密只读迁移；不部署、不读取服务密钥，不可分享输出')
    commands = parser.add_subparsers(dest='command', required=True, parser_class=PrivateArgumentParser)
    prep = commands.add_parser('prepare', help='读取显式指定 SQLite 与登记产物，输出私密 SQL/清单')
    for name in ('database', 'artifacts', 'output'):
        prep.add_argument('--' + name, required=True)
    upload = commands.add_parser('upload-file', help='独立迁移 Bearer PUT，仅复制 D1 预登记不可变文件',
                                 description='--token-file 提供与服务端 MIGRATION_UPLOAD_TOKEN 对应的独立迁移令牌，不使用任务租约；D1 必须已登记 SHA-256/bytes，远端联调由 main 验证')
    for name in ('url', 'artifact-id', 'path', 'file'):
        upload.add_argument('--' + name, required=True)
    upload.add_argument('--token-file', required=True, help='独立迁移 Bearer 令牌文件，禁止通过参数提供令牌值')
    upload.add_argument('--allow-loopback', action='store_true', help='仅允许隔离测试的回环 HTTP')
    args = parser.parse_args(argv)
    try:
        if args.command == 'prepare':
            result = prepare(args.database, args.artifacts, args.output)
        else:
            result = upload_file(args.url, args.artifact_id, args.path, args.file, args.token_file,
                                 allow_loopback=args.allow_loopback)
        print(json.dumps(result, ensure_ascii=True, sort_keys=True))
        return 0
    except TransferError as exc:
        print(str(exc), file=sys.stderr)
    except (OSError, sqlite3.Error, ValueError, http.client.HTTPException):
        print('迁移失败；检查输入结构、文件权限或网络，私密内容不回显。', file=sys.stderr)
    return 1


if __name__ == '__main__':
    sys.exit(main())

"""Acceptance-triggered supply outbox. No historical approvals are auto-enrolled."""
import hashlib
import hmac
import json
import os
from pathlib import Path
import re
import secrets
import shutil
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
import zipfile
from html.parser import HTMLParser
from .store import now
from .repository import safe_relative
from .supply_config import settings as supply_settings, readiness

PREFIX = '/v0.1/apecv/gameagent/supply/open'
TERMINAL = {'published', 'rejected', 'failed', 'canceled', 'needs_your_fix'}
INTERVAL = {'queued': 300, 'received': 300, 'analyzing': 60, 'building': 60,
            'awaiting_platform_review': 1800, 'template_ready': 1800, 'certifying': 1800}
CONFIG_KEYS = ('SUPPLY_PLATFORM_BASE', 'SUPPLY_APP_ID', 'SUPPLY_APP_SECRET',
               'SUPPLY_ARCHIVE_DIR', 'SUPPLY_ARCHIVE_BASE_URL')
ERROR_TEXT = {
    'FINGERPRINT_REQUIRED': '请填写下游管理页提供的授权码指纹后检查服务',
    'FINGERPRINT_MISMATCH': '授权码与管理页指纹不一致，请核对服务配置',
    'SIGNATURE_SELFTEST_FAILED': '供货签名自检失败，请检查协议实现',
    'LICENSE_UNDECLARED': '缺少可分发授权和权利人，请核实后补充供货资料',
    'CONFIG_REQUIRED': '尚未配置下游凭据或 HTTPS 包分发目录，请配置服务端后重试',
    'NO_ENTRY_HTML': '供货包根目录缺少 index.html，请修复后提交新版本',
    'TOOLCHAIN_UNSUPPORTED': '包中存在构建源码、哈希文件名或不支持的引擎产物，请交付静态网页版本',
    'ARCHIVE_UNSAFE': '包内文件、路径或解压大小不符合要求，请检查后提交新版本',
    'SUBMISSION_PAYLOAD_CHANGED': '原提交内容发生变化，请恢复原提交内容或交付新版本',
    'EXTERNAL_DEPENDENCY': '运行入口依赖外部服务或网络资源，请整理为随包静态资源后交付新版本',
    'MISSING_LOCAL_RESOURCE': 'HTML 入口引用的本地资源不存在，请补齐后交付新版本',
    'NESTED_ARCHIVE': '当前是嵌套运行包，请将真实静态运行目录整理为根入口后交付',
}


def configuration():
    return readiness()

def preflight(config):
    secret='0123456789abcdef'*4
    expected='e97806d91bb849a7ceceb913eab5303df903f2ae62dc3eec2a4a7dd0bee7a560'
    actual=signature(secret,'sup_0123456789abcdef','1760000000','nonce000000000000000001','POST',PREFIX+'/extraction/submit',b'{"submission_id":"demo-0000000000000001"}')
    if actual!=expected:raise SupplyError('SIGNATURE_SELFTEST_FAILED',400)
    fingerprint=config.get('SUPPLY_EXPECTED_FINGERPRINT','')
    if not fingerprint:raise SupplyError('FINGERPRINT_REQUIRED',400)
    if not hmac.compare_digest(fingerprint,hashlib.sha256(config['SUPPLY_APP_SECRET'].encode()).hexdigest()[:12]):raise SupplyError('FINGERPRINT_MISMATCH',400)
    return {'signature_selftest':'passed','fingerprint_matches':True}


def signature(secret, app_id, timestamp, nonce, method, path, body):
    text = '\n'.join((app_id, timestamp, nonce, method.upper(), path, hashlib.sha256(body).hexdigest()))
    return hmac.new(secret.encode(), text.encode(), hashlib.sha256).hexdigest()


class SupplyError(Exception):
    def __init__(self, code, status=0, retry_after=300):
        super().__init__(code)
        self.code, self.status, self.retry_after = code, status, retry_after


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def call(method, route, payload=None, query=None):
    config = supply_settings()
    base = config['SUPPLY_PLATFORM_BASE'].rstrip('/')
    parsed = urllib.parse.urlsplit(base)
    if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.query or parsed.fragment or parsed.path not in ('', '/'):
        raise SupplyError('INVALID_PLATFORM_URL', 400)
    app, secret = config['SUPPLY_APP_ID'], config['SUPPLY_APP_SECRET']
    qs = urllib.parse.urlencode(sorted((k, str(v)) for k, v in (query or {}).items() if str(v)))
    if method=='POST' and query:raise SupplyError('QUERY_INVALID',400)
    path = PREFIX + '/' + route + (('?' + qs) if qs else '')
    body = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).encode() if payload is not None else b''
    if len(body)>1024*1024:raise SupplyError('PARAM_INVALID',400)
    ts, nonce = str(int(time.time())), secrets.token_hex(16)
    headers = {'Content-Type': 'application/json', 'X-Supply-App-Id': app,
               'X-Supply-Timestamp': ts, 'X-Supply-Nonce': nonce,
               'X-Supply-Signature': signature(secret, app, ts, nonce, method, path, body)}
    req = urllib.request.Request(base + path, data=body if method == 'POST' else None, method=method, headers=headers)
    try:
        with urllib.request.build_opener(NoRedirect).open(req, timeout=330 if route == 'extraction/submit' else 30) as response:
            result = json.load(response)
            if not isinstance(result, dict):
                raise SupplyError('INVALID_RESPONSE', 502)
            return result
    except urllib.error.HTTPError as exc:
        # Never persist raw response/request URLs, signatures or authorization material.
        code, retry = 'HTTP_' + str(exc.code), 300
        try:
            detail = json.loads(exc.read(65536))
            message = detail.get('Message') or detail.get('message') or ''
            inner = re.search(r'\{.*\}', message, re.S)
            if inner:
                detail = json.loads(inner[0])
            code = str(detail.get('code') or code)
            retry = max(30, min(86400, int(detail.get('retry_after', 300))))
        except (ValueError, TypeError, AttributeError):
            pass
        raise SupplyError(code if re.fullmatch(r'[A-Z0-9_]{1,80}', code) else 'HTTP_ERROR', exc.code, retry) from None
    except (urllib.error.URLError, TimeoutError, OSError, ValueError):
        raise SupplyError('NETWORK_OR_RESPONSE_ERROR') from None


def enqueue(store, db, version):
    existing = store.get(db, 'supply', version['id'])
    if existing:
        return existing
    return store.put(db, 'supply', dict(id=version['id'], version_id=version['id'],
        candidate_id=version['candidate_id'], submission_id='supply-' + secrets.token_hex(16),
        status='pending', notice='功能验收通过，等待供货检查与自动推送',
        next_action='none', created_at=now(), updated_at=now(), next_poll=0,
        metadata=version.get('report', {}).get('supply', {}), attempts=0, issues=[]))


def public(row):
    return {k: v for k, v in row.items() if k not in ('metadata', 'lease_until', 'lease_token', 'archive_path')}


class ResourceReferences(HTMLParser):
    def __init__(self):
        super().__init__()
        self.urls = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag in ('script', 'img', 'iframe', 'audio', 'video', 'source', 'embed', 'input'):
            self.urls.append(attrs.get('src', ''))
        if tag == 'link' and attrs.get('rel', '').lower() in ('stylesheet', 'preload', 'modulepreload'):
            self.urls.append(attrs.get('href', ''))


def inspect_source(source):
    source = Path(source).resolve()
    if not source.is_dir() or not (source/'index.html').is_file():
        raise SupplyError('NO_ENTRY_HTML', 422)
    files, total = [], 0
    for item in sorted(source.rglob('*')):
        if item.is_symlink():
            raise SupplyError('ARCHIVE_UNSAFE', 422)
        if not item.is_file():
            continue
        rel = item.relative_to(source).as_posix()
        try:
            safe_relative(rel)
        except ValueError:
            raise SupplyError('ARCHIVE_UNSAFE', 422) from None
        if item.suffix.lower() in ('.exe', '.dll', '.sh', '.bat', '.cmd', '.ps1', '.py', '.php', '.com', '.msi'):
            raise SupplyError('ARCHIVE_UNSAFE', 422)
        if item.suffix.lower() in ('.zip', '.7z', '.rar', '.tar'):
            raise SupplyError('NESTED_ARCHIVE', 422)
        if (item.suffix.lower() in ('.ts', '.tsx', '.jsx', '.vue', '.wasm', '.pck', '.unityweb')
                or (re.search(r'(?:^|[.-])[0-9a-f]{8,}(?:[.-]|$)', item.name, re.I)
                    and not (item.suffix.lower()=='.json' and rel.startswith(('verification/','evidence/'))))
                or item.name.lower() in ('package.json', 'godot.js')
                or '.framework.js' in item.name or '.loader.js' in item.name):
            raise SupplyError('TOOLCHAIN_UNSUPPORTED', 422)
        if item.suffix.lower() in ('.html', '.htm'):
            parser = ResourceReferences()
            parser.feed(item.read_text(encoding='utf-8', errors='replace'))
            for url in parser.urls:
                if not url or url.startswith(('#', 'data:', 'blob:')):
                    continue
                parts = urllib.parse.urlsplit(url)
                if parts.scheme or parts.netloc or parts.path.startswith('/'):
                    raise SupplyError('EXTERNAL_DEPENDENCY', 422)
                resource = (item.parent/urllib.parse.unquote(parts.path)).resolve()
                if not resource.is_relative_to(source) or not resource.is_file():
                    raise SupplyError('MISSING_LOCAL_RESOURCE', 422)
        total += item.stat().st_size
        files.append((item, rel))
        if total > 500_000_000 or len(files) > 2000:
            raise SupplyError('ARCHIVE_UNSAFE', 422)
    from .resource_audit import audit
    references=audit(source)
    if references['missing']:raise SupplyError('MISSING_LOCAL_RESOURCE',422)
    if references['external']:raise SupplyError('EXTERNAL_DEPENDENCY',422)
    return files, total


def build_archive(source,destination):
    from .supply_prepare import prepared
    try:
        with prepared(source) as target:return _build_archive(target,destination)
    except ValueError:raise SupplyError('RESOURCE_PREPARATION_FAILED',422) from None

def _build_archive(source, destination):
    files, _ = inspect_source(source)
    destination = Path(destination)
    destination.parent.mkdir(parents=True, exist_ok=True)
    temp = destination.with_suffix('.tmp')
    try:
        with zipfile.ZipFile(temp, 'w', zipfile.ZIP_DEFLATED) as archive:
            for item, rel in files:
                # Stable bytes on retry; metadata timestamps must not change the hash.
                info = zipfile.ZipInfo(rel, (2020, 1, 1, 0, 0, 0))
                info.compress_type = zipfile.ZIP_DEFLATED
                archive.writestr(info, item.read_bytes())
        if temp.stat().st_size > 100_000_000:
            raise SupplyError('ARCHIVE_TOO_LARGE', 413)
        temp.replace(destination)
    finally:
        temp.unlink(missing_ok=True)
    with destination.open('rb') as stream:
        return hashlib.file_digest(stream, 'sha256').hexdigest()


class SupplyWorker:
    def __init__(self, service, client=call):
        self.service, self.client = service, client
        self.stop = threading.Event()
        self.checked_config = None

    def start(self):
        self.thread = threading.Thread(target=self.run, daemon=True)
        self.thread.start()

    def close(self):
        self.stop.set()

    def run(self):
        while not self.stop.is_set():
            try:
                self.tick()
            except Exception:
                # No credentials or signed download addresses in logs.
                pass
            self.stop.wait(10)

    def tick(self):
        store = self.service.store
        with store.tx() as db:
            if (store.get(db,'settings','maintenance') or {}).get('draining'):return
            row = next((r for r in store.all(db, 'supply')
                        if r['status'] not in ('blocked', 'done') and r.get('next_poll', 0) <= time.time()
                        and r.get('lease_until', 0) <= time.time()), None)
            if not row:
                return
            row.update(lease_until=time.time()+900, lease_token=secrets.token_hex(16))
            store.put(db, 'supply', row)
            version = self.service.get(db, 'versions', row['version_id'])
            candidate = self.service.get(db, 'candidates', row['candidate_id'])
        lease = row['lease_token']
        previous_status = (row.get('status'), row.get('state'), row.get('error_code'))
        try:
            config = supply_settings()
            if row.get('destination_key'):
                destination_key = hashlib.sha256((str(config.get('SUPPLY_PLATFORM_BASE'))+'\n'+str(config.get('SUPPLY_APP_ID'))).encode()).hexdigest()
                if destination_key != row['destination_key']:
                    raise SupplyError('DOWNSTREAM_TARGET_CHANGED', 409)
            if not row.get('submitted'):
                meta = row.get('metadata') or {}
                license = meta.get('license_declaration') or {}
                if license.get('distributable') != 'yes' or not str(license.get('owner', '')).strip():
                    raise SupplyError('LICENSE_UNDECLARED', 422)
                required = CONFIG_KEYS
                config = supply_settings()
                if not readiness()['configured']:
                    raise SupplyError('CONFIG_REQUIRED', 400)
                row['preflight']=preflight(config)
                config_digest = hashlib.sha256(('\n'.join(config[k] for k in required)+'\n'+config.get('SUPPLY_EXPECTED_FINGERPRINT','')).encode()).hexdigest()
                if self.checked_config != config_digest:
                    identity = self.client('GET', 'whoami')
                    if identity.get('app_id') != config['SUPPLY_APP_ID']:
                        raise SupplyError('SUPPLIER_IDENTITY_MISMATCH', 403)
                    self.checked_config = config_digest
                base = config['SUPPLY_ARCHIVE_BASE_URL'].rstrip('/')
                parsed = urllib.parse.urlsplit(base)
                if parsed.scheme != 'https' or not parsed.hostname or parsed.username or parsed.query or parsed.fragment:
                    raise SupplyError('INVALID_ARCHIVE_URL', 400)
                if not 1 <= len(candidate['title']) <= 40:
                    raise SupplyError('GAME_NAME_INVALID', 422)
                source = (self.service.repo.root/version['source_directory']).resolve()
                if not source.is_relative_to(self.service.repo.root):
                    raise SupplyError('ARCHIVE_UNSAFE', 422)
                archive = self.service.data_dir/'supply'/f"{row['submission_id']}.zip"
                digest = build_archive(source, archive)
                if row.get('archive_sha256') and row['archive_sha256'] != digest:
                    raise SupplyError('IMMUTABLE_VERSION_CHANGED', 409)
                # Persist digest before outbound I/O so unknown submit outcomes remain idempotent.
                row['archive_sha256'] = digest
                with store.tx() as db:
                    store.put(db, 'supply', row)
                target = Path(config['SUPPLY_ARCHIVE_DIR'])/archive.name
                target.parent.mkdir(parents=True, exist_ok=True)
                if target.resolve() != archive.resolve():
                    if target.exists() and hashlib.sha256(target.read_bytes()).hexdigest() != digest:
                        raise SupplyError('ARCHIVE_TARGET_CONFLICT', 409)
                    staging = target.with_suffix('.tmp')
                    shutil.copyfile(archive, staging)
                    staging.replace(target)
                payload = dict(submission_id=row['submission_id'], archive_url=base+'/'+archive.name,
                               archive_sha256=digest, game_name=candidate['title'], license_declaration=license)
                for field in ('acceptance_steps', 'known_limitations', 'contact_note'):
                    if meta.get(field):
                        payload[field] = meta[field]
                payload_digest = hashlib.sha256(json.dumps(payload, sort_keys=True, ensure_ascii=False).encode()).hexdigest()
                if row.get('payload_sha256') and row['payload_sha256'] != payload_digest:
                    raise SupplyError('SUBMISSION_PAYLOAD_CHANGED', 409)
                row['payload_sha256'] = payload_digest
                row['destination_key'] = hashlib.sha256((config['SUPPLY_PLATFORM_BASE']+'\n'+config['SUPPLY_APP_ID']).encode()).hexdigest()
                with store.tx() as db:
                    store.put(db, 'supply', row)
                result = self.client('POST', 'extraction/submit', payload=payload)
                if result.get('submission_id') != row['submission_id'] or not result.get('state'):
                    raise SupplyError('INVALID_SUBMIT_RESPONSE', 502)
                row['submitted'] = True
            else:
                result = self.client('GET', 'extraction/status', query={'submission_id': row['submission_id']})
                if result.get('submission_id') != row['submission_id'] or not result.get('state'):
                    raise SupplyError('INVALID_STATUS_RESPONSE', 502)
                issues = self.client('GET', 'extraction/issues', query={'submission_id': row['submission_id'],
                    'since_seq': str(row.get('max_seq', 0) if row.get('revision') == result.get('revision') else 0), 'limit': '200'})
                if issues.get('revision') != row.get('revision'):
                    row['issues'] = []
                combined = {i['seq']: i for i in row.get('issues', [])}
                combined.update({i['seq']: i for i in issues.get('items', [])})
                row.update(issues=list(combined.values()), max_seq=max(combined, default=0),
                           revision=issues.get('revision'))
                row['issues_complete'] = len(combined) >= issues.get('total', len(combined))
            for key in ('state', 'state_text', 'next_action', 'notice', 'queue_position', 'extraction_id', 'template', 'percent'):
                if key in result:
                    row[key] = result[key]
            row.update(status='done' if result['state'] in TERMINAL and row.get('issues_complete') else 'tracking',
                       next_poll=time.time()+INTERVAL.get(result['state'], 60), error_code='')
        except SupplyError as exc:
            retry = exc.status == 0 or exc.status >= 500 or exc.status == 429
            row.update(status='retrying' if retry else 'blocked', error_code=exc.code,
                       notice=('自动重试：' if retry else '供货阻塞：')+ERROR_TEXT.get(exc.code, exc.code),
                       next_action='none' if retry else 'supplier', next_poll=time.time()+exc.retry_after)
        except Exception:
            row.update(status='blocked', error_code='LOCAL_PREPARATION_ERROR',
                       notice='供货准备失败，请检查版本目录和服务端分发配置', next_action='supplier')
        row.update(updated_at=now(), attempts=row.get('attempts', 0)+1, lease_until=0)
        with store.tx() as db:
            current = store.get(db, 'supply', row['id'])
            if current and current.get('lease_token') == lease:
                store.put(db, 'supply', row)
                if previous_status != (row.get('status'), row.get('state'), row.get('error_code')):
                    store.event(db, '下游供货状态更新', job_id=version.get('job_id'), stage='supply',
                                version_id=version['id'], submission_id=row['submission_id'],
                                supply_status=row['status'], downstream_state=row.get('state'),
                                error_code=row.get('error_code', ''))

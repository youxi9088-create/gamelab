"""Acceptance-triggered supply outbox. No historical approvals are auto-enrolled."""
import hashlib
import hmac
import ipaddress
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
import zlib
import logging
from html.parser import HTMLParser
from .store import now
from .repository import safe_relative
from .supply_config import settings as supply_settings, readiness
from .supply_preparation import PACKAGE_CHECK_REVISION, needs_package_recheck

PREFIX = '/v0.1/apecv/gameagent/supply/open'
TERMINAL = {'published', 'rejected', 'failed', 'canceled', 'needs_your_fix'}
INTERVAL = {'queued': 300, 'received': 300, 'analyzing': 60, 'building': 60,
            'awaiting_platform_review': 60, 'template_ready': 300, 'certifying': 300}
STATUS_SYNC_REVISION='template-supply-client-1.0.1-20261103-config-recovery'
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
    'SECRET_IN_CODE':'供货包发现疑似口令或密钥；请按文件和行号核查，不自动删除或绕过',
    'ARCHIVE_DISTRIBUTION_FAILED':'供货包上传或免登录回下载核验失败，保留原提交编号重试',
    'DOWNLOAD_HASH_MISMATCH':'分发下载字节与本地ZIP摘要不一致，禁止提交',
    'EXTERNAL_REQUEST_REJECTED':'代码仍有外部请求，须本地化真实资源或整理外部服务调用；不能只依赖运行时拦截',
    'CONFIG_FILE_UNREADABLE':'供货进程无法读取配置，请核对服务账号读取权限',
    'CONFIG_FILE_INVALID':'供货配置无法解析，请检查原子写入及文件内容',
    'DOWNSTREAM_TARGET_CHANGED':'当前下游地址或供应方身份与原提交不符，不能自动改投其他目标',
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
    def __init__(self, code, status=0, retry_after=300, details=None):
        super().__init__(code)
        self.code, self.status, self.retry_after = code, status, retry_after
        self.details=details or []


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, *args, **kwargs):
        return None


def call(method, route, payload=None, query=None, *, config=None):
    config = supply_settings() if config is None else config
    if config.get('_config_error'):raise SupplyError(config['_config_error'],503)
    base = config['SUPPLY_PLATFORM_BASE'].rstrip('/')
    parsed = urllib.parse.urlsplit(base)
    lan_http = False
    if config.get('SUPPLY_ALLOW_LAN_HTTP') is True and parsed.scheme == 'http':
        try:
            address = ipaddress.ip_address(parsed.hostname)
            lan_http = any(address in ipaddress.ip_network(net) for net in ('10.0.0.0/8','172.16.0.0/12','192.168.0.0/16'))
        except ValueError:
            pass
    if (parsed.scheme != 'https' and not lan_http) or not parsed.hostname or parsed.username or parsed.query or parsed.fragment or parsed.path not in ('', '/'):
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
        opener=urllib.request.build_opener(urllib.request.ProxyHandler({}),NoRedirect()) if lan_http else urllib.request.build_opener(NoRedirect())
        with opener.open(req, timeout=330 if route == 'extraction/submit' else 30) as response:
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
    from .supply_metadata import metadata_for
    return store.put(db, 'supply', dict(id=version['id'], version_id=version['id'],
        candidate_id=version['candidate_id'], submission_id='supply-' + secrets.token_hex(16),
        status='pending', notice='功能验收通过，等待供货检查与自动推送',
        next_action='none', created_at=now(), updated_at=now(), next_poll=0,
        metadata=metadata_for(store,db,version), attempts=0, issues=[]))


def public(row):
    from .supply_preparation import recovery
    return {**{k: v for k, v in row.items() if k not in ('metadata', 'lease_until', 'lease_token', 'archive_path','archive_url')},'recovery':recovery(row)}


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
            reason=('unsupported_engine_binary' if item.suffix.lower() in ('.wasm','.pck','.unityweb') else
                    'build_source' if item.suffix.lower() in ('.ts','.tsx','.jsx','.vue') or item.name.lower()=='package.json' else
                    'engine_loader' if item.name.lower()=='godot.js' or '.framework.js' in item.name or '.loader.js' in item.name else 'hash_filename')
            raise SupplyError('TOOLCHAIN_UNSUPPORTED', 422, details=[{'file':rel,'reason':reason}])
        if item.suffix.lower() in ('.html', '.htm'):
            parser = ResourceReferences()
            parser.feed(item.read_text(encoding='utf-8', errors='replace'))
            for url in parser.urls:
                if not url or url.startswith(('#', 'data:', 'blob:')):
                    continue
                parts = urllib.parse.urlsplit(url)
                if parts.scheme or parts.netloc or parts.path.startswith('/'):
                    raise SupplyError('EXTERNAL_DEPENDENCY', 422, details=[{'file':rel,'reason':'non_relative_html_reference'}])
                resource = (item.parent/urllib.parse.unquote(parts.path)).resolve()
                if not resource.is_relative_to(source) or not resource.is_file():
                    raise SupplyError('MISSING_LOCAL_RESOURCE', 422, details=[{'file':rel,'reference':parts.path}])
        total += item.stat().st_size
        files.append((item, rel))
        if total > 500_000_000 or len(files) > 2000:
            raise SupplyError('ARCHIVE_UNSAFE', 422)
    from .resource_audit import audit
    from .supply_resources import validated_aliases
    try:aliases=validated_aliases(source)
    except (ValueError,KeyError,OSError):raise SupplyError('RESOURCE_PREPARATION_FAILED',422) from None
    references=audit(source,aliases=aliases)
    from .resource_audit import external_request_findings
    outbound=external_request_findings(files)
    if outbound:raise SupplyError('EXTERNAL_REQUEST_REJECTED',422,details=outbound)
    if references['missing']:raise SupplyError('MISSING_LOCAL_RESOURCE',422,details=[{'file':r['file'],'reference':r['reference'].split('?')[0]} for r in references['missing'][:20]])
    if references['external']:raise SupplyError('EXTERNAL_DEPENDENCY',422,details=[{'file':r['file']} for r in references['external'][:20]])
    from .supply_preparation import secret_findings
    findings=secret_findings(files)
    if findings:raise SupplyError('SECRET_IN_CODE',422,details=findings)
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
                data=item.read_bytes()
                # Preserve exact content while avoiding pathological member ratios.
                # Size/file-count limits still apply to the final archive.
                compressed=len(zlib.compress(data))-6
                info.compress_type = zipfile.ZIP_STORED if len(data)>max(1,compressed)*50 else zipfile.ZIP_DEFLATED
                archive.writestr(info, data)
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
                from .supply_preparation import prepare_one_review
                prepare_one_review(self.service)
            except Exception as error:
                # No credentials or signed download addresses in logs.
                logging.warning('Supply loop interrupted: %s',type(error).__name__)
            self.stop.wait(10)

    def tick(self,submitted_only=False,package_recheck_only=False):
        store = self.service.store
        with store.tx() as db:
            if (store.get(db,'settings','maintenance') or {}).get('draining'):return
            config=supply_settings()
            ready=readiness(config)
            default_policy=store.get(db,'settings','supply_defaults') or {}
            destination=hashlib.sha256((str(config.get('SUPPLY_PLATFORM_BASE'))+'\n'+str(config.get('SUPPLY_APP_ID'))).encode()).hexdigest()
            def recovered_config(r):
                if (r.get('error_code')=='LICENSE_UNDECLARED' and not r.get('submitted') and not r.get('archive_sha256')
                        and default_policy.get('enabled') is True and default_policy.get('scope')=='platform_outputs'
                        and (default_policy.get('license_declaration') or {}).get('distributable')=='yes'
                        and (default_policy.get('license_declaration') or {}).get('owner')
                        and not (r.get('metadata',{}).get('license_declaration') or {}).get('owner')
                        and (r.get('metadata',{}).get('license_declaration') or {}).get('distributable')!='no'):return True
                if not ready['configured'] or r.get('status')!='blocked':return False
                if r.get('error_code')=='DOWNSTREAM_TARGET_CHANGED':return bool(r.get('submitted') and r.get('destination_key')==destination)
                return r.get('error_code') in ('CONFIG_FILE_UNREADABLE','CONFIG_FILE_INVALID')
            # Recheck unsealed local packages once per loaded checker revision.
            # Submitted payloads, rights and platform failures retain their guards.
            row = next((r for r in store.all(db, 'supply')
                        if (not submitted_only or r.get('submitted')) and (not package_recheck_only or needs_package_recheck(r)) and (r['status'] not in ('blocked', 'done') or recovered_config(r) or needs_package_recheck(r) or (r.get('submitted') and r.get('status_sync_revision')!=STATUS_SYNC_REVISION) or (r['status']=='blocked' and r.get('error_code')=='CONFIG_REQUIRED' and config.get('SUPPLY_DELIVERY_MODE')=='cs' and ready['configured'] and not r.get('distribution_recovery_attempted'))) and r.get('next_poll', 0) <= time.time()
                        and r.get('lease_until', 0) <= time.time()), None)
            if not row:
                return
            row.update(lease_until=time.time()+900, lease_token=secrets.token_hex(16))
            if row.get('status')=='blocked':row['distribution_recovery_attempted']=True
            store.put(db, 'supply', row)
            version = self.service.get(db, 'versions', row['version_id'])
            candidate = self.service.get(db, 'candidates', row['candidate_id'])
        lease = row['lease_token']
        previous_status = (row.get('status'), row.get('state'), row.get('error_code'))
        try:
            config = supply_settings()
            if config.get('_config_error'):raise SupplyError(config['_config_error'],503)
            if row.get('destination_key') and not readiness(config)['configured']:raise SupplyError('CONFIG_REQUIRED',503)
            def request(method,route,**kwargs):
                return self.client(method,route,config=config,**kwargs) if self.client is call else self.client(method,route,**kwargs)
            if row.get('destination_key'):
                destination_key = hashlib.sha256((str(config.get('SUPPLY_PLATFORM_BASE'))+'\n'+str(config.get('SUPPLY_APP_ID'))).encode()).hexdigest()
                if destination_key != row['destination_key']:
                    raise SupplyError('DOWNSTREAM_TARGET_CHANGED', 409)
            if not row.get('submitted'):
                meta = row.get('metadata') or {}
                if not row.get('archive_sha256'):
                    from .supply_metadata import metadata_for
                    with store.read() as db:meta=metadata_for(store,db,version,meta)
                    row['metadata']=meta
                license = meta.get('license_declaration') or {}
                ready=readiness(config)
                row['preparation']={'checked_at':now(),'delivery_mode':ready['delivery_mode'],'configuration_missing':ready['missing'],'configuration_errors':ready['errors'],'rights_declared':license.get('distributable')=='yes' and bool(str(license.get('owner','')).strip()),'package':'not_checked'}
                if license.get('distributable') != 'yes' or not str(license.get('owner', '')).strip():
                    raise SupplyError('LICENSE_UNDECLARED', 422)
                required = CONFIG_KEYS
                config = supply_settings()
                if not readiness()['configured']:
                    raise SupplyError('CONFIG_REQUIRED', 400)
                row['preflight']=preflight(config)
                config_digest = hashlib.sha256(('\n'.join(str(config.get(k,'')) for k in (*required,'SUPPLY_DELIVERY_MODE','SUPPLY_CS_TENANT_ID','SUPPLY_CS_AUTHORIZATION'))+'\n'+config.get('SUPPLY_EXPECTED_FINGERPRINT','')).encode()).hexdigest()
                if self.checked_config != config_digest:
                    identity = request('GET', 'whoami')
                    if identity.get('app_id') != config['SUPPLY_APP_ID']:
                        raise SupplyError('SUPPLIER_IDENTITY_MISMATCH', 403)
                    self.checked_config = config_digest
                game_name=' '.join(candidate['title'].split())[:40]
                if not game_name:
                    raise SupplyError('GAME_NAME_INVALID', 422)
                from .supply_delivery import resolve_source, delivery_source
                source = resolve_source(self.service.repo, version)
                with store.tx() as db:
                    profile_record = store.get(db, 'game_profiles', version['id']) or {}
                archive = self.service.data_dir/'supply'/f"{row['submission_id']}.zip"
                if not row.get('archive_sha256'):
                    row['package_check_revision']=PACKAGE_CHECK_REVISION
                if row.get('archive_sha256') and archive.is_file():
                    digest=hashlib.sha256(archive.read_bytes()).hexdigest()
                    supplement={}
                else:
                    with delivery_source(source, candidate, version, meta, profile_record.get('profile')) as (delivery, supplement):
                        digest = build_archive(delivery, archive)
                if not meta.get('acceptance_steps') and supplement.get('acceptance_steps'):
                    meta={**meta,'acceptance_steps':supplement['acceptance_steps']}
                if supplement.get('runtime_recheck_required'):
                    meta={**meta,'known_limitations':list(dict.fromkeys([*(meta.get('known_limitations') or []),
                        '供货副本已整理入口、启动文件或资源映射，原玩法证据对应原版本；下游须核对整理后运行效果。']))}
                if row.get('archive_sha256') and row['archive_sha256'] != digest:
                    raise SupplyError('IMMUTABLE_VERSION_CHANGED', 409)
                # Persist digest before outbound I/O so unknown submit outcomes remain idempotent.
                row['archive_sha256'] = digest
                row['metadata']=meta
                row['preparation']['package']='passed_static_checks'
                with store.tx() as db:
                    store.put(db, 'supply', row)
                if not row.get('archive_url'):
                    from .supply_distribution import publish
                    row['archive_url']=publish(archive,digest,config)
                    with store.tx() as db:store.put(db,'supply',row)
                payload = dict(submission_id=row['submission_id'], archive_url=row['archive_url'],
                               archive_sha256=digest, game_name=game_name, license_declaration=license)
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
                result = request('POST', 'extraction/submit', payload=payload)
                if result.get('submission_id') != row['submission_id'] or not result.get('state'):
                    raise SupplyError('INVALID_SUBMIT_RESPONSE', 502)
                row['submitted'] = True
                row.setdefault('submitted_at', now())
            else:
                result = request('GET', 'extraction/status', query={'submission_id': row['submission_id']})
                if result.get('submission_id') != row['submission_id'] or not result.get('state'):
                    raise SupplyError('INVALID_STATUS_RESPONSE', 502)
                issues = request('GET', 'extraction/issues', query={'submission_id': row['submission_id'],
                    'since_seq': str(row.get('max_seq', 0) if row.get('revision') == result.get('revision') else 0), 'limit': '200'})
                if issues.get('revision') != row.get('revision'):
                    row['issues'] = []
                combined = {i['seq']: i for i in row.get('issues', [])}
                combined.update({i['seq']: i for i in issues.get('items', [])})
                row.update(issues=list(combined.values()), max_seq=max(combined, default=0),
                           revision=issues.get('revision'))
                row['issues_complete'] = len(combined) >= issues.get('total', len(combined))
            for key in ('state', 'state_text', 'next_action', 'notice', 'queue_position', 'extraction_id', 'template', 'percent', 'accepted_at'):
                if key in result:
                    row[key] = result[key]
            row.update(status='done' if result['state'] in TERMINAL and row.get('issues_complete') else 'tracking',
                       next_poll=time.time()+INTERVAL.get(result['state'], 60), error_code='')
            if row.get('issues_complete'):row['status_sync_revision']=STATUS_SYNC_REVISION
        except SupplyError as exc:
            row.setdefault('preparation',{})['issues']={'code':exc.code,'items':exc.details}
            retry = exc.status == 0 or exc.status >= 500 or exc.status == 429
            if row.get('submitted') and not retry:row['status_sync_revision']=STATUS_SYNC_REVISION
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

"""Platform-owned supply service controls; checks never approve or submit games."""
import json
import os
import subprocess
import threading
from pathlib import Path
from .service import require
from .store import now
from .supply_config import KEYS, DEFAULT_FILE, settings, readiness
from .supply import inspect_source, call, SupplyError, preflight


class SupplyService:
    def __init__(self, service):
        self.service = service
        self.lock = threading.RLock()

    def public(self):
        config = settings()
        with self.service.store.tx() as db:
            check = self.service.store.get(db, 'supply_checks', 'main') or {}
        return {
            **readiness(), 'values': {k: config.get(k, '') for k in KEYS if k != 'SUPPLY_APP_SECRET'},
            'has_secret': bool(config.get('SUPPLY_APP_SECRET')),
            'environment_overrides': [k for k in KEYS if k in os.environ],
            'check': check,
        }

    def save(self, body):
        require(isinstance(body, dict) and not set(body)-set(KEYS), '配置字段无效')
        with self.lock:
            path = Path(os.getenv('SUPPLY_CONFIG_FILE', str(DEFAULT_FILE)))
            old = json.loads(path.read_text('utf-8-sig')) if path.exists() else {}
            require(isinstance(old, dict), '服务端配置文件格式错误')
            merged = {k: old.get(k, '') for k in KEYS}
            for k, value in body.items():
                require(isinstance(value, str) and len(value) <= 4096 and '\n' not in value and '\r' not in value, '配置格式无效')
                value = value.strip()
                if k == 'SUPPLY_APP_SECRET' and not value:
                    continue
                require(k not in os.environ or value == os.environ[k].strip(),
                        '该字段由服务端环境变量覆盖，请在部署环境修改')
                merged[k] = value
            effective = {**merged, **{k: os.environ[k].strip() for k in KEYS if k in os.environ}}
            require(not readiness(effective)['errors'], '地址需为有效 HTTPS，供应方 ID 需以 sup_ 开头，分发目录需为绝对路径')
            path.parent.mkdir(parents=True, exist_ok=True)
            temp = path.with_suffix('.private.tmp')
            # Restrict access before writing credentials.
            temp.touch(mode=0o600, exist_ok=True)
            try:
                if os.name == 'nt':
                    sid = subprocess.check_output(['whoami', '/user', '/fo', 'csv', '/nh'], text=True).strip().split(',')[-1].strip('"')
                    subprocess.run(['icacls', str(temp), '/inheritance:r', '/grant:r', '*'+sid+':F', '*S-1-5-18:F'],
                                   check=True, capture_output=True)
                else:
                    temp.chmod(0o600)
                temp.write_text(json.dumps(merged, ensure_ascii=False, indent=2), 'utf-8')
                os.replace(temp, path)
            finally:
                temp.unlink(missing_ok=True)
            with self.service.store.tx() as db:
                self.service.store.put(db, 'supply_checks', {'id': 'main', 'status': 'not_checked', 'notice': '配置已更新，请重新检查'})
        return self.public()

    def check(self):
        with self.lock:
            config = readiness()
            with self.service.store.tx() as db:
                candidates = {c['id']: c for c in self.service.store.all(db, 'candidates')
                              if not c.get('observations', {}).get('catalog_hidden')}
                versions = sorted(self.service.store.all(db, 'versions'), key=lambda v: v.get('created_at', ''), reverse=True)
            rows, seen = [], set()
            for v in versions:
                cid = v['candidate_id']
                if cid not in candidates or cid in seen:
                    continue
                seen.add(cid)
                row = {'title': candidates[cid]['title'], 'version_id': v['id'], 'version_status': v['status']}
                try:
                    root = self.service.repo.root.resolve()
                    source = (root / v.get('source_directory', '')).resolve()
                    if not v.get('source_directory') or not source.is_relative_to(root):
                        raise SupplyError('SOURCE_DIRECTORY_MISSING')
                    from .supply_prepare import prepared
                    with prepared(source) as target:files,size=inspect_source(target)
                    row.update(structure='pass', files=len(files), bytes=size)
                except SupplyError as exc:
                    row.update(structure='blocked', reason=exc.code)
                except ValueError:
                    row.update(structure='blocked',reason='RESOURCE_PREPARATION_FAILED')
                except OSError:
                    row.update(structure='blocked', reason='SOURCE_UNREADABLE')
                license = (v.get('report', {}).get('supply') or {}).get('license_declaration') or {}
                row['distribution_declared'] = license.get('distributable') == 'yes' and bool(license.get('owner'))
                rows.append(row)
            identity = 'not_configured'
            error = ''
            if config['configured']:
                try:
                    preflight(settings())
                    result = call('GET', 'whoami')
                    if result.get('app_id') != settings().get('SUPPLY_APP_ID'):
                        raise SupplyError('SUPPLIER_IDENTITY_MISMATCH')
                    identity = 'verified'
                except SupplyError as exc:
                    identity, error = 'failed', exc.code
                except Exception:
                    identity, error = 'failed', 'CONNECTION_CHECK_FAILED'
            result = {'id': 'main', 'status': 'checked', 'checked_at': now(), 'identity': identity,
                      'error_code': error, 'games': rows, 'submission_sent': False,
                      'notice': '只读结构检查；未验证完整玩法、公开下载链路或下游白名单。'}
            with self.service.store.tx() as db:
                self.service.store.put(db, 'supply_checks', result)
            return self.public()

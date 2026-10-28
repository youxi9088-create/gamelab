"""Independent task backend: accounts, discovery, queue and conversion worker.

The business transitions remain in controlplane.service. This process owns a
separate database and never starts against the portal database implicitly.
"""
import argparse
import io
import json
import mimetypes
import os
import re
import secrets
import sys
import threading
import time
import traceback
import zipfile
from http.cookies import SimpleCookie
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[2]
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

from controlplane.accounts import Accounts, authorize, password_hash, public
from controlplane.service import ApiError, Service, require
from controlplane.service_registry import ServiceRegistry
from controlplane.store import ACTOR, ident, now

WEB = Path(__file__).resolve().parent / 'web'
COOKIE = 'task_backend_session'
STATE_KEYS = (
    'candidates', 'sources', 'batches', 'jobs', 'versions', 'events',
    'messages', 'rounds', 'recommendations', 'discovery_runs',
    'discovery_settings', 'settings', 'conversion_queue', 'metrics',
    'usage', 'operation_stats', 'game_conversion_stats', 'features',
)


def bootstrap(store, username, password):
    """Create the first administrator exactly once; never reset an account."""
    require(isinstance(username, str) and re.fullmatch(r'[A-Za-z0-9_.@-]{3,80}', username),
            '账号须为3至80位字母、数字或 . _ @ -')
    require(isinstance(password, str) and 12 <= len(password) <= 256,
            '密码长度应为12至256位')
    with store.tx() as db:
        require(not store.all(db, 'users'), '管理员已初始化，请直接登录', 409)
        user = dict(id=ident('user'), username=username, role='admin', enabled=True,
                    password_hash=password_hash(password), revision=1, created_at=now())
        store.put(db, 'users', user)
        store.event(db, '初始化独立任务后台管理员', stage='auth', actor_id=user['id'],
                    actor_name=user['username'])
        return public(user)


class Handler(BaseHTTPRequestHandler):
    server_version = 'GameTaskBackend/1.0'

    def log_message(self, fmt, *args):
        print(f'[{self.command}] {urlsplit(self.path).path} '
              f'{args[1] if len(args) > 1 else ""}', flush=True)

    def send(self, status, body, content_type='application/json; charset=utf-8', headers=None):
        self.response_status = status
        if isinstance(body, (dict, list)):
            body = json.dumps(body, ensure_ascii=False).encode()
        elif isinstance(body, str):
            body = body.encode()
        self.send_response(status)
        self.send_header('Content-Type', content_type)
        self.send_header('Content-Length', str(len(body)))
        self.send_header('X-Content-Type-Options', 'nosniff')
        self.send_header('Referrer-Policy', 'no-referrer')
        self.send_header('Cache-Control', 'no-store')
        if not headers or 'Content-Security-Policy' not in headers:
            self.send_header('Content-Security-Policy',
                "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; "
                "img-src 'self' data: https:; frame-src 'self'; connect-src 'self'; "
                "object-src 'none'; base-uri 'self'; frame-ancestors 'none'")
        for key, value in (headers or {}).items():
            self.send_header(key, value)
        self.end_headers()
        self.wfile.write(body)

    def hostname_valid(self):
        host = self.headers.get('Host', '')
        allowed = {f'127.0.0.1:{self.server.server_port}', f'localhost:{self.server.server_port}'}
        if self.server.public_origin:
            allowed.add(urlsplit(self.server.public_origin).netloc)
        require(host in allowed, '不支持的 Host', 403)

    def cookie(self):
        cookie = SimpleCookie()
        try:
            cookie.load(self.headers.get('Cookie', ''))
        except Exception:
            return None
        item = cookie.get(COOKIE)
        return item.value if item else None

    def origin_allowed(self):
        origin = self.headers.get('Origin')
        if not origin:
            return True
        allowed = {f'http://127.0.0.1:{self.server.server_port}',
                   f'http://localhost:{self.server.server_port}'}
        if self.server.public_origin:
            allowed.add(self.server.public_origin)
        return origin in allowed

    def session(self):
        return self.server.accounts.session(self.cookie())

    def admin(self, mutation=False):
        session = self.session()
        require(session and session.get('authenticated'), '请先登录任务后台', 401)
        if mutation:
            require(secrets.compare_digest(session['csrf'], self.headers.get('X-CSRF-Token', '')),
                    '请求校验失败，请刷新页面', 403)
            require(self.origin_allowed(), '不允许跨站管理操作', 403)
        self.actor = session['user']
        authorize(self.actor, urlsplit(self.path).path, mutation)

    def body(self):
        require(self.headers.get('Content-Type', '').split(';')[0] == 'application/json',
                '请使用 application/json', 415)
        length = int(self.headers.get('Content-Length', '0'))
        require(0 < length <= 30 * 1024 * 1024, '请求体为空或超过 30 MiB', 413)
        try:
            value = json.loads(self.rfile.read(length))
        except (json.JSONDecodeError, UnicodeDecodeError):
            raise ApiError(400, '无效的 JSON')
        require(isinstance(value, dict), '请求体必须是 JSON 对象')
        return value

    def do_GET(self):
        try:
            self.hostname_valid()
            path = unquote(urlsplit(self.path).path)
            if path == '/health':
                return self.send(200, {'ok': True, 'service': 'independent-task-backend'})
            if path == '/api/auth/status':
                session = self.session()
                return self.send(200, {
                    'required': True,
                    'setup_required': not self.server.accounts.enabled(),
                    'authenticated': bool(session and session['expires'] > time.time()),
                    'user': session['user'] if session else None,
                })
            if path == '/api/session':
                session = self.session()
                require(session and session['expires'] > time.time(), '请先登录任务后台', 401)
                return self.send(200, {'csrf': session['csrf'], 'user': session['user']})
            if path.startswith('/api/v1/source-bundles/') and path.endswith('/download'):
                auth = self.headers.get('Authorization', '')
                require(auth.startswith('Bearer '), '缺少接入凭证', 401)
                tool = self.server.service.authenticate(auth[7:])
                key = path.split('/')[4]
                with self.server.service.store.tx() as db:
                    bundle = self.server.service.get(db, 'source-bundles', key)
                    jobs = self.server.service.store.all(db, 'jobs')
                    require(any(j['candidate_id'] == bundle['candidate_id'] and
                                j.get('tool_id') == tool['id'] and j['status'] == 'running'
                                for j in jobs), '工具未持有对应执行任务', 403)
                return self.send_zip(self.server.service.repo.artifacts / key, f'{key}.zip')
            if path.startswith(('/play/', '/runtime/')):
                self.admin()
                return self.play(path)
            if path.startswith('/api/'):
                self.admin()
                if path == '/api/state':
                    full = self.server.service.state()
                    state = {key: full[key] for key in STATE_KEYS if key in full}
                    state['current_user'] = self.actor
                    state['backend'] = {'independent': True, 'database': 'task-backend',
                                        'discovery_scheduler': self.server.discovery_enabled,
                                        'conversion_worker': self.server.executor_enabled}
                    return self.send(200, state)
                if path == '/api/accounts':
                    return self.send(200, {'users': self.server.accounts.list()})
                if path == '/api/services':
                    return self.send(200, self.server.registry.public())
                if path == '/api/operations':
                    from controlplane.production import status
                    return self.send(200, status(self.server.service))
                if path.startswith('/api/versions/') and path.endswith('/download'):
                    key = path.split('/')[3]
                    with self.server.service.store.tx() as db:
                        version = self.server.service.get(db, 'versions', key)
                    return self.send_zip(self.server.service.repo.root / version['source_directory'],
                                         f'{key}.zip')
                raise ApiError(404, '接口不存在')
            if path == '/':
                path = '/index.html'
            return self.file(WEB / path.lstrip('/'), WEB)
        except ApiError as exc:
            self.send(exc.status, {'error': exc.message})
        except Exception:
            traceback.print_exc()
            self.send(500, {'error': '服务内部错误，请查看服务日志'})

    def do_POST(self):
        actor_token = None
        try:
            self.hostname_valid()
            path = urlsplit(self.path).path
            body = self.body()
            if path in ('/api/auth/setup', '/api/auth/login', '/api/auth/logout'):
                require(self.origin_allowed(), '不允许跨站管理操作', 403)
                if path == '/api/auth/setup':
                    require(not self.server.accounts.enabled(), '管理员已初始化', 409)
                    bootstrap(self.server.service.store, body.get('username'), body.get('password'))
                    return self.login(body)
                if path == '/api/auth/login':
                    require(self.server.accounts.enabled(), '请先初始化管理员', 409)
                    return self.login(body)
                self.admin(mutation=True)
                self.server.accounts.logout(self.cookie())
                return self.send(200, {'ok': True}, headers={
                    'Set-Cookie': f'{COOKIE}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0'})
            tool = None
            if path.startswith('/api/v1/'):
                auth = self.headers.get('Authorization', '')
                require(auth.startswith('Bearer '), '缺少接入凭证', 401)
                tool = self.server.service.authenticate(auth[7:])
            else:
                self.admin(mutation=True)
                actor_token = ACTOR.set(self.actor)
                if path != '/api/operations/drain':
                    with self.server.service.store.tx() as db:
                        maintenance = self.server.service.store.get(db, 'settings', 'maintenance') or {}
                        require(not maintenance.get('draining'),
                                '系统正在维护，暂不接受修改，请稍后重试', 503)
            idem = self.headers.get('Idempotency-Key') or body.get('event_id')
            if path == '/api/accounts/save':
                result = {'user': self.server.accounts.save(body, self.actor)}
            elif path == '/api/operations/drain':
                require(type(body.get('enabled')) is bool, '暂停状态无效')
                with self.server.service.store.tx() as db:
                    self.server.service.store.put(db, 'settings',
                        {'id': 'maintenance', 'draining': body['enabled']})
                result = {'ok': True, 'draining': body['enabled']}
            elif path.startswith('/api/services/'):
                parts = path.strip('/').split('/')
                require(len(parts) == 4 and parts[3] in ('save', 'test'), '接口不存在', 404)
                result = (self.server.registry.save(parts[2], body) if parts[3] == 'save'
                          else self.server.registry.test(parts[2]))
            else:
                require(self.allowed_mutation(path), '该管理接口不属于独立任务后台', 404)
                result = self.server.service.mutate(path, body, tool, idem)
            if not tool:
                with self.server.service.store.tx() as db:
                    self.server.service.store.put(db, 'audit', dict(
                        id=ident('audit'), actor_id=self.actor['id'],
                        actor_name=self.actor['username'], path=path,
                        created_at=now(), result='success'))
            self.send(200, result)
        except ApiError as exc:
            self.send(exc.status, {'error': exc.message})
        except (ValueError, TypeError, KeyError) as exc:
            self.send(400, {'error': '参数无效：' + str(exc)[:200]})
        except Exception:
            traceback.print_exc()
            self.send(500, {'error': '服务内部错误，请查看服务日志'})
        finally:
            if getattr(self, 'response_status', 200) >= 400 and getattr(self, 'actor', None):
                try:
                    with self.server.service.store.tx() as db:
                        self.server.service.store.put(db, 'audit', dict(
                            id=ident('audit'), actor_id=self.actor['id'],
                            actor_name=self.actor['username'], path=urlsplit(self.path).path,
                            created_at=now(), result='denied_or_failed',
                            http_status=self.response_status))
                except Exception:
                    traceback.print_exc()
            if actor_token is not None:
                ACTOR.reset(actor_token)

    @staticmethod
    def allowed_mutation(path):
        if path in ('/api/conversions', '/api/batches'):
            return True
        parts = path.strip('/').split('/')
        if len(parts) == 3 and parts[:2] == ['api', 'discovery']:
            return parts[2] in ('scan', 'settings', 'rules', 'approve', 'reject', 'dispatch')
        if len(parts) == 4 and parts[1] == 'jobs':
            return parts[3] in ('message', 'retry', 'delete')
        if len(parts) == 4 and parts[1] == 'batches':
            return parts[3] in ('start', 'pause', 'resume', 'stop', 'retry')
        return path.startswith('/api/v1/')

    def login(self, body):
        address = (self.client_address[0], str(body.get('username', ''))[:80])
        instant = time.monotonic()
        with self.server.session_lock:
            failures, updated = self.server.login_failures.get(address, (0, instant))
            failures = failures if instant - updated < 900 else 0
            require(failures < 10, '登录失败次数过多，请 15 分钟后重试', 429)
        authenticated = self.server.accounts.login(body.get('username'), body.get('password'))
        if not authenticated:
            with self.server.session_lock:
                self.server.login_failures[address] = (failures + 1, instant)
            raise ApiError(401, '账号或密码不正确')
        with self.server.session_lock:
            self.server.login_failures.pop(address, None)
        token, session = authenticated
        secure = '; Secure' if self.server.public_origin.startswith('https://') else ''
        return self.send(200, {'ok': True, 'csrf': session['csrf'], 'user': session['user']},
            headers={'Set-Cookie': f'{COOKIE}={token}; HttpOnly; SameSite=Strict; Path=/; '
                                   f'Max-Age=43200{secure}'})

    def send_zip(self, directory, filename):
        require(directory.is_dir(), '交付目录不存在', 404)
        output = io.BytesIO()
        with zipfile.ZipFile(output, 'w', zipfile.ZIP_DEFLATED) as archive:
            for item in directory.rglob('*'):
                if item.is_file():
                    archive.write(item, item.relative_to(directory).as_posix())
        return self.send(200, output.getvalue(), 'application/zip',
                         {'Content-Disposition': f'attachment; filename="{filename}"'})

    def file(self, path, root, extra=None, runtime=False):
        resolved = path.resolve()
        root = root.resolve()
        require(resolved.is_relative_to(root) and resolved.is_file(), '文件不存在', 404)
        require(not any(part.startswith('.') for part in resolved.relative_to(root).parts),
                '文件不可访问', 403)
        content_type = mimetypes.guess_type(resolved.name)[0] or 'application/octet-stream'
        if resolved.suffix == '.js':
            content_type = 'text/javascript'
        if content_type.startswith('text/'):
            content_type += '; charset=utf-8'
        content = resolved.read_bytes()
        if runtime and resolved.name == 'boot.js':
            from controlplane.runtime_compatibility import mounted_boot
            content, compatibility = mounted_boot(content)
            if compatibility:
                extra = {**(extra or {}), **compatibility}
        self.send(200, content, content_type, extra)

    def play(self, path):
        parts = path.strip('/').split('/')
        require(len(parts) >= 3 and parts[0] in ('play', 'runtime'), '试玩版本不存在', 404)
        artifact_id = parts[1]
        with self.server.service.store.tx() as db:
            artifact = self.server.service.get(db, 'artifacts', artifact_id)
            require(parts[0] != 'runtime' or artifact.get('runtime_local'), '版本未启用独立运行', 403)
        root = self.server.service.repo.artifacts / artifact_id
        relative = '/'.join(parts[2:])
        if not Path(relative).suffix:
            try:
                if not (root / relative).resolve().is_file() and (root / (relative + '.js')).resolve().is_file():
                    relative += '.js'
            except OSError:
                pass
        csp = ("sandbox allow-scripts; default-src 'self' data: blob:; script-src 'self' "
               "'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; "
               "connect-src 'none'; object-src 'none'; base-uri 'none'; form-action 'none'")
        if parts[0] == 'runtime':
            csp = csp.replace('sandbox allow-scripts; ', '').replace("connect-src 'none'", "connect-src 'self'")
        return self.file(root / relative, root, {'Content-Security-Policy': csp}, runtime=True)


def build_server(service, port=8780, host='127.0.0.1', discovery_enabled=True, executor_enabled=True):
    require(host in ('127.0.0.1', 'localhost'), '任务后台仅允许绑定本机回环地址')
    server = ThreadingHTTPServer((host, port), Handler)
    server.service = service
    server.session_lock = threading.Lock()
    server.login_failures = {}
    server.public_origin = os.environ.get('TASK_BACKEND_PUBLIC_ORIGIN', '').rstrip('/')
    server.discovery_enabled = discovery_enabled
    server.executor_enabled = executor_enabled
    username = os.environ.get('TASK_BACKEND_ADMIN_USERNAME', '')
    password = os.environ.get('TASK_BACKEND_ADMIN_PASSWORD', '')
    require(bool(username) == bool(password),
            'TASK_BACKEND_ADMIN_USERNAME 和 TASK_BACKEND_ADMIN_PASSWORD 必须同时配置')
    server.accounts = Accounts(service.store)
    if username and not server.accounts.enabled():
        bootstrap(service.store, username, password)
    server.registry = ServiceRegistry(service.data_dir / 'services.json')
    return server


def main():
    parser = argparse.ArgumentParser(description='Game Lab independent task backend')
    parser.add_argument('--host', default='127.0.0.1')
    parser.add_argument('--port', type=int, default=8780)
    parser.add_argument('--data-dir', default=str(ROOT / 'data' / 'task-backend'))
    parser.add_argument('--repo-dir', default=str(ROOT / 'data' / 'task-backend' / 'game-library'))
    parser.add_argument('--no-executor', action='store_true', help='Disable conversion worker for isolated checks')
    parser.add_argument('--no-discovery', action='store_true', help='Disable discovery scheduler for isolated checks')
    args = parser.parse_args()
    data_dir = Path(args.data_dir).resolve()
    service = Service(data_dir, Path(args.repo_dir).resolve(), f'http://127.0.0.1:{args.port}',
                      runs_dir=data_dir / 'runs')
    server = build_server(service, args.port, args.host, not args.no_discovery, not args.no_executor)
    discovery = executor = None
    if not args.no_discovery:
        from controlplane.discovery import DiscoveryScheduler
        discovery = DiscoveryScheduler(service)
        discovery.start()
    if not args.no_executor:
        from controlplane.executor import Executor
        executor = Executor(service, server.server_port)
        server.registry.executor = executor
        executor.start()
    print(f'Task backend: http://127.0.0.1:{server.server_port}\n'
          f'Data: {data_dir}\nLocal-only binding. Ctrl+C to stop.', flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        if discovery:
            discovery.close()
        if executor:
            executor.close()
        server.server_close()


if __name__ == '__main__':
    main()

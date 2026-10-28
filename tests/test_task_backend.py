import http.cookiejar
import json
import tempfile
import threading
import unittest
import urllib.error
import urllib.request
from pathlib import Path

from controlplane.accounts import Accounts
from controlplane.service import Service
from services.task_backend.app import build_server


ADMIN = 'fixture-admin-password'
OPERATOR = 'fixture-operator-password'
VIEWER = 'fixture-viewer-password'


class Client:
    def __init__(self, base):
        self.base = base
        self.csrf = ''
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))

    def request(self, path, body=None, csrf=True, origin=None, headers=None):
        headers = dict(headers or {})
        data = None
        if body is not None:
            data = json.dumps(body).encode()
            headers['Content-Type'] = 'application/json'
            if csrf:
                headers['X-CSRF-Token'] = self.csrf
        if origin:
            headers['Origin'] = origin
        request = urllib.request.Request(self.base + path, data=data, headers=headers)
        with self.opener.open(request, timeout=10) as response:
            raw = response.read()
            return response.status, dict(response.headers), json.loads(raw) if raw else None

    def login(self, username='admin', password=ADMIN):
        _, _, result = self.request('/api/auth/login', {'username': username, 'password': password})
        self.csrf = result['csrf']
        return result


class TaskBackendTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        root = Path(self.temp.name)
        self.service = Service(root / 'backend-data', root / 'backend-repo', 'http://127.0.0.1:0',
                               runs_dir=root / 'backend-data' / 'runs')
        self.assertEqual(self.service.runs_dir, (root / 'backend-data' / 'runs').resolve())
        self.server = build_server(self.service, 0, discovery_enabled=False, executor_enabled=False)
        self.thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        self.thread.start()
        self.base = f'http://127.0.0.1:{self.server.server_port}'

    def tearDown(self):
        self.server.shutdown()
        self.server.server_close()
        self.thread.join(timeout=5)
        self.temp.cleanup()

    def client(self, setup=False):
        client = Client(self.base)
        if setup:
            _, _, result = client.request('/api/auth/setup', {'username': 'admin', 'password': ADMIN})
            client.csrf = result['csrf']
        return client

    def test_first_run_setup_login_and_independent_state(self):
        client = self.client()
        _, _, status = client.request('/api/auth/status')
        self.assertTrue(status['setup_required'])
        self.assertFalse(status['authenticated'])
        with self.assertRaises(urllib.error.HTTPError) as error:
            client.request('/api/auth/setup', {'username': 'admin', 'password': 'short'})
        self.assertEqual(error.exception.code, 400)
        _, headers, result = client.request('/api/auth/setup', {'username': 'admin', 'password': ADMIN})
        self.assertEqual(result['user']['role'], 'admin')
        self.assertIn('task_backend_session=', headers['Set-Cookie'])
        self.assertIn('HttpOnly', headers['Set-Cookie'])
        self.assertIn('SameSite=Strict', headers['Set-Cookie'])
        client.csrf = result['csrf']
        with self.assertRaises(urllib.error.HTTPError) as error:
            self.client().request('/api/auth/setup', {'username': 'other', 'password': ADMIN})
        self.assertEqual(error.exception.code, 409)
        _, _, state = client.request('/api/state')
        self.assertTrue(state['backend']['independent'])
        self.assertFalse(state['backend']['conversion_worker'])
        self.assertFalse(state['backend']['discovery_scheduler'])
        self.assertEqual(state['jobs'], [])
        self.assertEqual(state['current_user']['username'], 'admin')
        page = urllib.request.urlopen(self.base + '/', timeout=5).read().decode()
        self.assertIn('独立任务后台', page)

    def test_roles_csrf_origin_and_session_revocation(self):
        admin = self.client(setup=True)
        _, _, operator = admin.request('/api/accounts/save', {
            'username': 'operator', 'role': 'operator', 'password': OPERATOR})
        _, _, viewer = admin.request('/api/accounts/save', {
            'username': 'viewer', 'role': 'viewer', 'password': VIEWER})
        operator_client = self.client()
        operator_client.login('operator', OPERATOR)
        with self.assertRaises(urllib.error.HTTPError) as error:
            operator_client.request('/api/conversions', {'url': 'https://example.org/no-csrf'}, csrf=False)
        self.assertEqual(error.exception.code, 403)
        with self.assertRaises(urllib.error.HTTPError) as error:
            operator_client.request('/api/conversions', {'url': 'https://example.org/bad-origin'}, origin='https://evil.example')
        self.assertEqual(error.exception.code, 403)
        _, _, created = operator_client.request('/api/conversions', {'url': 'https://example.org/operator-task'})
        self.assertEqual(created['job']['status'], 'queued')
        self.assertEqual(created['job']['created_by'], operator['user']['id'])
        with self.assertRaises(urllib.error.HTTPError) as error:
            operator_client.request('/api/accounts')
        self.assertEqual(error.exception.code, 403)
        with self.assertRaises(urllib.error.HTTPError) as error:
            operator_client.request('/api/discovery/settings', {'hour': 10})
        self.assertEqual(error.exception.code, 403)
        with self.service.store.tx() as db:
            self.service.store.put(db, 'recommendations', {'id': 'rec-fixture', 'status': 'pending'})
        operator_client.request('/api/discovery/approve', {'ids': ['rec-fixture']})
        with self.service.store.tx() as db:
            recommendation = self.service.store.get(db, 'recommendations', 'rec-fixture')
        self.assertEqual(recommendation['decision_by'], 'operator')
        viewer_client = self.client()
        viewer_client.login('viewer', VIEWER)
        with self.assertRaises(urllib.error.HTTPError) as error:
            viewer_client.request('/api/conversions', {'url': 'https://example.org/forbidden'})
        self.assertEqual(error.exception.code, 403)
        admin.request('/api/accounts/save', {'id': operator['user']['id'], 'enabled': False})
        with self.assertRaises(urllib.error.HTTPError) as error:
            operator_client.request('/api/state')
        self.assertEqual(error.exception.code, 401)
        with self.service.store.tx() as db:
            stored = self.service.store.get(db, 'users', viewer['user']['id'])
        self.assertNotIn(VIEWER, json.dumps(stored))

    def test_worker_protocol_and_secrets_stay_out_of_public_state(self):
        admin = self.client(setup=True)
        admin.request('/api/conversions', {'url': 'https://example.org/worker-fixture'})
        registration = self.service.mutate('/api/tools', {'name': 'isolated-worker', 'capabilities': ['rea', 'reconstruct']})
        token = registration['token']
        worker = Client(self.base)
        _, _, claimed = worker.request('/api/v1/jobs/claim', {
            'capabilities': ['rea'], 'worker_id': 'isolated', 'automatic_only': False},
            headers={'Authorization': 'Bearer ' + token})
        self.assertEqual(claimed['job']['status'], 'running')
        self.assertEqual(claimed['job']['settings']['concurrency'], 1)
        lease = claimed['job']['lease_token']
        _, _, heartbeat = worker.request('/api/v1/jobs/' + claimed['job']['id'] + '/heartbeat', {
            'lease_token': lease, 'progress': 10}, headers={'Authorization': 'Bearer ' + token})
        self.assertTrue(heartbeat['ok'])
        secret = 'fixture-private-api-key'
        admin.request('/api/services/ai/save', {
            'connection': 'compatible', 'base_url': 'https://provider.example/v1',
            'model': 'fixture-model', 'api_key': secret})
        _, _, public_services = admin.request('/api/services')
        self.assertNotIn(secret, json.dumps(public_services))
        _, _, state = admin.request('/api/state')
        self.assertNotIn(secret, json.dumps(state))
        self.assertNotIn('lease_token', json.dumps(state['jobs']))

    def test_authenticated_playback_has_single_runtime_csp(self):
        client = self.client(setup=True)
        artifact = self.service.repo.artifacts / 'artifact-fixture'
        artifact.mkdir(parents=True)
        (artifact / 'index.html').write_text('<html><script>window.fixture=true</script></html>')
        with self.service.store.tx() as db:
            self.service.store.put(db, 'artifacts', {'id': 'artifact-fixture', 'entry': 'index.html'})
        response = client.opener.open(self.base + '/play/artifact-fixture/index.html')
        policies = response.headers.get_all('Content-Security-Policy')
        self.assertEqual(len(policies), 1)
        self.assertIn("sandbox allow-scripts", policies[0])
        self.assertIn(b'window.fixture=true', response.read())
        response.close()

    def test_unrelated_portal_mutations_are_not_exposed(self):
        admin = self.client(setup=True)
        with self.assertRaises(urllib.error.HTTPError) as error:
            admin.request('/api/versions/any/approve', {})
        self.assertEqual(error.exception.code, 404)
        with self.assertRaises(urllib.error.HTTPError) as error:
            admin.request('/api/discovery/unknown', {})
        self.assertEqual(error.exception.code, 404)


if __name__ == '__main__':
    unittest.main()

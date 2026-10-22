import json
import tempfile
import threading
import unittest
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch
from controlplane.service_registry import ServiceRegistry, ai_config
from controlplane.service import ApiError


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *args): pass
    def do_GET(self):
        self.send_response(200); self.end_headers()
        self.wfile.write(json.dumps(self.server.payload).encode())
    def do_POST(self):
        self.server.path = self.path
        self.server.headers_seen = {key.lower(): value for key, value in self.headers.items()}
        self.server.received = json.loads(self.rfile.read(int(self.headers['Content-Length'])))
        self.do_GET()


class ServicesTest(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.registry = ServiceRegistry(Path(self.tmp.name) / 'services.json')
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        self.server.payload = {}
        threading.Thread(target=self.server.serve_forever, daemon=True).start()
        self.url = f'http://127.0.0.1:{self.server.server_port}'
    def tearDown(self):
        self.server.shutdown(); self.server.server_close(); self.tmp.cleanup()
    def test_ai_secret_and_actual_completion(self):
        r = self.registry
        r.save('ai', dict(base_url=self.url, model='test', api_key='private-test-token'))
        self.assertNotIn('private-test-token', json.dumps(r.public()))
        self.assertEqual(r.public()[1]['status'], '待检测')
        self.server.payload = {'choices': [{'message': {'content': '{"ok":true}'}}]}
        self.assertEqual(r.test('ai')[1]['status'], '在线')
        self.assertEqual(self.server.received['model'], 'test')
        r.save('ai', dict(base_url=self.url, model='other', api_key=''))
        self.assertEqual(ai_config(r.path)['api_key'], 'private-test-token')
        self.assertEqual(r.public()[1]['status'], '待检测')
        self.server.payload = {'models': ['other']}
        self.assertEqual(r.test('ai')[1]['status'], '异常')
    def test_responses_api_and_private_actor_header(self):
        r=self.registry
        r.save('ai',dict(base_url=self.url,model='fixture-model',api_key='private-test-token',backend='api',wire_api='responses',actor_authorization='fixture-actor'))
        self.server.payload={'output':[{'type':'message','content':[{'type':'output_text','text':'{"ok":true}'}]}],
                             'usage':{'input_tokens':11,'output_tokens':5}}
        self.assertEqual(r.test('ai')[1]['status'],'在线')
        self.assertEqual(self.server.path,'/responses')
        self.assertEqual(self.server.received['input'][0]['role'],'user')
        self.assertFalse(self.server.received['store'])
        self.assertEqual(self.server.headers_seen['x-openai-actor-authorization'],'fixture-actor')
        self.assertEqual(self.server.headers_seen['user-agent'],'GameLab/1.0')
        self.assertNotIn('fixture-actor',json.dumps(r.public()))
        self.assertEqual(r.config('ai')['wire_api'],'responses')
    def test_converter_requires_capability_and_ready(self):
        r = self.registry
        self.assertEqual(r.public()[0]['status'], '未配置')
        r.save('wechat', dict(base_url=self.url))
        self.server.payload = {'ok': True, 'service': 'control-plane'}
        self.assertEqual(r.test('wechat')[0]['status'], '异常')
        self.server.payload = {'ok': True, 'ready': True, 'capabilities': ['wechat_to_web']}
        self.assertEqual(r.test('wechat')[0]['status'], '在线')
        with patch('controlplane.service_registry.time.time', return_value=r.checks['wechat']['time'] + 301):
            self.assertEqual(r.public()[0]['status'], '待检测')

    def test_builtin_converter_exposes_runtime_readiness_checks(self):
        from unittest.mock import Mock
        self.registry.executor = Mock()
        checks={'node':True,'rea':True,'rea-analysis':True,'playwright':True,'browser':True}
        self.registry.executor.health.return_value={'ready':True,'detail':'isolated analysis passed','checks':checks}
        status=self.registry.public()[0]
        self.assertEqual(status['status'],'在线')
        self.assertEqual(status['checks'],checks)
    def test_invalid_configuration_does_not_save(self):
        for url in ['http://example.com', 'https://user:secret@example.com', 'https://example.com?key=secret']:
            with self.assertRaises(ApiError): self.registry.save('wechat', {'base_url': url})
        self.assertFalse(self.registry.path.exists())


if __name__ == '__main__': unittest.main()

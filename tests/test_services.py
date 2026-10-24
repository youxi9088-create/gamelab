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

    def test_connections_preserve_separate_secrets_and_actual_protocol(self):
        r = self.registry
        r.save('ai', dict(connection='compatible', base_url=self.url, model='gpt-6-sol',
                          api_key='compatible-secret', actor_authorization='private-actor'))
        r.save('ai', dict(connection='local_codex', base_url=self.url, api_key='bridge-secret'))
        self.server.payload = {'choices': [{'message': {'content': '{"ok":true}'}}]}
        self.assertEqual(r.test('ai')[1]['status'], '在线')
        self.assertEqual(self.server.path, '/chat/completions')
        self.assertEqual(self.server.headers_seen['authorization'], 'Bearer bridge-secret')
        self.assertNotIn('x-openai-actor-authorization', self.server.headers_seen)
        r.save('ai', dict(connection='openai', api_key='official-secret'))
        self.assertEqual(r.config('ai')['base_url'], 'https://api.openai.com/v1')
        r.save('ai', dict(connection='compatible', api_key='', actor_authorization=''))
        self.server.payload = {'output': [{'content': [{'type': 'output_text', 'text': '{"ok":true}'}]}]}
        self.assertEqual(r.test('ai')[1]['status'], '在线')
        self.assertEqual(self.server.path, '/responses')
        self.assertEqual(self.server.headers_seen['authorization'], 'Bearer compatible-secret')
        self.assertEqual(self.server.headers_seen['x-openai-actor-authorization'], 'private-actor')
        self.assertEqual(self.server.received['model'], 'gpt-6-sol')
        public = json.dumps(r.public())
        for secret in ['compatible-secret', 'bridge-secret', 'official-secret', 'private-actor']:
            self.assertNotIn(secret, public)

    def test_connection_switch_never_reuses_another_profile_key(self):
        r = self.registry
        r.save('ai', dict(connection='compatible', base_url=self.url, api_key='compatible-secret'))
        before = r.path.read_bytes()
        with self.assertRaises(ApiError): r.save('ai', dict(connection='openai', api_key=''))
        with self.assertRaises(ApiError): r.save('ai', dict(connection='compatible', base_url='https://different.example/v1'))
        self.assertEqual(r.path.read_bytes(), before)
        r.save('ai', dict(backend='codex'))
        r.save('ai', dict(connection='compatible', api_key=''))
        self.assertEqual(r.config('ai')['api_key'], 'compatible-secret')

    def test_bridge_requires_loopback_and_official_endpoint_is_fixed(self):
        with self.assertRaises(ApiError):
            self.registry.save('ai', dict(connection='local_codex', base_url='https://remote.example', api_key='secret'))
        self.registry.save('ai', dict(connection='openai', base_url='https://remote.example',
                                     api_key='secret', actor_authorization='not-for-official'))
        self.assertEqual(self.registry.config('ai')['base_url'], 'https://api.openai.com/v1')
        self.assertEqual(self.registry.config('ai')['http_headers'], {})

    def test_probe_exposes_only_safe_provider_errors(self):
        from controlplane.ai_provider import AIProviderError
        self.registry.save('ai', dict(connection='compatible', base_url=self.url, api_key='secret'))
        for error, expected in [(AIProviderError('AI API 调用失败：HTTP 401'), 'HTTP 401'),
                                (ValueError('private-token'), 'AI 调用失败')]:
            with patch('controlplane.ai_provider.complete', side_effect=error):
                result = self.registry.test('ai')[1]
            self.assertIn(expected, result['detail'])
            self.assertNotIn('private-token', json.dumps(result))

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

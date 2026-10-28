import subprocess
import tempfile
import threading
import time
import unittest
from unittest.mock import patch
from controlplane.ai_provider import AIProviderError
from pathlib import Path
from controlplane.service import Service
from controlplane.runtime import node_binary
from server import build_server


class AIConnectionsUITest(unittest.TestCase):
    def test_three_connections_keep_drafts_and_saved_profiles(self):
        with tempfile.TemporaryDirectory() as directory:
            root = Path(directory)
            service = Service(root / 'data', root / 'repo', 'http://127.0.0.1:8766')
            server = build_server(service, 0)
            server.registry.save('ai', dict(connection='compatible', api_key='fixture-compatible', actor_authorization='fixture-actor'))
            threading.Thread(target=server.serve_forever, daemon=True).start()
            try:
                def probe(messages, config, timeout):
                    self.assertEqual(timeout, 60)
                    if not hasattr(probe, 'calls'): probe.calls = 0
                    probe.calls += 1
                    if probe.calls == 1:
                        time.sleep(4)
                        return {'ok':True}, 'api'
                    if probe.calls == 2: raise AIProviderError('AI API 调用失败：HTTP 502')
                    return {'ok':True}, 'codex'
                with patch('controlplane.codex_account.require_account'), patch('controlplane.ai_provider.codex_binary',return_value='fixture-cli'), patch('controlplane.ai_provider.complete', side_effect=probe):
                    result = subprocess.run([str(node_binary()), 'tools/check_ai_connections_ui.cjs',
                        f'http://127.0.0.1:{server.server_port}'], capture_output=True, text=True, encoding='utf-8', errors='replace', timeout=75)
                self.assertEqual(result.returncode, 0, result.stderr)
                config = server.registry.config('ai')
                self.assertEqual(config['connection'], 'compatible')
                self.assertEqual(config['api_key'], 'fixture-compatible')
                self.assertEqual(server.registry.configs()['ai_profiles']['codex_account']['account_email'], 'fixture@example.com')
                self.assertNotIn('api_key', server.registry.configs()['ai_profiles']['codex_account'])
            finally:
                server.shutdown()
                server.server_close()

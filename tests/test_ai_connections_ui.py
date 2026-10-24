import subprocess
import tempfile
import threading
import unittest
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
                result = subprocess.run([str(node_binary()), 'tools/check_ai_connections_ui.cjs',
                    f'http://127.0.0.1:{server.server_port}'], capture_output=True, text=True, timeout=75)
                self.assertEqual(result.returncode, 0, result.stderr)
                config = server.registry.config('ai')
                self.assertEqual(config['connection'], 'compatible')
                self.assertEqual(config['api_key'], 'fixture-compatible')
                self.assertEqual(server.registry.configs()['ai_profiles']['local_codex']['api_key'], 'fixture-bridge')
            finally:
                server.shutdown()
                server.server_close()

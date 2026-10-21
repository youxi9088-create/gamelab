from controlplane.runtime import node_binary
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from controlplane.service import Service
from server import build_server


class DashboardUITests(unittest.TestCase):
    def test_real_api_cards_and_mobile(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp)
            service = Service(root/'data', root/'repo', 'http://127.0.0.1:8766')
            c = service.mutate('/api/candidates', {'title': '隔离验证游戏', 'url': 'https://example.org/game'})['candidate']
            with service.store.tx() as db:
                service.store.put(db, 'versions', dict(id='test-version', candidate_id=c['id'],
                                  status='draft', artifact_id='fixture-only',
                                  report={'path': 'B'}, created_at=c['created_at']))
            server = build_server(service, 0)
            threading.Thread(target=server.serve_forever, daemon=True).start()
            try:
                node = node_binary()
                result = subprocess.run([str(node), 'tools/check_dashboard_ui.cjs',
                                         f'http://127.0.0.1:{server.server_port}'],
                                        capture_output=True, text=True, timeout=60)
                self.assertEqual(result.returncode, 0, result.stderr)
            finally:
                server.shutdown()
                server.server_close()

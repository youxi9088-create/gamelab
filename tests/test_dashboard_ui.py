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
            rate={'currency':'USD','input_per_million':10,'output_per_million':50,
                  'cached_input_per_million':1,'cache_write_per_million':12.5,
                  'long_context':{'threshold':272000,'input_per_million':20,'output_per_million':75,
                                  'cached_input_per_million':2,'cache_write_per_million':25}}
            service.mutate('/api/ai-pricing',{'rates':{'api:fixture':rate}})
            with service.store.tx() as db:
                from controlplane.usage import record
                record(service.store,db,{'id':'fixture','candidate_id':c['id'],'round':1},
                       {'call_id':'fixture','provider':'api','model':'fixture','stage':'adapt',
                        'input_tokens':100000,'output_tokens':1000,'cached_input_tokens':20000,
                        'cache_write_tokens':10000}, {'api:fixture':rate})
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

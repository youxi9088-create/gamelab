import subprocess
import threading
import unittest
from controlplane.runtime import node_binary
from server import build_server
import test_conversations as fixtures


class ProductUITests(unittest.TestCase):
    def test_facets_compact_cards_task_sections_and_fonts(self):
        fixture=fixtures.ConversationsTest();fixture.setUp();self.addCleanup(fixture.doCleanups)
        service=fixture.s
        with service.store.tx() as db:
            for i in range(8):
                cid=f'ui-game-{i}'
                service.store.put(db,'candidates',dict(id=cid,title=f'隔离游戏 {i}',url=f'https://example.org/{i}',canonical_url=f'https://example.org/{i}',category='益智' if i<4 else '休闲',engine='Cocos Creator 3.5.1' if i%2==0 else 'Canvas 2D',source='UI fixture',status='accepted',created_at='2026-10-21T01:00:00+00:00',observations={}))
                service.store.put(db,'versions',dict(id=f'ui-version-{i}',candidate_id=cid,status='approved',created_at='2026-10-21T01:00:00+00:00',report={}))
        server=build_server(service,0)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        self.addCleanup(server.server_close);self.addCleanup(server.shutdown)
        result=subprocess.run([str(node_binary()),'tools/check_product_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=100)
        self.assertEqual(result.returncode,0,result.stderr)

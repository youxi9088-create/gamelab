from controlplane.runtime import node_binary
import subprocess
import threading
import unittest
from pathlib import Path
from server import build_server
import test_conversations as fixtures

class LiveStatusTest(unittest.TestCase):
    def test_live_status_with_open_dialog_and_draft(self):
        fixture=fixtures.ConversationsTest();fixture.setUp();self.addCleanup(fixture.doCleanups)
        server=build_server(fixture.s,0)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        self.addCleanup(server.server_close);self.addCleanup(server.shutdown)
        node=node_binary()
        script=Path(__file__).resolve().parents[1]/'tools/check_live_status.cjs'
        result=subprocess.run([str(node),str(script),f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=65)
        self.assertEqual(0,result.returncode,result.stderr)

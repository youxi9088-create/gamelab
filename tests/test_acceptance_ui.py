from controlplane.runtime import node_binary
import subprocess
import threading
import unittest
from pathlib import Path
from server import build_server
import test_conversations as fixtures


class AcceptanceUITest(unittest.TestCase):
    def test_unknown_rights_functional_acceptance_through_browser(self):
        fixture=fixtures.ConversationsTest();fixture.setUp();self.addCleanup(fixture.doCleanups)
        fixture.s.mutate('/api/candidates/'+fixture.c['id']+'/update',{'rights':'unknown'})
        server=build_server(fixture.s,0)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        self.addCleanup(server.server_close);self.addCleanup(server.shutdown)
        node=node_binary()
        script=Path(__file__).resolve().parents[1]/'tools/check_acceptance_ui.cjs'
        result=subprocess.run([str(node),str(script),f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=60)
        self.assertEqual(0,result.returncode,result.stderr)
        state=fixture.s.state()
        self.assertEqual('approved',state['versions'][0]['status'])
        self.assertEqual('completed',state['jobs'][0]['status'])
        self.assertEqual('unknown',state['candidates'][0]['rights'])
        self.assertEqual(1,state['metrics']['accepted_games'])

if __name__=='__main__':unittest.main()

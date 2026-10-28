from controlplane.runtime import node_binary
import subprocess
import threading
import unittest
from pathlib import Path
from server import build_server
from test_discovery import DiscoveryTests

class DiscoveryUITest(unittest.TestCase):
    def test_selection_schedule_and_layout(self):
        f=DiscoveryTests();f.setUp();self.addCleanup(f.doCleanups)
        from controlplane.game_technology import classify
        f.result['games'][0]['technology'] = classify(metadata={'gamePlatform':'HTML5'})
        f.result['games'].append(dict(f.result['games'][0],url='https://example.org/game/b',title='Game B',category='Racing'))
        f.scheduler.tick(f.instant)
        server=build_server(f.s,0)
        threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            node=node_binary()
            r=subprocess.run([str(node),'tools/check_discovery_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=60)
            self.assertEqual(r.returncode,0,r.stderr)
            state=f.s.state()
            self.assertEqual(state['jobs'],[])
            self.assertEqual({r['status'] for r in state['recommendations']},{'rejected','pending_capture'})
            self.assertEqual(state['discovery_settings']['hour'],10)
        finally:server.shutdown();server.server_close()

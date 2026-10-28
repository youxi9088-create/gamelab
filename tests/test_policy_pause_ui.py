import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from controlplane.service import Service
from controlplane.runtime import node_binary
from server import build_server
from test_policy_presentation import CASES


class PauseUITests(unittest.TestCase):
    def test_labels_and_detail(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);service=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            batch=service.mutate('/api/conversions',{'urls':['https://example.org/game/'+str(i) for i in range(3)]})
            with service.store.tx() as db:
                for job,(reason,_) in zip(batch['jobs'],CASES):
                    job.update(status='waiting_input',web_only=True,reason=reason,question=reason)
                    service.store.put(db,'jobs',job)
            server=build_server(service,0)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                result=subprocess.run([node_binary(),'tools/check_policy_pause_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=60)
                self.assertEqual(result.returncode,0,result.stderr)
            finally:server.shutdown();server.server_close()

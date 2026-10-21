from controlplane.runtime import node_binary
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from controlplane.service import Service
from server import build_server

class PipelineUITest(unittest.TestCase):
    def test_links_and_timeline_on_isolated_database(self):
        with tempfile.TemporaryDirectory() as tmp:
            root=Path(tmp)
            service=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            server=build_server(service,0)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                node=node_binary()
                result=subprocess.run([str(node),'tools/check_pipeline_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=60)
                self.assertEqual(result.returncode,0,result.stderr)
                self.assertEqual(len(service.state()['jobs']),2)
                self.assertEqual(service.state()['versions'],[])
            finally:
                server.shutdown();server.server_close()

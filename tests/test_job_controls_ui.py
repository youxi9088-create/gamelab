import tempfile,threading,subprocess,unittest
from pathlib import Path
from controlplane.service import Service
from controlplane.runtime import node_binary
from server import build_server
class JobControlsUI(unittest.TestCase):
 def test_bulk_controls(self):
  with tempfile.TemporaryDirectory() as temp:
   root=Path(temp);s=Service(root/'data',root/'repo','http://127.0.0.1:8766')
   s.mutate('/api/conversions',{'urls':['https://example.org/'+str(i) for i in range(51)]+['https://example.net/a','https://example.com/a']})
   server=build_server(s,0);threading.Thread(target=server.serve_forever,daemon=True).start()
   try:
    result=subprocess.run([node_binary(),'tools/check_job_controls_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=90)
    self.assertEqual(result.returncode,0,result.stderr)
   finally:server.shutdown();server.server_close()

import subprocess
import tempfile
import threading
import time
import unittest
from pathlib import Path
from unittest.mock import patch
from controlplane.runtime import node_binary
from controlplane.service import Service
from server import build_server


class AIProbeUITest(unittest.TestCase):
    def test_slow_probe_finishes_after_background_refresh(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory)
            service=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            server=build_server(service,0)
            server.registry.save('ai',dict(connection='compatible',api_key='fixture-key'))
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                def complete(messages,config,timeout):
                    self.assertEqual(timeout,60)
                    time.sleep(4)
                    return {'ok':True},'api'
                with patch('controlplane.ai_provider.complete',side_effect=complete):
                    result=subprocess.run([str(node_binary()),'tools/check_ai_probe_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=30)
                self.assertEqual(result.returncode,0,result.stderr)
            finally:
                server.shutdown();server.server_close()

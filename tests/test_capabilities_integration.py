import json
from pathlib import Path
import subprocess
import threading
import unittest
import test_platform
from controlplane.runtime import node_binary
from controlplane.conversion_plan import build
from controlplane.service import ApiError
from server import build_server

class IntegrationTests(unittest.TestCase):
    def setUp(self):
        self.f=test_platform.PlatformTest();self.f.setUp();self.addCleanup(self.f.doCleanups);self.s=self.f.s
    def test_worker_plan_usage_and_immutable_delivery(self):
        c=self.f.enqueue();j=self.f.claim();lease={'lease_token':j['lease_token']};prefix='/api/v1/jobs/'+j['id']
        plan=build(c)
        self.s.mutate(prefix+'/plan',{**lease,'plan':plan},self.f.tool)
        body={**lease,'usage':{'call_id':'fixture-call','provider':'api','model':'fixture','input_tokens':50,'output_tokens':10,'stage':'analysis','duration_seconds':1}}
        self.s.mutate(prefix+'/usage',body,self.f.tool);self.s.mutate(prefix+'/usage',body,self.f.tool)
        self.assertEqual(self.s.state()['usage']['day'][0]['calls'],1)
        completed=self.f.completion(j)
        version=self.s.state()['versions'][0]
        self.assertEqual(version['report']['conversion_plan'],plan)
        target=self.s.repo.root/version['source_directory']/'platform-delivery'
        self.assertTrue((target/'resource-audit.json').exists())
        self.assertTrue(json.loads((target/'engineering-report.json').read_text('utf-8'))['verification_gaps'])
        with self.assertRaises(ApiError):self.s.mutate(prefix+'/usage',body,self.f.tool)
    def test_platform_ui(self):
        self.f.enqueue()
        server=build_server(self.s,0);threading.Thread(target=server.serve_forever,daemon=True).start()
        try:
            r=subprocess.run([node_binary(),'tools/check_capabilities_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,encoding='utf-8',timeout=90)
            self.assertEqual(r.returncode,0,r.stdout+r.stderr)
        finally:server.shutdown();server.server_close()

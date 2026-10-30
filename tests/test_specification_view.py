import http.cookiejar
import tempfile
import threading
import unittest
import urllib.request
import subprocess
from pathlib import Path
from controlplane.service import Service
from server import build_server


class SpecificationViewTests(unittest.TestCase):
    def test_version_markdown_uses_registered_facts_and_not_operational_report(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);service=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            image=service.repo.artifacts/'fixture-only/screenshots/step-0.png'
            image.parent.mkdir(parents=True)
            import base64
            image.write_bytes(base64.b64decode('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3ioAAAAASUVORK5CYII='))
            with service.store.tx() as db:
                service.store.put(db,'candidates',{'id':'fixture','title':'Fixture Game','url':'https://example.org/fixture','status':'review','created_at':'2026-10-22T00:00:00+00:00'})
                service.store.put(db,'versions',{'id':'v-fixture','candidate_id':'fixture',
                    'status':'review','artifact_id':'fixture-only','created_at':'2026-10-22T00:00:00+00:00',
                    'report':{'summary':'PRIVATE_OPERATIONAL_REPORT','game_profile':{'core_gameplay':'old'}}})
                service.store.put(db,'game_profiles',{'id':'v-fixture','profile':{'core_gameplay':'Move and collect','dimension':'2D','illustrations':[{'path':'screenshots/step-0.png','caption':'Observed start; later levels unknown'}]}})
            server=build_server(service,0)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                base=f'http://127.0.0.1:{server.server_port}'
                client=urllib.request.build_opener(urllib.request.HTTPCookieProcessor(http.cookiejar.CookieJar()))
                client.open(base+'/api/session').close()
                with client.open(base+'/api/versions/v-fixture/specification.md') as response:
                    self.assertIn('text/markdown',response.headers['Content-Type'])
                    self.assertIsNone(response.headers.get('Content-Disposition'))
                    text=response.read().decode('utf-8')
                self.assertIn('# Fixture Game 游戏规格说明书',text)
                self.assertIn('Move and collect',text)
                self.assertIn('未登记',text)
                self.assertNotIn('PRIVATE_OPERATIONAL_REPORT',text)
                self.assertNotIn('\nold\n',text)
                self.assertIn('/api/versions/v-fixture/specification-images/screenshots/step-0.png',text)
                with client.open(base+'/api/versions/v-fixture/specification-images/screenshots/step-0.png') as response:self.assertEqual(response.read(),image.read_bytes())
                with self.assertRaises(urllib.error.HTTPError):client.open(base+'/api/versions/v-fixture/specification-images/screenshots/other.png')
                from controlplane.runtime import node_binary
                result=subprocess.run([node_binary(),'tools/check_specification_ui.cjs',base],capture_output=True,text=True,encoding='utf-8',timeout=60)
                self.assertEqual(result.returncode,0,result.stderr)
                server.auth_required=True
                with self.assertRaises(urllib.error.HTTPError) as error:urllib.request.urlopen(base+'/api/versions/v-fixture/specification.md')
                self.assertEqual(error.exception.code,401)
            finally:server.shutdown();server.server_close()

import hashlib,tempfile,threading,unittest,urllib.request
from pathlib import Path
from unittest.mock import patch
from controlplane.runtime_compatibility import mounted_boot
from controlplane.service import Service
from server import build_server

class RuntimeCompatibilityTests(unittest.TestCase):
    def test_unknown_or_custom_hosts_are_unchanged(self):
        original=b'const cache={};\n// custom host\n'
        self.assertEqual(mounted_boot(original),(original,None))

    def test_served_legacy_host_is_adapted_without_mutating_artifact(self):
        original=b"const cache={};\nconst parent=new URL(document.currentScript.src).pathname.slice(1);\nrequireModule(url.replace(/^\\//,''));\n"
        digest=hashlib.sha256(original).hexdigest()
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);service=Service(root/'data',root/'repo','http://127.0.0.1')
            folder=service.repo.artifacts/'fixture/runtime';folder.mkdir(parents=True)
            (folder/'boot.js').write_bytes(original)
            with service.store.tx() as db:service.store.put(db,'artifacts',{'id':'fixture','runtime_local':True})
            server=build_server(service,0,playback=True)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                with patch('controlplane.runtime_compatibility.LEGACY_BOOT_HASHES',{digest}):
                    with urllib.request.urlopen(f'http://127.0.0.1:{server.server_port}/runtime/fixture/runtime/boot.js') as response:
                        value=response.read()
                        self.assertEqual(response.headers['X-GameLab-Runtime-Compatibility'],'module-base-v1')
                        self.assertEqual(response.headers['X-GameLab-Artifact-File-SHA256'],digest)
                self.assertIn(b'const runtimeBase=',value)
                self.assertIn(b'requireModule(runtimeModulePath(url))',value)
                self.assertEqual((folder/'boot.js').read_bytes(),original)
            finally:server.shutdown();server.server_close()

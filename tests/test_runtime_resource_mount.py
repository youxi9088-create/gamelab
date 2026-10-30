import hashlib
import json
import subprocess
import tempfile
import threading
import unittest
import urllib.request
from pathlib import Path

from controlplane.runtime import node_binary
from controlplane.runtime_compatibility import mounted_resource_bindings
from controlplane.service import Service
from server import build_server

ROOT=Path(__file__).resolve().parents[1]

class RuntimeResourceMountTests(unittest.TestCase):
    def test_unknown_adapter_or_missing_file_is_not_rewritten(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            original=b'// custom adapter'
            self.assertEqual(mounted_resource_bindings(original,root),(original,None))
            original=(ROOT/'executors/adapters/runtime-resource-bindings.js').read_bytes()
            (root/'runtime-resource-map.js').write_text('window.runtimeResourceBindings='+json.dumps({'https://assets.example/x.json':'/_runtime_resources/'+'a'*24+'.json'})+';')
            self.assertEqual(mounted_resource_bindings(original,root),(original,None))

    def test_nested_mount_fetches_real_json_and_keeps_artifact_immutable(self):
        original=(ROOT/'executors/adapters/runtime-resource-bindings.js').read_bytes()
        resource='/_runtime_resources/'+'a'*24+'.json'
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)
            service=Service(root/'data',root/'repo','http://127.0.0.1',runs_dir=root/'runs')
            folder=service.repo.artifacts/'fixture';folder.mkdir(parents=True)
            (folder/'_runtime_resources').mkdir()
            (folder/resource.lstrip('/')).write_text('{"words":["hello"]}')
            (folder/'runtime-resource-map.js').write_text('window.runtimeResourceBindings='+json.dumps({'https://assets.example/words.json':resource})+';')
            (folder/'runtime-resource-bindings.js').write_bytes(original)
            (folder/'index.html').write_text('<script src="runtime-resource-map.js"></script><script src="runtime-resource-bindings.js"></script>')
            with service.store.tx() as db:service.store.put(db,'artifacts',{'id':'fixture','runtime_local':True})
            server=build_server(service,0,playback=True)
            threading.Thread(target=server.serve_forever,daemon=True).start()
            base=f'http://127.0.0.1:{server.server_port}/runtime/fixture/'
            try:
                with urllib.request.urlopen(base+'runtime-resource-bindings.js') as response:
                    self.assertEqual(response.headers['X-GameLab-Runtime-Compatibility'],'observed-resource-base-v1')
                    self.assertEqual(response.headers['X-GameLab-Artifact-File-SHA256'],hashlib.sha256(original).hexdigest())
                script='''const {chromium}=require('./executors/node_modules/playwright');
                (async()=>{const b=await chromium.launch(require('./executors/browser-options.cjs')());
                try{const p=await b.newPage();await p.goto(process.argv[1]);
                for(const url of [process.argv[2],'https://assets.example/words.json']){
                 const value=await p.evaluate(async u=>{const r=await fetch(u);return {status:r.status,data:await r.json()};},url);
                 if(value.status!==200||value.data.words[0]!=='hello')throw Error(JSON.stringify(value));
                }}finally{await b.close();}})().catch(e=>{console.error(e);process.exitCode=1;});'''
                result=subprocess.run([node_binary(),'-e',script,base+'index.html',resource],cwd=ROOT,capture_output=True,text=True,timeout=45)
                self.assertEqual(result.returncode,0,result.stderr)
                self.assertEqual((folder/'runtime-resource-bindings.js').read_bytes(),original)
            finally:server.shutdown();server.server_close()

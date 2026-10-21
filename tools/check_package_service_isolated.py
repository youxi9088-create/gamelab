"""End-to-end protocol test with authored synthetic packages, never real games."""
import importlib.util
import json
import os
import struct
import sys
import tempfile
import threading
from pathlib import Path
from unittest.mock import patch
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT));sys.path.insert(0,str(ROOT/'executors'))
from controlplane.service import Service
from controlplane.runtime import node_binary
import worker


def package(path,files):
    entries=[(name,body.encode()) for name,body in files.items()]
    offset=18+sum(12+len(n.encode()) for n,_ in entries);table=b''
    for name,body in entries:
        encoded=name.encode();table+=struct.pack('>I',len(encoded))+encoded+struct.pack('>II',offset,len(body));offset+=len(body)
    path.parent.mkdir(parents=True,exist_ok=True)
    path.write_bytes(b'\xbe'+b'\0'*12+b'\xed'+struct.pack('>I',len(entries))+table+b''.join(body for _,body in entries))


def main():
    spec=importlib.util.spec_from_file_location('isolated_package_server',ROOT/'services/wechat-web-service/server.py')
    module=importlib.util.module_from_spec(spec);spec.loader.exec_module(module)
    with tempfile.TemporaryDirectory() as folder,patch.dict(os.environ,{'NODE_BIN':node_binary()}):
        root=Path(folder);cache=root/'cache';appid='wx1111111111111111';engine='wx2222222222222222'
        config={'gamePlugins':{'cocos':{'provider':engine}}}
        modules={
            'application.js':"exports.createApplication=async()=>({import:async()=>{window.cc={assetManager:{downloader:{register(){}}},debug:{setDisplayStats(){}}};return window.cc},start:async()=>{const c=document.querySelector('canvas');c.width=400;c.height=400;const x=c.getContext('2d');x.fillStyle='#224466';x.fillRect(0,0,400,400);x.fillStyle='white';x.fillText('Authored isolated converter fixture',30,100)}});",
            'src/polyfills.bundle.js':'',
            'src/system.bundle.js':"window.System={warmup(){},import:async()=>require('application.js')};",
            'src/import-map.js':'exports.default={};','cocos-js/cc.js':''}
        wrapper=lambda name,body:'define('+json.dumps(name)+', function(require, module, exports){\n'+body+'\n\t\t\t});'
        package(cache/appid/'1/main.wxapkg',{'game.js':'\n'.join(wrapper(n,b) for n,b in modules.items()),'src/settings.json':json.dumps({'CocosEngine':'3.5.1','designResolution':{'width':400,'height':400}}),'app-config.json':json.dumps(config),'cocos/signature.json':'{"signature":[]}','assets/fixture.txt':'Authored fixture'})
        package(cache/engine/'1/plugin.wxapkg',{'plugin.js':wrapper('fixture.js','exports.fixture=true;')})
        converter=module.Service(root/'converter',{'fixture':'isolated-test-key-01234567890123456789'})
        http=module.make_server(converter,port=0);threading.Thread(target=http.serve_forever,daemon=True).start()
        try:
            services=root/'services.json';services.write_text(json.dumps({'wechat':{'backend':'wxapkg_v1','base_url':f'http://127.0.0.1:{http.server_port}','api_key':'isolated-test-key-01234567890123456789'}}))
            service=Service(root/'platform',root/'repo','http://127.0.0.1:8766')
            registration=service.mutate('/api/tools',{'name':'isolated built-in','capabilities':['rea','reconstruct']});tool=registration['tool']
            (root/'platform/executor-token.txt').write_text(registration['token'])
            candidate=service.mutate('/api/candidates',{'url':'#小程序://Isolated/fixture','title':'Isolated package','observations':{'appid':appid}})['candidate']
            batch=service.mutate('/api/batches',{'name':'isolated','candidate_ids':[candidate['id']]})['batch']
            service.mutate('/api/batches/'+batch['id']+'/start',{'automatic':True})
            class Client:
                def post(self,path,body):return service.mutate('/api/v1/'+path,body,tool)
            client=Client();job=client.post('jobs/claim',{'capabilities':['rea']})['job']
            with patch.dict(os.environ,{'REPLICA_SERVICE_CONFIG':str(services),'REPLICA_WECHAT_CACHE_ROOTS':str(cache),'APPDATA':''}):worker.execute(client,job)
            with service.store.tx() as db:
                finished=service.get(db,'jobs',job['id']);versions=service.store.all(db,'versions')
            result={'synthetic_fixture':True,'job_status':finished['status'],'reason':finished.get('reason'),'version_status':versions[0]['status'] if versions else None,'report':finished.get('report')}
            output=ROOT/'qa-output/package-service';output.mkdir(parents=True,exist_ok=True)
            (output/'result.json').write_text(json.dumps(result,ensure_ascii=False,indent=2),'utf-8')
            print(json.dumps({k:v for k,v in result.items() if k!='report'},ensure_ascii=False))
            assert versions and versions[0]['status']=='draft',result['reason']
            assert result['report']['converter']['status']=='built_unverified'
        finally:http.shutdown();http.server_close();converter.pool.shutdown(wait=True)


if __name__=='__main__':main()

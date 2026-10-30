import io
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import modular_web as m


class ModularWebTests(unittest.TestCase):
    def test_static_transport_browser_fallback_after_curl_reset(self):
        import base64,subprocess,urllib.error
        html=b'<html><script src="game.js"></script></html>'
        calls=[];real=m.subprocess.run;which=m.shutil.which
        def execute(command,**kwargs):
            calls.append(command)
            if command[0]=='fixture-curl' and '--silent' in command:return subprocess.CompletedProcess(command,35,b'\n000',b'connection reset')
            if len(command)>1 and str(command[1]).endswith('browser-resource-transfer.cjs'):
                return subprocess.CompletedProcess(command,0,json.dumps({'status':200,'headers':{},'data':base64.b64encode(html).decode()}).encode(),b'')
            return real(command,**kwargs)
        class Client:
            def open(self,*a,**k):raise urllib.error.URLError('reset')
        class Budget:
            def remaining(self,n):return n
        with tempfile.TemporaryDirectory() as tmp,patch.object(m,'validate_url',side_effect=m.urllib.parse.urlsplit),patch.object(m,'tls_context',return_value=None),patch.object(m.urllib.request,'build_opener',return_value=Client()),patch.object(m.shutil,'which',side_effect=lambda name:'fixture-curl' if name in ('curl.exe','curl') else which(name)),patch.object(m.subprocess,'run',side_effect=execute):
            root=Path(tmp)
            with self.assertRaises(m.UnsupportedContract):m.capture('https://game.example/play','https://portal.example/',root,Budget())
            self.assertEqual((root/'web-original/index.html').read_bytes(),html)
            self.assertTrue(any(len(c)>1 and str(c[1]).endswith('browser-resource-transfer.cjs') for c in calls))

    def test_portal_runtime_graph_with_bare_three(self):
        engine='https://remix.gg/portal-runtime/1/three-'+('a'*64)+'.mjs'
        runtime='https://remix.gg/portal-runtime/1/'+('b'*64)+'.mjs'
        url='https://g-fixture.games.remix.gg/versions/one'
        html='<script src="https://cdn.jsdelivr.net/npm/@remix-gg/sdk@0.21.0/dist/index.min.js"></script><script type="importmap">'+json.dumps({'imports':{'three':engine}})+'</script><script type="module">import {game} from "'+runtime+'";game();</script>'
        data={url:html.encode(),engine:b'export const Engine=1;',runtime:b'import {Engine} from "three";export const game=()=>Engine;'}
        class Client:
            def open(self,req,timeout):return io.BytesIO(data[req.full_url])
        class Budget:
            def remaining(self,t):return t
        with tempfile.TemporaryDirectory() as tmp,patch.object(m,'validate_url',side_effect=m.urllib.parse.urlsplit),patch.object(m,'tls_context',return_value=None),patch.object(m.urllib.request,'build_opener',return_value=Client()):
            root=Path(tmp);r=m.capture(url,'https://example.org',root,Budget())
            self.assertEqual(r['module_contract'],'portal-three')
            self.assertEqual(len(r['files']),3)
            self.assertNotIn('https://remix.gg/portal-runtime',(root/'converted/index.html').read_text())
            runtime_file=next(f['path'] for f in r['files'] if f['url']==runtime)
            self.assertNotIn('from "three"',(root/'converted'/runtime_file).read_text())
        self.assertFalse(m.portal_module('https://other.example/portal-runtime/1/'+('a'*64)+'.mjs'))
        self.assertFalse(m.portal_module('https://remix.gg/portal-runtime/1/latest.mjs'))

    def test_tls_fallback_keeps_redirect_and_size_limits(self):
        html=b'<script src="https://cdn.jsdelivr.net/npm/@remix-gg/sdk@0.22.0/dist/index.min.js"></script><script type="importmap">{"imports":{"three":"https://esm.sh/three@0.185.1"}}</script>'
        calls=[]
        class Client:
            def open(self,*args,**kwargs):raise m.urllib.error.URLError('TLS timeout')
        class Budget:
            def remaining(self,t):return t
        original=m.subprocess.run
        original_which=m.shutil.which
        def process(command,**kwargs):
            if command[0]=='fixture-curl':
                calls.append(command)
                data=html if command[-1].startswith('https://game.') else b'export const sample=1;'
                return m.subprocess.CompletedProcess(command,0,data+b'\n200',b'')
            return original(command,**kwargs)
        with tempfile.TemporaryDirectory() as tmp,patch.object(m,'validate_url',side_effect=m.urllib.parse.urlsplit),patch.object(m,'tls_context',return_value=None),patch.object(m.urllib.request,'build_opener',return_value=Client()),patch.object(m.shutil,'which',side_effect=lambda name:'fixture-curl' if name in ('curl','curl.exe') else original_which(name)),patch.object(m.subprocess,'run',side_effect=process):
            result=m.capture('https://game.example.org/index.html','https://example.org',Path(tmp),Budget())
        self.assertTrue(result['complete'])
        self.assertEqual(len(calls),2)
        for command in calls:
            self.assertIn('--max-filesize',command)
            self.assertEqual(command[command.index('--max-redirs')+1],'0')
            self.assertNotIn('--insecure',command)
    def test_redirected_portal_canvas_is_not_game_entry(self):
        from discovered_web import entry
        observation={'url':'https://example.org/g/game','web_discovery':{'entries':[{'url':'https://example.org/?next=%2Fg%2Fgame','evidence':'rendered-canvas','canvas_count':1}]}}
        with self.assertRaises(ValueError):entry(observation)
        observation['web_discovery']['entries'][0]['url']='https://runtime.example.org/game'
        self.assertEqual(entry(observation)['url'],'https://runtime.example.org/game')
    def test_bundled_contract_rejects_unclosed_imports(self):
        class Budget:
            def remaining(self,t):return t
        html='<script type="module">const marker="THREE.WebGLRenderer";</script>'
        self.assertTrue(m.bundled_three(html,{},Budget()))
        self.assertFalse(m.bundled_three('<script type="module">const a=1;</script>',{},Budget()))
        with self.assertRaises(ValueError):
            m.bundled_three(html.replace('const marker','import "./missing.js"; const marker'),{},Budget())
        for expression in ('import("./missing.js")','import(variable)'):
            with self.assertRaises(ValueError):
                m.bundled_three(html.replace('const marker',expression+'; const marker'),{},Budget())

    def test_bundled_capture(self):
        url='https://g-example.games.remix.gg/versions/a'
        html='<script src="https://cdn.jsdelivr.net/npm/@remix-gg/sdk@0.22.0/dist/index.min.js"></script><script type="importmap">{"imports":{}}</script><script type="module">const renderer="THREE.WebGLRenderer";const assets=["https://assets.example.org/van.gltf-binary","https://assets.example.org/music.mpeg"];</script>'
        assets={'https://assets.example.org/van.gltf-binary':b'glTF-fixture','https://assets.example.org/music.mpeg':b'audio-fixture'}
        class Client:
            def open(self,req,timeout):return io.BytesIO(assets.get(req.full_url,html.encode()))
        class Budget:
            def remaining(self,t):return t
        with tempfile.TemporaryDirectory() as tmp,patch.object(m,'validate_url',side_effect=m.urllib.parse.urlsplit),patch.object(m,'tls_context',return_value=None),patch.object(m.urllib.request,'build_opener',return_value=Client()):
            root=Path(tmp);result=m.capture(url,'https://example.org',root,Budget())
            self.assertEqual(result['module_contract'],'bundled-three')
            self.assertEqual((root/'web-original/index.html').read_text(),html)
            self.assertIn('local-host.js',(root/'converted/index.html').read_text())
            self.assertNotIn('https://assets.example.org/',(root/'converted/index.html').read_text())
            for address,body in assets.items():
                item=next(f for f in result['files'] if f['url']==address)
                self.assertEqual((root/'converted'/item['path']).read_bytes(),body)

    def test_unique_visible_host(self):
        o={'web_discovery':{'iframe_hints':[{'url':'https://g-example.games.remix.gg/versions/a','width':900,'height':600,'evidence':'iframe-src'}]}}
        self.assertTrue(m.candidate(o))
        from controlplane.conversion_plan import build
        self.assertEqual(build({'url':'https://example.org'},o)['route'],'discovered-web')
        from controlplane.catalog_facets import effective_engine
        self.assertEqual(effective_engine({'id':'fixture','engine':'待分析'},[{'candidate_id':'fixture','report':{'recovery_kind':'discovered-web-three'}}]),'Three.js')
        o['web_discovery']['iframe_hints'].append({'url':'https://g-other.games.remix.gg/versions/b','width':900,'height':600,'evidence':'iframe-src'})
        self.assertIsNone(m.candidate(o))

    def test_standard_three_contract(self):
        self.test_capture_preserves_source_and_localizes_graph(standard=True)

    def test_capture_preserves_source_and_localizes_graph(self,standard=False):
        url='https://g-example.games.remix.gg/versions/a'
        html='<html><script src="https://cdn.jsdelivr.net/npm/@remix-gg/sdk@0.16.0/dist/index.min.js"></script><script type="importmap">'+json.dumps({'imports':{'@remix-gg/three':'https://esm.sh/runtime','@remix-gg/three/three':'https://esm.sh/engine'}})+'</script><script type="module">import {game} from "@remix-gg/three"; game();</script></html>'
        data={url:html.encode(),'https://esm.sh/runtime':'/* module header */\nconst label=`😀 from "srgb-linear"`;\nimport "/engine";\nexport const game=()=>{};'.encode(), 'https://esm.sh/engine':b'export const Engine=1;'}
        if standard:
            html=html.replace('@remix-gg/three/three','three/addons/example.js').replace('@remix-gg/three','three').replace('https://esm.sh/runtime','https://esm.sh/three@0.185.1')
            data[url]=html.encode()
            data['https://esm.sh/three@0.185.1']=data.pop('https://esm.sh/runtime')
        class Client:
            def open(self,req,timeout):return io.BytesIO(data[req.full_url])
        class Budget:
            def remaining(self,t):return t
        with tempfile.TemporaryDirectory() as tmp,patch.object(m,'validate_url',side_effect=m.urllib.parse.urlsplit),patch.object(m,'tls_context',return_value=None),patch.object(m.urllib.request,'build_opener',return_value=Client()):
            root=Path(tmp);r=m.capture(url,'https://example.org',root,Budget())
            self.assertEqual(r['engine'],'three')
            self.assertEqual((root/'web-original/index.html').read_text(),html)
            output=(root/'converted/index.html').read_text()
            self.assertIn('local-host.js',output)
            self.assertNotIn('https://esm.sh/',output)
            module=next((root/'converted/vendor').glob('*three*' if standard else '*runtime*')).read_text()
            self.assertIn('./002-engine.js',module)
            self.assertIn('from "srgb-linear"',module)
            parsed=m.subprocess.run([__import__('controlplane.runtime',fromlist=['node_binary']).node_binary(),str(m.ROOT/'module-imports.cjs')],input=module.encode(),capture_output=True)
            self.assertEqual(parsed.returncode,0,parsed.stderr)
            self.assertIn('game();',output)


if __name__=='__main__':unittest.main()

class BrowserTransferRetryTests(unittest.TestCase):
    def test_retry_recovers_and_keeps_diagnostic(self):
        import subprocess,base64
        class Budget:
            def remaining(self,n):return n
        outcomes=[subprocess.CompletedProcess([],1,b'',b'Failed to fetch'),subprocess.CompletedProcess([],0,json.dumps({'status':200,'data':base64.b64encode(b'model').decode()}).encode(),b'')]
        with tempfile.TemporaryDirectory() as tmp,patch.object(m.subprocess,'run',side_effect=outcomes) as call:
            self.assertEqual(m.browser_get('https://example.org/model',Path(tmp),Budget()),b'model')
            self.assertEqual(call.call_count,2)
            self.assertIn('Failed to fetch',(Path(tmp)/'acquisition/transfer-errors.jsonl').read_text())
    def test_http_denial_does_not_retry_and_network_is_bounded(self):
        import subprocess
        class Budget:
            def remaining(self,n):return n
        with tempfile.TemporaryDirectory() as tmp:
            with patch.object(m.subprocess,'run',return_value=subprocess.CompletedProcess([],0,b'{"status":403}',b'')) as call:
                with self.assertRaisesRegex(ValueError,'HTTP 403'):m.browser_get('https://example.org/model',Path(tmp),Budget())
                self.assertEqual(call.call_count,1)
            with patch.object(m.subprocess,'run',return_value=subprocess.CompletedProcess([],1,b'',b'connection reset')) as call:
                with self.assertRaisesRegex(ValueError,'3次'):m.browser_get('https://example.org/model',Path(tmp),Budget())
                self.assertEqual(call.call_count,3)

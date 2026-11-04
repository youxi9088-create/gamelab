import hashlib
import os
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch
from urllib.parse import urlsplit
from controlplane.runtime import node_binary

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from runtime_recovery import StaticRecovery
from auto_repair import CHAT, guarded
from repair_context import RepairContext
from discovered_web import observe_verified, sync_runtime_resources


class Budget:
    calls=8
    def remaining(self,n):return n


class Response:
    headers={'Content-Type':'application/javascript'}
    def __enter__(self):return self
    def __exit__(self,*args):pass
    def read(self,n):return b'document.querySelector("h1").textContent="Local dependency ready";'


class RuntimeRecoveryTest(unittest.TestCase):
    def test_native_import_map_preserves_existing_aliases_and_source(self):
        import re
        original='<html><head><script type="importmap">{"imports":{"existing":"./existing.js"}}</script></head><body><script src="loader.js"></script></body></html>'
        loader='import('+json.dumps(self.url)+');'
        (self.target/'index.html').write_text(original)
        (self.target/'loader.js').write_text(loader)
        result=self.recovery.execute(self.args)
        html=(self.target/'index.html').read_text()
        mapping=json.loads(re.search(r'<script type="importmap">(.*?)</script>',html)[1])
        self.assertEqual(mapping['imports']['existing'],'./existing.js')
        self.assertEqual(mapping['imports'][self.url],'./'+result['files'][0]['path'])
        self.assertEqual((self.target/'loader.js').read_text(),loader)
        self.recovery.rollback()
        self.assertEqual((self.target/'index.html').read_text(),original)

    def test_browser_native_import_uses_captured_module(self):
        (self.target/'index.html').write_text('<html><head></head><body><h1>Fixture</h1><script src="loader.js"></script></body></html>')
        (self.target/'loader.js').write_text('import('+json.dumps(self.url)+');')
        self.recovery.execute(self.args)
        result=subprocess.run([node_binary(),'tests/test_native_module_binding.cjs',str(self.run)],capture_output=True,text=True,encoding='utf-8',timeout=45)
        self.assertEqual(result.returncode,0,result.stdout+result.stderr)
        legacy=subprocess.run([node_binary(),'tests/test_native_module_binding.cjs',str(self.run),'legacy'],capture_output=True,text=True,encoding='utf-8',timeout=45)
        self.assertEqual(legacy.returncode,0,legacy.stdout+legacy.stderr)
    def test_literal_audio_fetch_keeps_real_wav_bytes_and_requires_reverification(self):
        import io,wave
        data=io.BytesIO()
        with wave.open(data,'wb') as wav:
            wav.setnchannels(1);wav.setsampwidth(2);wav.setframerate(8000);wav.writeframes(b'\0\0'*800)
        content=data.getvalue();url='https://assets.example/track.wav'
        (self.target/'index.html').write_text('<html><head></head><script>const track="'+url+'";fetch(track);</script></html>')
        self.report['resource_requests'][0].update(url=url,type='fetch');(self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
        class AudioResponse(Response):
            headers={'Content-Type':'audio/wav'}
            def read(self,n):return content
        with patch('runtime_recovery.urllib.request.build_opener') as opener:
            opener.return_value.open.return_value=AudioResponse();result=self.recovery.execute(self.args)
        self.assertTrue(result['verification_required']);self.assertEqual((self.target/result['files'][0]['path']).read_bytes(),content)

    def test_audio_fetch_rejects_disguised_non_audio_response(self):
        url='https://assets.example/track.mp3'
        (self.target/'index.html').write_text('<script>fetch("'+url+'");</script>')
        self.report['resource_requests'][0].update(url=url,type='fetch');(self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
        class InvalidAudio(Response):
            headers={'Content-Type':'audio/mpeg'}
            def read(self,n):return b'<!doctype html><h1>Unavailable</h1>'
        with patch('runtime_recovery.urllib.request.build_opener') as opener:
            opener.return_value.open.return_value=InvalidAudio()
            with self.assertRaisesRegex(ValueError,'文件头无效'):self.recovery.execute(self.args)
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.addCleanup(self.temp.cleanup)
        self.run=Path(self.temp.name);self.target=self.run/'converted'
        (self.target/'evidence').mkdir(parents=True)
        (self.target/'index.html').write_text('<html><head></head><body>Fixture</body></html>')
        (self.run/'web-acquisition.json').write_text('{"engine":"browser-dom","files":[],"bytes":0}')
        self.url='https://assets.example/runtime.js?v=2'
        self.report={'passed':False,'resource_requests':[{'id':'resource-1','url':self.url,'method':'GET','type':'script'}],
                     'issues':[{'code':'EXTERNAL_STATIC_RESOURCE'}]}
        (self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
        self.args={'resource_ids':['resource-1'],'reason':'Observed public script is needed for the local fixture startup.'}
        self.recovery=StaticRecovery(self.run,Budget())
        self.addCleanup(patch.stopall)
        patch('runtime_recovery.validate_url',side_effect=urlsplit).start()
        patch('runtime_recovery.tls_context',return_value=None).start()
        opener=patch('runtime_recovery.urllib.request.build_opener').start()
        opener.return_value.open.return_value=Response()

    def test_capture_has_exact_query_hash_and_rollback(self):
        before=(self.target/'index.html').read_bytes()
        result=self.recovery.execute(self.args)
        file=result['files'][0]
        self.assertEqual(file['sha256'],hashlib.sha256(Response().read(0)).hexdigest())
        self.assertEqual((self.run/'web-original'/file['path']).read_bytes(),Response().read(0))
        acq=json.loads((self.run/'web-acquisition.json').read_text('utf-8'))
        self.assertIn(self.url,acq['runtime_resource_map'])
        self.assertTrue(result['verification_required'])
        self.recovery.rollback()
        self.assertEqual((self.target/'index.html').read_bytes(),before)
        self.assertFalse((self.target/file['path']).exists())

    def test_rejects_unknown_api_and_navigation(self):
        for kind,method in [('xhr','GET'),('fetch','GET'),('document','GET'),('script','POST')]:
            self.report['resource_requests'][0].update(type=kind,method=method)
            (self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
            with self.assertRaises(ValueError):self.recovery.validate(self.args)
        with self.assertRaises(ValueError):self.recovery.validate(dict(self.args,resource_ids=['made-up']))

    def test_ai_capability_rechecks_original_step_and_resumes(self):
        calls=[]
        def chat(messages,budget):
            payload=json.loads(messages[-1]['content'][0]['text'])
            self.assertIn('localize_runtime_resources',payload['allowed_actions'])
            self.assertEqual(payload['runtime_issues'][0]['code'],'EXTERNAL_STATIC_RESOURCE')
            return {'action':'localize_runtime_resources','arguments':self.args}
        def verify():
            calls.append(1)
            if not (self.target/'runtime-resource-map.js').exists():raise ValueError('External static dependency')
            return 'original verification passed'
        token=CHAT.set(chat)
        try:self.assertEqual(guarded(verify,self.run,Budget(),self.target),'original verification passed')
        finally:CHAT.reset(token)
        self.assertEqual(len(calls),2)
        self.assertTrue(json.loads((self.run/'auto-repair/report.json').read_text('utf-8'))['attempts'][0]['verified'])

    def test_failed_reverification_retains_evidence_but_stays_blocked(self):
        before=(self.target/'index.html').read_bytes()
        token=CHAT.set(lambda *a:{'action':'localize_runtime_resources','arguments':self.args})
        try:
            with self.assertRaises(ValueError):guarded(lambda:(_ for _ in ()).throw(ValueError('still blocked')),self.run,Budget(),self.target)
        finally:CHAT.reset(token)
        self.assertTrue((self.target/'runtime-resource-map.js').exists())
        report=json.loads((self.run/'auto-repair/report.json').read_text('utf-8'))
        self.assertFalse(report['attempts'][0]['verified'])

    def test_empty_inspect_reports_invalid_action(self):
        context=RepairContext(self.run);payload=context.load()
        with self.assertRaisesRegex(ValueError,'inspect'):context.inspect({'action':'inspect'},payload)

    def test_new_dependencies_can_be_repaired_without_losing_prior_downloads(self):
        turn=[]
        def verify():
            acq=json.loads((self.run/'web-acquisition.json').read_text('utf-8'))
            count=len(acq.get('runtime_resource_map',{}))
            if count==2:return 'verified chain'
            if count==1:
                self.report['resource_requests']=[{'id':'resource-2','url':'https://assets.example/next.js','method':'GET','type':'script'}]
                (self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
            raise ValueError('another runtime dependency')
        def chat(*args):
            turn.append(1)
            return {'action':'localize_runtime_resources','arguments':dict(self.args,resource_ids=['resource-'+str(len(turn))])}
        token=CHAT.set(chat)
        try:self.assertEqual(guarded(verify,self.run,Budget(),self.target),'verified chain')
        finally:CHAT.reset(token)

    def test_invalid_download_does_not_change_package(self):
        before=(self.target/'index.html').read_bytes()
        with patch.object(Response,'read',return_value=b''):
            with self.assertRaises(ValueError):self.recovery.execute(self.args)
        self.assertEqual((self.target/'index.html').read_bytes(),before)
        self.assertFalse((self.target/'runtime-resource-map.js').exists())

    def test_font_transport_fallback_validates_before_writing(self):
        import base64
        import urllib.error
        self.report['resource_requests'][0].update(type='font',url='https://assets.example/font.woff2')
        (self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
        for data in (b'{"error":"unavailable"}',b'wOF2font-fixture'):
            response=type('Result',(),{'returncode':0,'stdout':json.dumps({'status':200,'headers':{},'data':base64.b64encode(data).decode()})})()
            with patch('runtime_recovery.urllib.request.build_opener') as opener, patch('runtime_recovery.subprocess.run',return_value=response):
                opener.return_value.open.side_effect=urllib.error.URLError('TLS closed')
                if data.startswith(b'wOF2'):
                    result=self.recovery.execute(self.args)
                    self.assertEqual((self.target/result['files'][0]['path']).read_bytes(),data)
                    self.recovery.rollback()
                else:
                    with self.assertRaisesRegex(ValueError,'文件头'):self.recovery.execute(self.args)
                    self.assertFalse((self.target/'runtime-resource-map.js').exists())

    def test_http_denial_does_not_invoke_browser_fallback(self):
        import urllib.error
        with patch('runtime_recovery.urllib.request.build_opener') as opener, patch('runtime_recovery.subprocess.run') as browser:
            opener.return_value.open.side_effect=urllib.error.HTTPError(self.url,403,'Forbidden',{},None)
            with self.assertRaises(urllib.error.HTTPError):self.recovery.execute(self.args)
            browser.assert_not_called()

    def test_declared_binary_model_requires_valid_glb_header(self):
        import struct
        url='https://assets.example/model.gltf-binary?v=1'
        (self.target/'index.html').write_text('<html><head></head><body><script>fetch("'+url+'")</script></body></html>')
        self.report['resource_requests'][0].update(type='fetch',url=url)
        (self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
        with patch.object(Response,'read',return_value=b'glTF'+struct.pack('<II',2,12)):
            result=self.recovery.execute(self.args)
        self.assertEqual(len(result['files']),1)
        self.recovery.rollback()
        with patch.object(Response,'read',return_value=b'not a binary model'):
            with self.assertRaises(ValueError):self.recovery.execute(self.args)

    def test_declared_json_fetch_is_localized_and_invalid_json_rejected(self):
        url='https://assets.example/words.json?v=2'
        (self.target/'index.html').write_text('<html><head></head><body><script>fetch("'+url+'")</script></body></html>')
        self.report['resource_requests'][0].update(type='fetch',url=url)
        (self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
        with patch.object(Response,'read',return_value=b'{"words":["hello"]}'):
            result=self.recovery.execute(self.args)
        self.assertTrue(result['files'][0]['path'].endswith('.json'))
        self.recovery.rollback()
        with patch.object(Response,'read',return_value=b'not json'):
            with self.assertRaises(ValueError):self.recovery.execute(self.args)

    def test_stylesheet_runtime_copy_rebases_and_preserves_raw_evidence(self):
        self.report['resource_requests'][0].update(type='stylesheet',url='https://assets.example/css/theme.css')
        (self.target/'evidence/runtime.json').write_text(json.dumps(self.report))
        raw=b'@font-face{src:url(../fonts/main.woff2?v=7)}'
        with patch.object(Response,'read',return_value=raw):
            result=self.recovery.execute(self.args)
        name=result['files'][0]['path']
        self.assertEqual((self.run/'web-original'/name).read_bytes(),raw)
        self.assertIn(b'https://assets.example/fonts/main.woff2?v=7',(self.target/name).read_bytes())
        self.recovery.rollback()
        self.assertFalse((self.target/name).exists())

    def test_continuation_publishes_verified_binding_not_stale_patch(self):
        self.recovery.execute(self.args)
        changes={'index.html':'stale model patch'};context={}
        sync_runtime_resources(self.target,changes,context)
        self.assertEqual(changes['index.html'],(self.target/'index.html').read_text('utf-8'))
        self.assertIn('runtime-resource-bindings.js',changes)
        self.assertEqual(context['index.html'],changes['index.html'])

    def test_continuation_uses_same_recovery(self):
        target=self.target;observations=[]
        class Browser:
            def observe(self,actions,restart=False):
                observations.append(restart)
                return {'passed':(target/'runtime-resource-map.js').exists(),'failure':'external dependency'}
        token=CHAT.set(lambda *a:{'action':'localize_runtime_resources','arguments':self.args})
        try:self.assertTrue(observe_verified(Browser(),self.run,Budget(),[])['passed'])
        finally:CHAT.reset(token)
        self.assertEqual(observations,[False,True])

    def test_actual_browser_dependency_is_localized_and_verified(self):
        # Self-authored fixture only; its external request is blocked by verify.
        (self.target/'index.html').write_text('<html><head></head><body><h1>Fixture</h1><button>Play</button><script>const s=document.createElement("script");s.src="https://"+"assets.example/runtime.js?v=2";document.head.append(s);</script></body></html>')
        def browser(mode):
            result=subprocess.run([node_binary(),'tests/test_runtime_recovery.cjs',str(self.run),mode],capture_output=True,text=True,encoding='utf-8',errors='replace',timeout=90,
                                  env={**os.environ,'GAMELAB_NETBLOCK':'0'})
            self.assertEqual(result.returncode,0,result.stdout+result.stderr)
        browser('blocked')
        self.recovery.execute(self.args)
        browser('passed')


if __name__=='__main__':unittest.main()

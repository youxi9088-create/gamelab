import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from controlplane.runtime import node_binary

class RuntimeAssertionTests(unittest.TestCase):
    def test_dynamic_input_relative_storage_and_reload(self):
        html='''<html><body><p id="state">Playing</p><script>
        let n=JSON.parse(localStorage.getItem('progress')||'{"games":13}').games;
        localStorage.setItem('progress',JSON.stringify({games:n}));
        let inputs=0; document.onkeyup=()=>{if(++inputs===3){n++;localStorage.setItem('progress',JSON.stringify({games:n}));document.querySelector('#state').textContent='Dead';}};
        </script></body></html>'''
        code,report,error=self.run_actions([
            {'type':'observe','capture_storage':{'key':'progress','path':['games'],'as':'before'}},
            {'type':'until','max_ms':3000,'condition':{'selector':'#state','text':'Dead'},'steps':[{'type':'hold','key':'ArrowRight','ms':30}], 'expect_storage':{'key':'progress','path':['games'],'from':'before','delta':1}},
            {'type':'observe','expect_storage':{'key':'progress','path':['games'],'from':'before','op':'gt'}},
            {'type':'reload','expect_storage':{'key':'progress','path':['games'],'from':'before','delta':1}}],html)
        self.assertEqual(code,0,str(report)+error)
        self.assertEqual(report['actions'][1]['assertions'][0]['iterations'],3)
        self.assertEqual(report['actions'][3]['assertions'][0]['actual'],14)
        self.assertIn('Dead',report['actions'][1]['observed_text'])
        self.assertFalse(report['gameplay_verified'])

    def test_dynamic_failure_retains_failed_condition(self):
        code,report,_=self.run_actions([{'type':'until','max_ms':150,'condition':{'selector':'#missing'},'steps':[{'type':'wait','ms':20}]}])
        self.assertNotEqual(code,0)
        self.assertFalse(report['actions'][0]['observation']['passed'])
        code,report,_=self.run_actions([{'type':'observe','expect_storage':{'key':'save','path':['games'],'from':'missing'}}])
        self.assertNotEqual(code,0)

    def run_actions(self,actions,html=None):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t)
            html=html or '''<html><body><button id="save" onclick="localStorage.setItem('save',JSON.stringify({games:1}));document.querySelector('#value').textContent='Saved'">Save</button><p id="value"></p><script>if(localStorage.getItem('save'))document.querySelector('#value').textContent='Restored';</script></body></html>'''
            payload={'files':{'index.html':html},'entry':'index.html','local_runtime':True,'actions':actions}
            (root/'input.json').write_text(json.dumps(payload),'utf-8')
            process=subprocess.run([node_binary(),'executors/smoke.cjs',str(root/'input.json'),str(root/'report.json'),str(root/'shot.png')],capture_output=True,text=True,timeout=45)
            return process.returncode,json.loads((root/'report.json').read_text('utf-8')) if (root/'report.json').exists() else {},process.stderr

    def test_reload_and_read_only_storage_assertions(self):
        code,report,error=self.run_actions([
            {'type':'click','selector':'#save','assert_selector':'#value','expect_text':'Saved','expect_storage':{'key':'save','path':['games'],'equals':1}},
            {'type':'reload','assert_selector':'#value','expect_text':'Restored','expect_storage':{'key':'save','path':['games'],'equals':1}}])
        self.assertEqual(code,0,error);self.assertTrue(report['passed'])
        self.assertEqual(len(report['actions'][1]['assertions']),3)
        self.assertFalse(report['gameplay_verified'])

    def test_selector_without_text_must_fail_if_missing(self):
        code,report,_=self.run_actions([{'type':'click','selector':'#save','assert_selector':'#does-not-exist'}])
        self.assertNotEqual(code,0);self.assertFalse(report['passed'])

    def test_action_overflow_is_not_silently_skipped(self):
        code,report,error=self.run_actions([{'type':'wait','ms':0}]*21)
        self.assertNotEqual(code,0);self.assertIn('never silently truncated',error)

    def test_hold_release_wait_and_opacity_assertion(self):
        html='''<html><body><p id="state">Ready</p><div id="overlay" style="transition:opacity .1s">Panel</div><script>
        let timer;
        document.onkeydown=()=>{timer=setTimeout(()=>{document.querySelector('#state').textContent='Held';document.querySelector('#overlay').style.opacity='0';document.querySelector('#overlay').style.pointerEvents='none';},150)};
        document.onkeyup=()=>{clearTimeout(timer);setTimeout(()=>{const el=document.querySelector('#state');el.textContent='Released';el.id='released';},100)};
        </script></body></html>'''
        code,report,error=self.run_actions([
            {'type':'hold','key':'ArrowRight','ms':300,'assert_selector':'#overlay','expect_style':{'opacity':'0','pointer-events':'none'}},
            {'type':'wait_for','selector':'#released','ms':1000,'assert_selector':'#released','expect_text':'Released'}],html)
        self.assertEqual(code,0,str(report)+error);self.assertTrue(report['passed'])
        self.assertEqual(sum(a['kind']=='style' for a in report['actions'][0]['assertions']),2)
        code,report,_=self.run_actions([{'type':'wait','ms':0,'assert_selector':'#save','expect_style':{'opacity':'0'}}])
        self.assertNotEqual(code,0);self.assertFalse(report['passed'])

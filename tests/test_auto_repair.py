import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from auto_repair import CHAT, EVENT, guarded, diagnose


class Budget:
    calls=4
    def remaining(self,n):return n


class AutoRepairTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.run=Path(self.temp.name)
        self.target=self.run/'converted';self.target.mkdir()
        self.events=[]
        self.event_token=EVENT.set(lambda status,message:self.events.append(status))
    def tearDown(self):
        EVENT.reset(self.event_token);self.temp.cleanup()
    def call(self,answer,fn):
        token=CHAT.set(lambda messages,budget:answer)
        try:return guarded(fn,self.run,Budget(),self.target)
        finally:CHAT.reset(token)
    def test_verified_patch_continues(self):
        p=self.target/'local-host.js';p.write_text('broken')
        def verify():
            if p.read_text()!='fixed':raise ValueError('host failure')
            return 'actual verification result'
        self.assertEqual(self.call({'action':'patch_host','diagnosis':'宿主错误','changes':{'local-host.js':'fixed'}},verify),'actual verification result')
        report=json.loads((self.run/'auto-repair/report.json').read_text())
        self.assertTrue(report['attempts'][0]['verified'])
        self.assertEqual(self.events[-1],'succeeded')
    def test_failed_patch_is_rolled_back_and_stops(self):
        p=self.target/'local-host.js';p.write_text('broken')
        calls=[]
        def verify():calls.append(1);raise ValueError('same error')
        with self.assertRaises(ValueError):self.call({'action':'patch_host','changes':{'local-host.js':'still broken'}},verify)
        self.assertEqual(p.read_text(),'broken');self.assertEqual(len(calls),2)
        self.assertEqual(self.events[-1],'failed')
    def test_captured_game_cannot_be_patched(self):
        p=self.target/'index.html';p.write_text('original')
        (self.run/'web-acquisition.json').write_text(json.dumps({'files':[{'path':'index.html'}]}))
        def verify():raise ValueError('game failure')
        with self.assertRaises(ValueError):self.call({'action':'patch_host','changes':{'index.html':'fake success'}},verify)
        self.assertEqual(p.read_text(),'original')
    def test_diagnosis_without_capability_does_not_retry(self):
        token=CHAT.set(lambda messages,budget:{'action':'retry','diagnosis':'材料缺失'})
        try:self.assertEqual(diagnose(ValueError('missing package'),self.run,Budget()),(False,None))
        finally:CHAT.reset(token)

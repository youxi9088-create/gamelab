import json
from pathlib import Path
import sys
import tempfile
import unittest
import hashlib

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
        report=json.loads((self.run/'auto-repair/report.json').read_text('utf-8'))
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

    def test_analysis_reads_source_then_configures_verified_contract(self):
        original=self.run/'web-original';original.mkdir()
        source='<script src="dmloader.js"></script><script>EngineLoader.load("canvas","fixture");</script>'
        (original/'source-entry.html').write_text(source,'utf-8')
        answers=iter([
            {'action':'inspect','read_requests':[{'path':'web-original/source-entry.html'}]},
            {'action':'configure_runtime','diagnosis':'入口声明 Defold 加载器',
             'runtime_plan':{'engine':'defold','source_sha256':hashlib.sha256(source.encode()).hexdigest()}},
        ])
        def chat(messages,budget):
            payload=json.loads(messages[-1]['content'][0]['text'])
            self.assertTrue(payload['source_inventory'])
            return next(answers)
        token=CHAT.set(chat)
        def verify():
            if not (self.run/'runtime-plan.json').exists():raise ValueError('contract missing')
            return 'real runner result'
        try:self.assertEqual(guarded(verify,self.run,Budget()),'real runner result')
        finally:CHAT.reset(token)
        report=json.loads((self.run/'auto-repair/report.json').read_text('utf-8'))
        self.assertTrue(report['attempts'][0]['tool_results'])
        self.assertTrue(report['attempts'][1]['verified'])

    def test_analysis_tools_cannot_read_credentials_or_parent_paths(self):
        from repair_context import RepairContext
        context=RepairContext(self.run);payload=context.load()
        with self.assertRaises(ValueError):context.inspect({'read_requests':[{'path':'../services.json'}]},payload)

    def test_runtime_plan_rejects_stale_or_unsupported_evidence(self):
        from repair_context import RepairContext
        original=self.run/'web-original';original.mkdir()
        (original/'source-entry.html').write_text('EngineLoader.load("canvas"); dmloader.js')
        context=RepairContext(self.run)
        with self.assertRaises(ValueError):context.configure({'engine':'defold','source_sha256':'old'})
        with self.assertRaises(ValueError):context.configure({'engine':'arbitrary-engine'})
        self.assertFalse((self.run/'runtime-plan.json').exists())

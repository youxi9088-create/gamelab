import json
from pathlib import Path
import sys
import tempfile
import unittest

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from auto_repair import CHAT, diagnose
from runtime_source_patch import RuntimeSourcePatch, sha

class Budget:
    calls=12
    def remaining(self,seconds):return seconds

class RuntimeSourcePatchTests(unittest.TestCase):
    def setUp(self):
        self.temp=tempfile.TemporaryDirectory();self.run=Path(self.temp.name)
        self.original=self.run/'web-original/module.js';self.original.parent.mkdir()
        self.target=self.run/'converted';self.target.mkdir()
        self.file=self.target/'module.js'
        self.source=b'export const platformBuild = true; export const score = 0;'
        self.original.write_bytes(self.source);self.file.write_bytes(self.source)
        (self.run/'web-acquisition.json').write_text(json.dumps({'files':[{'path':'module.js','sha256':sha(self.source)}]}))
        self.tool=RuntimeSourcePatch(self.run,Budget())
        self.arguments={'purpose':'Use an existing standalone runtime branch','patches':[{
            'path':'converted/module.js','sha256':sha(self.source),
            'replacements':[{'old':'platformBuild = true','new':'platformBuild = false'}]}]}

    def tearDown(self):self.temp.cleanup()

    def test_successful_patch_records_derivation_only_after_verification(self):
        token=CHAT.set(lambda messages,budget:{'action':'patch_runtime_source','arguments':self.arguments})
        def verify():
            self.assertIn(b'platformBuild = false',self.file.read_bytes())
            self.assertEqual(self.original.read_bytes(),self.source)
            return 'actual-runner-result'
        try:self.assertEqual(diagnose(ValueError('startup'),self.run,Budget(),retry=verify,target=self.target), (True,'actual-runner-result'))
        finally:CHAT.reset(token)
        record=json.loads((self.target/'evidence/runtime-source-patches.json').read_text('utf-8'))
        self.assertTrue(record[0]['runtime_reverified'])
        self.assertEqual(record[0]['files'][0]['original_sha256'],sha(self.source))

    def test_failed_reverification_rolls_back_and_preserves_original(self):
        answers=iter([{'action':'patch_runtime_source','arguments':self.arguments},{'action':'stop'}])
        token=CHAT.set(lambda messages,budget:next(answers))
        try:
            result=diagnose(ValueError('startup'),self.run,Budget(),retry=lambda:(_ for _ in ()).throw(ValueError('still failed')),target=self.target)
        finally:CHAT.reset(token)
        self.assertFalse(result[0])
        self.assertEqual(self.file.read_bytes(),self.source)
        self.assertEqual(self.original.read_bytes(),self.source)
        self.assertFalse((self.target/'evidence/runtime-source-patches.json').exists())

    def test_stale_hash_and_original_tampering_refused(self):
        self.arguments['patches'][0]['sha256']='0'*64
        with self.assertRaises(ValueError):self.tool.apply(self.arguments)
        self.arguments['patches'][0]['sha256']=sha(self.source)
        self.original.write_bytes(b'tampered')
        with self.assertRaises(ValueError):self.tool.apply(self.arguments)
        self.assertEqual(self.file.read_bytes(),self.source)

    def test_paths_outside_captured_working_sources_are_refused(self):
        for name in ('../services.json','web-original/module.js','converted/index.html','converted/evidence/runtime.json'):
            self.arguments['patches'][0]['path']=name
            with self.assertRaises(ValueError):self.tool.validate(self.arguments)

    def test_syntax_error_and_nonunique_replacement_do_not_write(self):
        self.arguments['patches'][0]['replacements'][0]['new']='platformBuild = ('
        with self.assertRaisesRegex(ValueError,'语法'):self.tool.apply(self.arguments)
        self.assertEqual(self.file.read_bytes(),self.source)
        self.arguments['patches'][0]['replacements'][0]={'old':'const missing','new':'const changed'}
        with self.assertRaisesRegex(ValueError,'唯一'):self.tool.validate(self.arguments)

    def test_noop_replacements_cannot_claim_adaptation(self):
        replacement=self.arguments['patches'][0]['replacements'][0]
        replacement['new']=replacement['old']
        with self.assertRaises(ValueError):self.tool.validate(self.arguments)

if __name__=='__main__':unittest.main()

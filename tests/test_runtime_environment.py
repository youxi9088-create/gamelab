import json,tempfile,sys,unittest
from pathlib import Path
from unittest.mock import patch
from types import SimpleNamespace
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from runtime_environment import probe


class RuntimeEnvironmentTests(unittest.TestCase):
    def test_comparison_preserves_primary_failure_and_original_code(self):
        with tempfile.TemporaryDirectory() as t:
            run=Path(t);(run/'converted/evidence').mkdir(parents=True)
            original=run/'converted/index.html';original.write_text('original','utf-8')
            primary=run/'converted/evidence/runtime.json'
            primary.write_text(json.dumps({'passed':False,'failure':'timeout','runtime_origin':'https://replica-runtime.invalid'}),'utf-8')
            before=primary.read_bytes()
            (run/'web-acquisition.json').write_text('{"engine":"browser-dom"}','utf-8')
            def execute(args,**kwargs):
                self.assertEqual(args[2],'diagnose-localhost')
                output=Path(args[-1])/'converted/evidence/runtime.json'
                output.write_text('{"passed":true,"runtime_origin":"http://localhost:1234","steps":[]}', 'utf-8')
                return SimpleNamespace(returncode=0,stderr='')
            with patch('runtime_environment.subprocess.run',side_effect=execute) as call:
                result=probe(run,SimpleNamespace(remaining=lambda n:n))
                self.assertTrue(result['environment_mismatch'])
                self.assertTrue(result['diagnostic_only'])
                self.assertEqual(probe(run,SimpleNamespace(remaining=lambda n:n)),result)
                self.assertEqual(call.call_count,1)
            self.assertEqual(primary.read_bytes(),before)
            self.assertEqual(original.read_text(),'original')

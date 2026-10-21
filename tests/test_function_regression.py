import json
from pathlib import Path
import subprocess
import tempfile
import unittest
from controlplane.runtime import node_binary

class FunctionRegressionTests(unittest.TestCase):
    def test_counter_only_save_uses_extracted_function_and_original_control(self):
        with tempfile.TemporaryDirectory() as t:
            root=Path(t);inp=root/'input.json';out=root/'report.json'
            old='function save(){if(score===previousScore)return;lib.saveUserGameState({games:games});}'
            new=old.replace('score===previousScore','score===previousScore && games===previousGames')
            case={'name':'counter-only','script_path':'game.js','functions':['save'],'invoke':'save','initial_state':{'score':5,'previousScore':5,'games':1,'previousGames':0},'expected_saves':[{'games':1}],'expect_original_failure':True}
            def run(current):
                inp.write_text(json.dumps({'original':{'game.js':old},'current':{'game.js':current},'cases':[case]}))
                proc=subprocess.run([node_binary(),'executors/function-regression.mjs',str(inp),str(out)],capture_output=True,text=True,timeout=30)
                return proc,json.loads(out.read_text('utf-8'))
            proc,report=run(new);self.assertEqual(proc.returncode,0,str(report)+proc.stderr)
            self.assertEqual(report['cases'][0]['variants']['original']['saved'],[])
            self.assertEqual(report['cases'][0]['variants']['current']['saved'],[{'games':1}])
            proc,report=run(old);self.assertNotEqual(proc.returncode,0);self.assertFalse(report['passed'])

import json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from runtime_recovery import declared_static_ids,recover_declared_static

class RecoveryRulesTest(unittest.TestCase):
 def test_only_exact_observed_declarations_are_selected_and_reverified(self):
  with tempfile.TemporaryDirectory() as d:
   run=Path(d);target=run/'converted';(target/'evidence').mkdir(parents=True)
   (target/'index.html').write_text('<link href="https://cdn.example/font.css?v=2&amp;x=1">')
   (run/'web-acquisition.json').write_text(json.dumps({'url':'https://game.example/','files':[]}))
   rows=[{'id':'font','url':'https://cdn.example/font.css?v=2&x=1','type':'stylesheet','method':'GET'},
    {'id':'unknown','url':'https://cdn.example/other.css','type':'stylesheet','method':'GET'},
    {'id':'post','url':'https://cdn.example/font.css?v=2&x=1','type':'stylesheet','method':'POST'}]
   (target/'evidence/runtime.json').write_text(json.dumps({'resource_requests':rows}))
   self.assertEqual(declared_static_ids(run),['font'])
   with patch('runtime_recovery.StaticRecovery.execute',return_value={'files':[{}]}) as execute,patch('conversion_checkpoint.save_verified_recovery') as commit:
    self.assertEqual(recover_declared_static(run,None,lambda:'actual verification'),(True,'actual verification'))
    execute.assert_called_once();commit.assert_called_once()
   with patch('runtime_recovery.StaticRecovery.execute',side_effect=ValueError('network')) as execute:
    self.assertEqual(recover_declared_static(run,None,lambda:None),(False,None))
    self.assertEqual(execute.call_count,1)

if __name__=='__main__':unittest.main()

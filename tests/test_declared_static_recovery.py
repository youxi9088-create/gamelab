import json,sys,tempfile,unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from runtime_recovery import declared_static_ids,recover_declared_static

class RecoveryRulesTest(unittest.TestCase):
 def test_literal_audio_fetch_is_static_but_api_and_posts_are_not(self):
  with tempfile.TemporaryDirectory() as d:
   run=Path(d);target=run/'converted';(target/'evidence').mkdir(parents=True);url='https://media.example/music.mp3'
   (target/'index.html').write_text('<script>const track="'+url+'";fetch(track);</script>')
   (run/'web-acquisition.json').write_text(json.dumps({'url':'https://game.example/','files':[]}))
   rows=[{'id':'audio','url':url,'method':'GET','type':'fetch'},
         {'id':'post','url':url,'method':'POST','type':'fetch'},
         {'id':'unknown','url':'https://media.example/other.mp3','method':'GET','type':'fetch'},
         {'id':'api','url':'https://game.example/api/music','method':'GET','type':'fetch'}]
   (target/'evidence/runtime.json').write_text(json.dumps({'resource_requests':rows}))
   self.assertEqual(declared_static_ids(run),['audio'])
 def test_declared_observed_module_gets_are_recovered_but_api_posts_are_not(self):
  with tempfile.TemporaryDirectory() as d:
   run=Path(d);target=run/'converted';(target/'evidence').mkdir(parents=True)
   url='https://cdn.example/sdk.js?v=1'
   (target/'index.html').write_text('<script type="module">import("'+url+'");</script>')
   (run/'web-acquisition.json').write_text(json.dumps({'url':'https://game.example/','files':[]}))
   rows=[{'id':'module','url':url,'method':'GET','type':'script'},
         {'id':'api','url':url,'method':'GET','type':'fetch'},
         {'id':'post','url':url,'method':'POST','type':'script'},
         {'id':'other','url':'https://cdn.example/other.js','method':'GET','type':'script'}]
   (target/'evidence/runtime.json').write_text(json.dumps({'resource_requests':rows}))
   self.assertEqual(declared_static_ids(run),['module'])
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

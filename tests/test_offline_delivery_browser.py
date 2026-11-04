import os
import sys
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
sys.path.insert(0,str(ROOT/'executors'))
from offline_source_patch import OfflineSourcePatch
from runtime_source_patch import sha
from controlplane.offline_delivery import inspect,FEATURES


@unittest.skipUnless(os.environ.get('OFFLINE_TEST_CHROME'),'Explicit isolated browser required')
class OfflineBrowserTests(unittest.TestCase):
    def test_removing_ad_preserves_real_play_and_local_save_without_external_requests(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);base=root/'baseline';run=root/'run';target=run/'converted'
            base.mkdir();target.mkdir(parents=True)
            ad="add('Watch ad',()=>fetch('https://ads.example/reward').catch(()=>{}));"
            source="""let score=Number(localStorage.getItem('score')||0);
const view=document.querySelector('#score');view.textContent=score;
function add(label,fn){const b=document.createElement('button');b.textContent=label;b.onclick=fn;document.body.append(b);}
add('Play',()=>{score++;view.textContent=score;localStorage.setItem('score',score);});
"""+ad
            for folder in (base,target):
                (folder/'index.html').write_text('<h1>Offline delivery fixture</h1><p id="score"></p><script src="game.js"></script>','utf-8')
                (folder/'game.js').write_text(source,'utf-8')
            self.assertEqual(inspect(target)['status'],'needs_work')
            tool=OfflineSourcePatch(run,type('Budget',(),{'remaining':lambda s,n:n})(),base)
            tool.apply({'feature':'advertising','evidence':'game.js explicitly creates Watch ad control and ad request',
                'purpose':'Remove advertising entry and request; retain scoring and storage',
                'patches':[{'path':'converted/game.js','sha256':sha((target/'game.js').read_bytes()),'replacements':[{'old':ad,'new':'// Advertising entry removed.'}]}]})
            shot=os.environ['OFFLINE_TEST_SHOT']
            result=subprocess.run([os.environ['NODE_BINARY'],str(ROOT/'tests/offline_delivery_browser.cjs'),str(target),shot],capture_output=True,text=True,timeout=60)
            self.assertEqual(result.returncode,0,result.stderr)
            runtime=json.loads(result.stdout);tool.commit()
            review={key:{'status':'removed' if key=='advertising' else 'absent','reason':'Fixture source and actual browser checked','evidence':['game.js']} for key in FEATURES}
            self.assertEqual(inspect(target,runtime,review)['status'],'verified')
            self.assertEqual((base/'game.js').read_text('utf-8'),source)

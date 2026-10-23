import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import discovered_web as web


class WebReviewDispatchTests(unittest.TestCase):
    def test_images_include_intermediate_fresh_steps_only(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'screenshots').mkdir()
            names=[f'screenshots/step-{n}.png' for n in range(8)]
            for name in names:(root/name).write_bytes(b'isolated-image')
            runtime={'replay_action_count':2,'captured_screenshots':names[2:7],
                'steps':[{'screenshot':n} for n in names]+[{'screenshot':'../outside.png'}]}
            images=web.review_images(root,runtime,None,[])
            self.assertEqual([p.name for p,_ in images],['step-3.png','step-4.png','step-5.png','step-6.png'])

    def test_reload_requires_separate_observation(self):
        class Budget:calls=3
        seen=[]
        class Browser:
            def __init__(self,*args):pass
            def close(self):pass
            def observe(self,actions,restart=False):
                seen.append(list(actions));return {'passed':True,'actions':list(actions),'steps':[]}
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/'source';(root/'evidence').mkdir(parents=True)
            (root/'index.html').write_text('<html>fixture</html>','utf-8')
            (root/'evidence/acquisition.json').write_text('{"engine":"three","files":[]}','utf-8')
            run=Path(folder)/'run';run.mkdir()
            replies=iter([
                {'actions':[{'type':'click','x':10,'y':10},{'type':'reload'}]},
                {'actions':[{'type':'click','x':10,'y':10}]},
                {'complete':False,'blocker':{'code':'FIXTURE_STOP','reason':'fixture','next_action':'fixture'}}])
            def chat(messages,*args):
                if len(seen)==2:self.assertIn('刷新必须单独提交',json.loads(messages[-1]['content'][0]['text'])['previous_model_feedback'])
                return next(replies)
            inp={'source_path':str(root),'base_version':{'id':'fixture','report':{}},'title':'fixture'}
            with patch.object(web,'ReviewBrowser',Browser):web.revise(inp,run,Budget(),chat,None,None)
            self.assertFalse(any(a['type']=='reload' for batch in seen for a in batch))
            self.assertEqual(len(seen[-1]),1)

    def test_read_and_actions_are_both_handled(self):
        class Budget:
            calls=3
        class Browser:
            def __init__(self,*args):pass
            def close(self):pass
            def observe(self,actions,restart=False):return {'passed':True,'actions':list(actions),'steps':[]}
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder)/'source';(root/'evidence').mkdir(parents=True)
            (root/'index.html').write_text('<html><body>isolated fixture</body></html>','utf-8')
            (root/'evidence/acquisition.json').write_text(json.dumps({'engine':'three','files':[]}),'utf-8')
            run=Path(folder)/'run';run.mkdir()
            responses=iter([
                {'read_requests':[{'path':'index.html','offset':0,'length':100}],
                 'search_requests':[{'path':'index.html','text':'saveState'}],
                 'actions':[{'type':'click','x':10,'y':10},{'type':'key','key':'Enter'}], 'complete':False},
                {'complete':True,'foundation_checks':[{'gameplay':{'status':'verified','reason':'isolated evidence'}}]}
            ])
            inp={'source_path':str(root),'base_version':{'id':'fixture-version','report':{}},'title':'fixture'}
            with patch.object(web,'ReviewBrowser',Browser):
                changes,_,report=web.revise(inp,run,Budget(),lambda *args:next(responses),None,None)
            self.assertEqual(len(report['acceptance_actions']),2)
            self.assertNotIn('blocker',report)
            self.assertEqual(report['foundation_checks']['gameplay']['status'],'verified')
            proof=root/report['verification_evidence'];proof.parent.mkdir();proof.write_text(changes[report['verification_evidence']],'utf-8')
            resumed=Path(folder)/'resumed';resumed.mkdir();inp['base_version']['report']=report
            def check_checkpoint(messages,*args):
                payload=json.loads(messages[-1]['content'][0]['text'])
                self.assertEqual(payload['source_search_results'][0]['total_matches'],0)
                return {'complete':True,'foundation_checks':{'gameplay':{'status':'verified','reason':'fixture'}}}
            with patch.object(web,'ReviewBrowser',Browser):web.revise(inp,resumed,Budget(),check_checkpoint,None,None)

    def test_evidence_ids_are_not_hashed_runtime_filenames(self):
        from controlplane.supply import inspect_source,SupplyError
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);(root/'index.html').write_text('<html>fixture</html>','utf-8')
            (root/'verification').mkdir()
            (root/'verification/12345678-abcd-web-play.json').write_text('{}','utf-8')
            self.assertEqual(len(inspect_source(root)[0]),2)
            (root/'verification/bundle.12345678.js').write_text('const fixture=1;','utf-8')
            with self.assertRaises(SupplyError) as error:inspect_source(root)
            self.assertEqual(error.exception.code,'TOOLCHAIN_UNSUPPORTED')


if __name__=='__main__':unittest.main()

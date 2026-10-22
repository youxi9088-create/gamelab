import sys
from pathlib import Path
import unittest
import json
import tempfile
from types import SimpleNamespace
from unittest.mock import patch
ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT))
sys.path.insert(0, str(ROOT / 'executors'))
from discovered_web import entry, revise
from controlplane.conversion_plan import build


class DiscoveredWebTests(unittest.TestCase):
    def test_viewport_only_revision_preserves_attributed_gameplay_without_replay(self):
        from tests.test_runtime_viewport import ViewportTests
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)/'source';root.mkdir();ViewportTests().source(root)
            (root/'evidence').mkdir()
            (root/'evidence/acquisition.json').write_text('{"files":[],"engine":"cocos2"}','utf-8')
            checks={k:{'status':'verified','evidence':['verification/old.json']} for k in
                    ('gameplay','resources','scene','objects','characters','animation','ui')}
            previous={'runtime_verified':True,'foundation_checks':checks,'verification_evidence':'verification/old.json',
                      'acceptance_actions':[{'type':'click','x':800,'y':500}]}
            run=Path(temp)/'run';run.mkdir()
            inp={'source_path':str(root),'base_version':{'id':'fixture-v1','report':previous}}
            def observe(*args,**kwargs):
                self.assertIn('viewport',args[0])
                records=[]
                for w,h in [(1000,760),(390,844),(844,390)]:
                    name=f'screenshots/viewport-{w}x{h}.png';shot=run/'converted'/name
                    shot.parent.mkdir(exist_ok=True);shot.write_bytes(b'fixture')
                    records.append({'width':w,'height':h,'passed':True,'screenshot':name})
                (run/'converted/evidence/runtime.json').write_text(json.dumps({'passed':True,'actions':[],'viewport_checks':records}),'utf-8')
                return SimpleNamespace(returncode=0,stdout='',stderr='')
            with patch('discovered_web.subprocess.run',side_effect=observe), patch('discovered_web.ReviewBrowser.observe') as replay:
                _,_,report=revise(inp,run,SimpleNamespace(remaining=lambda s:s),
                    lambda *a:{'complete':True,'summary':'fixture layout intact','issues':[]},None,None)
            replay.assert_not_called()
            self.assertEqual(report['acceptance_actions'],[])
            self.assertEqual(report['foundation_checks']['gameplay'],checks['gameplay'])
            self.assertEqual(report['inherited_gameplay_evidence']['version_id'],'fixture-v1')
            self.assertTrue(report['viewport_verification']['passed'])
            self.assertEqual(len(list((run/report['iteration']).glob('*.png'))),3)

    def test_call_budget_is_resumable_work_not_provider_failure(self):
        from worker import Blocked
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp)/'source';(root/'evidence').mkdir(parents=True)
            (root/'index.html').write_text('<canvas></canvas>','utf-8')
            (root/'evidence/acquisition.json').write_text('{"files":[],"engine":"ruffle"}','utf-8')
            run=Path(temp)/'run';run.mkdir()
            budget=SimpleNamespace(calls=1,remaining=lambda seconds:seconds)
            inp={'source_path':str(root),'base_version':{'id':'fixture-v1','report':{}},
                 'pending_delivery':{'gaps':['fixture remaining backend check']}}
            with patch('discovered_web.ReviewBrowser.observe',return_value={'passed':True,'actions':[]}):
                def chat(messages,*args):
                    payload=json.loads(messages[1]['content'][0]['text'])
                    self.assertEqual(payload['pending_delivery'],inp['pending_delivery'])
                    raise Blocked('AI call count budget exhausted')
                _,_,report=revise(inp,run,budget,chat,None,None)
            self.assertEqual(report['blocker']['code'],'WEB_VERIFICATION_BUDGET')
            self.assertTrue(report['runtime_verified'])

    def test_review_never_certifies_unexecuted_last_actions(self):
        with tempfile.TemporaryDirectory() as temp:
            root = Path(temp) / 'source'
            (root / 'evidence').mkdir(parents=True)
            (root / 'index.html').write_text('<canvas></canvas>', 'utf-8')
            (root / 'evidence/acquisition.json').write_text('{"files":[],"engine":"ruffle"}', 'utf-8')
            run = Path(temp) / 'run'
            run.mkdir()
            def execute(actions, *args, **kwargs):
                dest = run / 'converted'
                (dest / 'screenshots').mkdir(exist_ok=True)
                return {'passed': True, 'actions': actions}
            budget = SimpleNamespace(calls=1, remaining=lambda seconds: seconds)
            inp = {'source_path': str(root), 'base_version': {'id': 'fixture-v1', 'report': {}}}
            with patch('discovered_web.ReviewBrowser.observe', side_effect=execute):
                with self.assertRaisesRegex(Exception, '尚未执行验证'):
                    revise(inp, run, budget, lambda *a: {'complete': True, 'actions': [{'type': 'click', 'x': 1, 'y': 1}]}, None, None)

    def test_only_unique_observed_entry_is_selected(self):
        a = {'url': 'https://example.org/a', 'canvas_count': 1, 'evidence': 'rendered-canvas', 'referer': 'https://example.org/host'}
        self.assertEqual(entry({'web_discovery': {'entries': [a, a]}}), a)
        with self.assertRaises(ValueError):
            entry({'web_discovery': {'entries': [a, {**a, 'url': 'https://example.org/b'}]}})
        with self.assertRaises(ValueError):
            entry({'web_discovery': {'entries': [{**a, 'evidence': 'iframe-data-url'}]}})

    def test_plan_continues_from_observed_web_entry(self):
        plan = build({'url': 'https://example.org'}, {'web_discovery': {'entries': [{'url': 'https://example.org/play'}]}})
        self.assertEqual(plan['route'], 'discovered-web')
        self.assertEqual(build({'url': 'https://example.org'})['route'], 'blocked')


if __name__ == '__main__':
    unittest.main()

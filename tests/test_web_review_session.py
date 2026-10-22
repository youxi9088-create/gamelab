"""Real isolated browser, authored fixture only; never a production game."""
import json
import hashlib
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
from discovered_web import ReviewBrowser


class SessionTests(unittest.TestCase):
    def test_actions_share_page_and_reload_preserves_real_saved_progress(self):
        with tempfile.TemporaryDirectory() as temp:
            run = Path(temp)
            (run / 'converted').mkdir()
            (run / 'web-acquisition.json').write_text('{"engine":"cocos2"}', 'utf-8')
            (run / 'converted/index.html').write_text('''<canvas width="400" height="300"></canvas><script>
             Object.defineProperty(document.fonts,'ready',{get:()=>new Promise(()=>{})});
             const label={string:'Count '+(localStorage.count||0)};
             const scene={name:'Fixture',activeInHierarchy:true,opacity:255,children:[],getComponent:type=>type===cc.Label?label:null};
             window.cc={Label:function(){},Button:function(){},director:{getScene:()=>scene},game:{canvas:document.querySelector('canvas')},winSize:{width:400,height:300}};
             document.querySelector('canvas').onclick=()=>{localStorage.count=Number(localStorage.count||0)+1;label.string='Count '+localStorage.count;};
            </script>''', 'utf-8')
            browser = ReviewBrowser(run, SimpleNamespace(remaining=lambda s: s))
            actions = [{'type': 'click', 'x': 50, 'y': 50, 'expect_labels': ['Count 1']}]
            try:
                initial = browser.observe(actions)
                self.assertEqual(initial['observed']['labels'][0]['text'], 'Count 1')
                saved=initial['observed']['storage']['areas']['localStorage']
                self.assertTrue(saved['complete'])
                self.assertEqual(saved['entries'][0]['key'], 'count')
                self.assertEqual(saved['entries'][0]['sha256'], hashlib.sha256(b'1').hexdigest())
                self.assertNotIn('value',saved['entries'][0])
                self.assertEqual(initial['replay_action_count'], 1)
                self.assertNotIn('screenshots/step-0.png', initial['captured_screenshots'])
                self.assertTrue((run / 'converted/screenshots/current.png').read_bytes().startswith(b'\x89PNG\r\n\x1a\n'))
                process = browser.process.pid
                actions.append({'type': 'click', 'x': 50, 'y': 50, 'expect_labels': ['Count 2']})
                result = browser.observe(actions)
                self.assertTrue(result['passed'])
                self.assertIn('screenshots/step-1.png', result['captured_screenshots'])
                self.assertEqual(browser.process.pid, process)
                result = browser.observe(actions)
                self.assertEqual(len(result['actions']), 2)
                self.assertEqual(result['observed']['labels'][0]['text'], 'Count 2')
                actions.append({'type': 'reload', 'expect_labels': ['Count 2']})
                reloaded=browser.observe(actions)
                self.assertTrue(reloaded['passed'])
                checkpoint=reloaded['steps'][-1]
                self.assertEqual(checkpoint['storage_before_reload']['areas']['localStorage']['entries'],checkpoint['storage']['areas']['localStorage']['entries'])
                self.assertEqual(checkpoint['storage']['areas']['localStorage']['entries'][0]['sha256'],hashlib.sha256(b'2').hexdigest())
                actions.append({'type': 'wait', 'expect_labels': ['Not present']})
                failed = browser.observe(actions)
                self.assertFalse(failed['passed'])
                self.assertIn('Expected Cocos labels', failed['failure'])
            finally:
                browser.close()


if __name__ == '__main__':
    unittest.main()

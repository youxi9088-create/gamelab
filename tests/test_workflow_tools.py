import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from source_tools import run_source_tools, valid_artifacts
from review_progress import ReviewProgress
from resource_review import OptionalResourceReview

class Budget:
    def remaining(self,seconds):return seconds

class WorkflowToolsTests(unittest.TestCase):
    def test_inline_game_module_is_analyzed_before_vendor(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'web-original';source.mkdir()
            html='<script type="importmap">{"imports":{}}</script><script type="module">const score=1+2;console.log(score);</script>'
            (source/'index.html').write_text(html,'utf-8')
            report=run_source_tools(root,Budget(),'three')
            self.assertEqual(report['items'][0]['status'],'analyzed',report)
            self.assertEqual(report['items'][0]['source_document'],'web-original/index.html')
            self.assertEqual((source/'index.html').read_text('utf-8'),html)
    def test_optional_resource_requires_source_failure_and_can_be_rolled_back(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);target=root/'converted';(target/'evidence').mkdir(parents=True);(target/'screenshots').mkdir()
            (target/'screenshots/failed.png').write_bytes(b'actual fixture screenshot')
            (target/'evidence/runtime.json').write_text(json.dumps({'missing':['/logo.png','/sdk.js']}))
            original=json.dumps({'capture_key':'fixture','unavailable':[{'path':'logo.png','http_status':404},{'path':'sdk.js','http_status':404}]})
            (root/'web-acquisition.json').write_text(original)
            review=OptionalResourceReview(root,Budget())
            args={'path':'logo.png','reason':'fixture 源码中此图仅是站点页脚标识，截图中引导按钮和交互区完整'}
            review.execute(args)
            self.assertEqual(json.loads((root/'web-acquisition.json').read_text('utf-8'))['optional_resources'][0]['path'],'logo.png')
            review.rollback();self.assertEqual((root/'web-acquisition.json').read_text(),original)
            with self.assertRaises(ValueError):review.validate({**args,'path':'sdk.js'})
            with self.assertRaises(ValueError):review.validate({**args,'path':'not-observed.png'})

    def test_real_webcrack_preserves_input_and_reuses_checked_output(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'web-original';source.mkdir()
            code='var result=1+2; console.log(result);'
            (source/'game.js').write_text(code)
            report=run_source_tools(root,Budget(),'browser')
            self.assertEqual(report['items'][0]['status'],'analyzed',report)
            out=root/report['items'][0]['output']
            self.assertIn('3', (out/'readable.js').read_text())
            self.assertEqual((source/'game.js').read_text(),code)
            self.assertTrue(valid_artifacts(out))
            self.assertEqual(run_source_tools(root,Budget(),'browser')['items'][0]['status'],'reused')
            (out/'readable.js').write_text('tampered')
            self.assertFalse(valid_artifacts(out))

    def test_no_progress_requires_repeated_executed_input_and_unchanged_frames(self):
        with tempfile.TemporaryDirectory() as folder:
            image=Path(folder)/'frame.png';image.write_bytes(b'fixture-frame')
            monitor=ReviewProgress();actions=[]
            for n in range(3):
                actions.append({'type':'click','x':5,'y':5})
                report=monitor.observe({'actions':actions},image)
            self.assertTrue(report['suspected_stuck'])
            self.assertTrue(monitor.repeats_stalled_action([actions[-1]]))
            self.assertFalse(monitor.repeats_stalled_action([{'type':'key','key':'Enter'}]))
            image.write_bytes(b'changed')
            actions.append(actions[-1]);self.assertFalse(monitor.observe({'actions':actions},image)['suspected_stuck'])

    def test_cocos_tool_produces_separate_unverified_project(self):
        with tempfile.TemporaryDirectory() as folder:
            root=Path(folder);source=root/'web-original';(source/'src').mkdir(parents=True)
            (source/'application.js').write_text('// fixture Cocos 3')
            (source/'src/settings.json').write_text('{}')
            bundle=source/'assets/main';bundle.mkdir(parents=True)
            (bundle/'config.json').write_text(json.dumps({'name':'main','paths':{},'uuids':[],'types':[],'versions':{'import':[],'native':[]}}))
            report=run_source_tools(root,Budget(),'browser')
            item=next(i for i in report['items'] if i['tool']=='cc-reverse')
            self.assertEqual(item['status'],'recovered_unverified',report)
            self.assertTrue((root/item['output']/'RECOVERY_REPORT.md').is_file())
            self.assertFalse(item['build_verified'])
            self.assertFalse(report['runtime_modified'])

if __name__=='__main__':unittest.main()

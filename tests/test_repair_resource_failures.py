import json
from pathlib import Path
import sys
import tempfile
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from repair_context import RepairContext


class RepairResourceFailureTests(unittest.TestCase):
    def test_continuation_retains_source_evidence_with_explicit_historical_scope(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'converted/evidence').mkdir(parents=True)
            (root/'converted/evidence/runtime.json').write_text(json.dumps({'missing':['/audio.mp3']}))
            (root/'converted/evidence/acquisition.json').write_text(json.dumps({'unavailable':[{'path':'audio.mp3','http_status':404}]}))
            row=RepairContext(root).load()['resource_failures'][0]
            self.assertEqual(row['observed_source_statuses'],[404]);self.assertEqual(row['source_status_scope'],'retained_version_capture_requires_recheck');self.assertIsNone(row['optional'])
            (root/'web-acquisition.json').write_text('{}')
            row=RepairContext(root).load()['resource_failures'][0]
            self.assertEqual(row['observed_source_statuses'],[]);self.assertEqual(row['source_status_scope'],'current_run_capture')
    def test_source_unavailability_is_current_scoped_and_never_grants_exemption(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);(root/'converted/evidence').mkdir(parents=True)
            (root/'converted/evidence/runtime.json').write_text(json.dumps({'missing':['/font.woff2','/audio.mp3','/unknown.png']}))
            (root/'web-acquisition.json').write_text(json.dumps({'unavailable':[
                {'path':'font.woff2','http_status':404},{'path':'audio.mp3','http_status':403},
                {'path':'old.png','http_status':404}]}))
            rows=RepairContext(root).load()['resource_failures']
            self.assertEqual([r['path'] for r in rows],['font.woff2','audio.mp3','unknown.png'])
            self.assertEqual([r['classification'] for r in rows],['source_unavailable','access_denied','unresolved'])
            self.assertTrue(all(r['optional'] is None for r in rows))

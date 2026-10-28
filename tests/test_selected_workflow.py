import json
import sys
import tempfile
import unittest
from pathlib import Path
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from revision_route import prepare
from controlplane.service import Service


class SelectedWorkflowTests(unittest.TestCase):
    def test_route_restored_from_acquisition_without_mutating_history(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);(root/'evidence').mkdir();(root/'index.html').write_text('fixture')
            (root/'evidence/acquisition.json').write_text(json.dumps({'engine':'cocos2','url':'https://example.com/game/','files':[{'path':'main.js'}]}))
            previous={'report':{}};inp={'source_path':d,'base_version':previous}
            self.assertTrue(prepare(inp));self.assertEqual(previous,{'report':{}})
            self.assertEqual(inp['base_version']['report']['recovery_kind'],'discovered-web-cocos2')
            self.assertFalse(prepare({'source_path':d,'base_version':previous,'_revision_checkpoint':{'changes':{'index.html':'saved'}}}))

    def test_selected_claim_keeps_global_capacity_and_never_claims_sibling(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d);s=Service(root/'data',root/'repo','http://localhost')
            jobs=s.mutate('/api/conversions',{'urls':['https://example.com/first','https://example.com/second']})['jobs']
            tool=s.mutate('/api/tools',{'name':'fixture','capabilities':['rea']})['tool']
            with s.store.tx() as db:
                settings=s.get(db,'settings','main');settings['concurrency']=1;s.store.put(db,'settings',settings)
            selected=jobs[1]['id']
            self.assertIsNone(s.mutate('/api/v1/jobs/claim',{'capabilities':['rea'],'job_id':'missing'},tool)['job'])
            self.assertEqual(s.mutate('/api/v1/jobs/claim',{'capabilities':['rea'],'job_id':selected},tool)['job']['id'],selected)
            self.assertIsNone(s.mutate('/api/v1/jobs/claim',{'capabilities':['rea'],'job_id':jobs[0]['id']},tool)['job'])

import unittest
from controlplane.usage import game_totals

class GameConversionStatsTests(unittest.TestCase):
    def test_union_retries_unknown_usage_and_hidden(self):
        candidates=[{'id':'a'},{'id':'b'},{'id':'hidden','observations':{'catalog_hidden':True}}]
        jobs=[{'id':'j','candidate_id':'a'}]
        def e(node,status,second,round=1):
            return dict(job_id='j',node=node,node_status=status,round=round,attempt=1,created_at=f'2026-10-21T00:00:{second:02d}+00:00')
        events=[e('adapt','running',0),e('test','running',5),e('test','succeeded',10),e('adapt','failed',20),e('adapt','running',30,2),e('adapt','succeeded',40,2),e('test','running',45,3)]
        u=dict(id='call',candidate_id='a',input_tokens=100,output_tokens=20)
        rows=game_totals(candidates,jobs,events,[u,u,dict(id='unknown',candidate_id='a')])
        a,b=rows
        self.assertEqual(a['duration_seconds'],30)
        self.assertEqual(a['unpaired_events'],1)
        self.assertEqual((a['calls'],a['input_tokens'],a['output_tokens'],a['unknown_usage_calls']),(2,100,20,1))
        self.assertIsNone(b['duration_seconds'])
        self.assertEqual(b['known_token_fields'],0)
        self.assertEqual(len(rows),2)

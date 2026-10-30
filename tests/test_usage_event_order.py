import unittest
from controlplane.usage import game_totals


class UsageEventOrderTests(unittest.TestCase):
    def test_second_resolution_order_summary_duplicate_and_repair(self):
        base={'job_id':'j','round':1,'attempt':1}
        events=[{**base,'node':'analysis','node_status':s,'created_at':'2026-10-29T00:00:00+00:00'} for s in ('succeeded','running')]
        events += [{**base,'node':'repair','node_status':'running','created_at':'2026-10-29T00:00:01+00:00'},
                   {**base,'node':'repair','node_status':'succeeded','created_at':'2026-10-29T00:00:11+00:00'},
                   {**base,'attempt':None,'node':'repair','node_status':'succeeded','created_at':'2026-10-29T00:00:12+00:00'}]
        row=game_totals([{'id':'g'}],[{'id':'j','candidate_id':'g'}],events,[])[0]
        self.assertEqual(row['duration_seconds'],10)
        self.assertEqual(row['unpaired_events'],0)

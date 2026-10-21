import unittest
from datetime import datetime,timezone
from controlplane.dashboard_operations import overview

class OperationalDashboardTests(unittest.TestCase):
    def test_known_samples_weekly_dedup_hidden_and_unknown(self):
        state=dict(candidates=[dict(id='a',title='A'),dict(id='b',title='B'),dict(id='h',observations={'catalog_hidden':True})],
                   jobs=[dict(id='j',candidate_id='a',status='completed',round=3)],
                   versions=[dict(id='v1',candidate_id='a',status='approved',approved_at='2026-10-20T00:00:00+00:00'),dict(id='v2',candidate_id='a',status='approved',approved_at='2026-10-21T00:00:00+00:00')],
                   game_conversion_stats=[dict(candidate_id='a',calls=2,unknown_usage_calls=1,duration_seconds=100,unpaired_events=1,input_tokens=10,output_tokens=5),dict(candidate_id='b',calls=0,unknown_usage_calls=0,duration_seconds=200,unpaired_events=0)])
        usage=[dict(id='one',candidate_id='a',round=2,input_tokens=10,output_tokens=5,estimated_cost=.1,currency='USD'),dict(id='two',candidate_id='a',round=3)]
        d=overview(state,usage,datetime(2026,10,21,12,tzinfo=timezone.utc))
        self.assertEqual(d['weekly_accepted'],1)
        self.assertEqual(d['token_coverage'],.5)
        self.assertEqual(d['median_seconds'],200)
        self.assertEqual(d['games_count'],2)
        self.assertEqual(d['games'][0]['retry_tokens'],15)
        self.assertEqual(d['games'][0]['costs'],{'USD':.1})
        self.assertIsNone(d['first_pass_rate'])
        self.assertIsNone(d['weekly_published'])
    def test_no_history_is_unknown_not_zero_cost(self):
        d=overview(dict(candidates=[dict(id='a')]),[])
        self.assertIsNone(d['median_seconds'])
        self.assertIsNone(d['token_coverage'])
        self.assertEqual(d['games'][0]['costs'],{})

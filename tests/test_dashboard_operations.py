import unittest
from datetime import datetime,timezone
from controlplane.dashboard_operations import overview

class OperationalDashboardTests(unittest.TestCase):
    def test_review_closes_conversion_despite_telemetry_gaps(self):
        state=dict(candidates=[dict(id=k) for k in ('review','running','empty')],
                   jobs=[dict(id=k,candidate_id=k,status='review' if k!='running' else 'running') for k in ('review','running','empty')],
                   game_conversion_stats=[dict(candidate_id='review',duration_seconds=90,unpaired_events=3),
                                          dict(candidate_id='running',duration_seconds=500,unpaired_events=0)])
        d=overview(state,[])
        self.assertEqual(d['median_seconds'],90)
        self.assertEqual(d['timing_complete'],1)
        rows={r['candidate_id']:r for r in d['games']}
        self.assertTrue(rows['review']['conversion_closed'])
        self.assertTrue(rows['empty']['conversion_closed'])
        self.assertFalse(rows['running']['conversion_closed'])
        self.assertEqual(rows['review']['unpaired_events'],3)

    def test_known_samples_weekly_dedup_hidden_and_unknown(self):
        state=dict(candidates=[dict(id='a',title='A'),dict(id='b',title='B'),dict(id='h',observations={'catalog_hidden':True})],
                   jobs=[dict(id='j',candidate_id='a',status='completed',round=3)],
                   versions=[dict(id='v1',candidate_id='a',status='approved',approved_at='2026-10-20T00:00:00+00:00'),dict(id='v2',candidate_id='a',status='approved',approved_at='2026-10-21T00:00:00+00:00')],
                   game_conversion_stats=[dict(candidate_id='a',calls=2,unknown_usage_calls=1,duration_seconds=100,unpaired_events=1,input_tokens=10,output_tokens=5),dict(candidate_id='b',calls=0,unknown_usage_calls=0,duration_seconds=200,unpaired_events=0)])
        usage=[dict(id='one',candidate_id='a',round=2,input_tokens=10,output_tokens=5,estimated_cost=.1,currency='USD'),dict(id='two',candidate_id='a',round=3)]
        d=overview(state,usage,datetime(2026,10,21,12,tzinfo=timezone.utc))
        self.assertEqual(d['weekly_accepted'],1)
        self.assertEqual(d['token_coverage'],.5)
        self.assertEqual(d['average_tokens'],15)
        self.assertEqual(d['average_token_calls'],1)
        self.assertEqual(d['median_seconds'],100)
        self.assertEqual(d['games_count'],2)
        self.assertEqual(d['games'][0]['retry_tokens'],15)
        self.assertEqual(d['games'][0]['costs'],{'USD':.1})
        self.assertIsNone(d['first_pass_rate'])
        self.assertEqual(d['weekly_submitted'],0)
    def test_no_history_is_unknown_not_zero_cost(self):
        d=overview(dict(candidates=[dict(id='a')]),[])
        self.assertIsNone(d['median_seconds'])
        self.assertIsNone(d['token_coverage'])
        self.assertIsNone(d['average_tokens'])
        self.assertEqual(d['games'][0]['costs'],{})

    def test_supply_identity_and_downstream_status_are_preserved(self):
        state={'candidates':[{'id':'a','title':'A'}],'supply':[{'id':'v','candidate_id':'a','submitted':True,'status':'tracking','state':'queued','state_text':'排队中','submission_id':'supply-example-1234','updated_at':'2026-10-30T05:00:00Z'}]}
        row=overview(state,[])['games'][0]
        self.assertEqual(row['supply_status'],'queued')
        self.assertTrue(row['supply_submitted'])
        self.assertEqual(row['supply_submission_id'],'supply-example-1234')
        self.assertEqual(row['supply_state_text'],'排队中')

    def test_supply_acknowledgments_use_beijing_week_and_deduplicate(self):
        rows=[dict(id=str(i),candidate_id='a',submitted=True,submission_id=str(i),accepted_at=t,state='needs_your_fix') for i,t in enumerate([
            '2026-10-25T16:00:00Z','2026-10-25T15:59:59Z','2026-10-30T00:00:00Z','2026-11-01T00:00:00Z'])]
        rows += [dict(rows[0],id='duplicate'),dict(id='pending',candidate_id='a',submitted=False,submission_id='pending',accepted_at='2026-10-30T00:00:00Z'),
                 dict(id='unknown',candidate_id='a',submitted=True,submission_id='unknown',created_at='2026-10-30T00:00:00Z',updated_at='2026-10-30T00:00:00Z'),
                 dict(id='fallback',candidate_id='a',submitted=True,submission_id='fallback',submitted_at='2026-10-30T00:00:00Z'),
                 dict(id='hidden',candidate_id='h',submitted=True,submission_id='hidden',accepted_at='2026-10-30T00:00:00Z')]
        state=dict(candidates=[dict(id='a'),dict(id='h',observations=dict(catalog_hidden=True))],supply=rows)
        result=overview(state,[],datetime(2026,10,30,12,tzinfo=timezone.utc))
        self.assertEqual(result['weekly_submitted'],3)
        self.assertEqual(result['undated_submissions'],1)

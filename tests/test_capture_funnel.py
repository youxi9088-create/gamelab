import unittest
from tools.report_capture_funnel import summarize

class CaptureFunnelTests(unittest.TestCase):
 def test_unstarted_excluded_and_startup_not_confused_with_interaction(self):
  state={'candidates':[{'id':'g','url':'https://a.example/play'}],
    'versions':[{'id':'v','artifact_id':'a','report':{'runtime_smoke':{'passed':True}}}],
    'jobs':[{'id':'q','candidate_id':'g','status':'queued'},
      {'id':'j','candidate_id':'g','status':'blocked','started_at':'date','version_id':'v'}]}
  group=summarize(state)['sources']['a.example']
  self.assertEqual(group['started'],1);self.assertEqual(group['submitted'],2)
  self.assertEqual(group['startup_verified'],1);self.assertNotIn('interaction_verified',group)
  self.assertEqual(group['awaiting_or_completed_ratio'],0)

if __name__=='__main__':unittest.main()

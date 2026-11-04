import tempfile,unittest
from pathlib import Path
from controlplane.service import Service,ApiError
class SourceControlsTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();p=Path(self.tmp.name);self.s=Service(p/'data',p/'repo','http://127.0.0.1:8766')
 def tearDown(self):self.tmp.cleanup()
 def test_source_lifecycle(self):
  x=self.s.mutate('/api/sources',{'name':'测试池','url':'https://example.org/pool'})['source'];sid=x['id']
  for action,enabled in [('disable',False),('enable',True)]:self.assertEqual(self.s.mutate('/api/sources/'+sid+'/'+action,{})['source']['enabled'],enabled)
  with self.assertRaises(ApiError):self.s.mutate('/api/sources',{'name':'重复','url':x['url']})
  self.s.mutate('/api/sources/'+sid+'/delete',{})
  self.assertNotIn(sid,[x['id'] for x in self.s.state()['sources']])
  with self.assertRaises(ApiError):self.s.mutate('/api/sources/'+sid+'/enable',{})
 def test_failed_link_returns_original(self):
  a=self.s.mutate('/api/conversions',{'url':'https://example.org/game'})
  with self.s.store.tx() as db:
   j=a['job'];j['status']='failed';self.s.store.put(db,'jobs',j)
  b=self.s.mutate('/api/conversions',{'url':'https://example.org/game'})
  self.assertTrue(b['deduplicated']);self.assertEqual(a['job']['id'],b['job']['id'])

 def test_sources_refresh_without_rebuilding_snapshot(self):
  from controlplane.ui_state import current_sources
  x=self.s.mutate('/api/sources',{'name':'实时池','url':'https://example.org/live'})['source']
  snapshot={'sources':[dict(x)],'ui_snapshot_age_seconds':90}
  self.s.mutate('/api/sources/'+x['id']+'/disable',{})
  result=current_sources(self.s,snapshot)
  self.assertFalse(next(r for r in result['sources'] if r['id']==x['id'])['enabled'])
  self.assertTrue(snapshot['sources'][0]['enabled'])
  self.s.mutate('/api/sources/'+x['id']+'/delete',{})
  self.assertNotIn(x['id'],[r['id'] for r in current_sources(self.s,snapshot)['sources']])

 def test_initial_ui_state_does_not_wait_for_historical_engine_scan(self):
  from unittest.mock import patch
  with patch('controlplane.acquisition_evidence.engine_by_candidate',side_effect=RuntimeError('slow historical evidence')) as scan:
   state=self.s.state(defer_engine_evidence=True)
   self.assertTrue(state['ui_engine_evidence_pending']);scan.assert_not_called()
   self.assertTrue(state['sources'])
  with patch('controlplane.acquisition_evidence.engine_by_candidate',return_value={}) as scan:
   self.assertFalse(self.s.state()['ui_engine_evidence_pending']);scan.assert_called_once()

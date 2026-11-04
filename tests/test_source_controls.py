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

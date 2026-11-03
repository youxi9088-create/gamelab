import tempfile,unittest
from pathlib import Path
from types import SimpleNamespace
from controlplane.service_registry import ServiceRegistry
from controlplane.store import Store,now

class ServiceRuntimeStatusTests(unittest.TestCase):
 def test_separate_ui_reads_heartbeat_without_external_configuration(self):
  with tempfile.TemporaryDirectory() as t:
   root=Path(t);s=Store(root/'db.sqlite3');r=ServiceRegistry(root/'services.json');r.runtime_service=SimpleNamespace(store=s)
   status=r.public()[0];self.assertEqual(status['status'],'待连接');self.assertTrue(status['configured']);self.assertEqual(status['backend'],'builtin')
   with s.tx() as db:s.put(db,'tools',{'id':'worker','enabled':True,'capabilities':['rea','reconstruct'],'last_seen':now()})
   status=r.test('wechat')[0];self.assertEqual(status['status'],'已连接');self.assertTrue(status['checks']['executor_heartbeat']);self.assertNotIn('browser',status['checks'])
   with s.tx() as db:s.put(db,'tools',{'id':'worker','enabled':True,'capabilities':['rea'],'last_seen':'2000-01-01T00:00:00+00:00'})
   self.assertEqual(r.public()[0]['status'],'待连接')
 def test_external_converter_still_requires_its_own_configuration(self):
  with tempfile.TemporaryDirectory() as t:
   root=Path(t);s=Store(root/'db.sqlite3');r=ServiceRegistry(root/'services.json');r.runtime_service=SimpleNamespace(store=s)
   (root/'services.json').write_text('{"wechat":{"base_url":"https://converter.example","backend":"wxapkg_v1"}}','utf-8')
   self.assertEqual(r.public()[0]['status'],'待检测');self.assertEqual(r.public()[0]['backend'],'wxapkg_v1')

if __name__=='__main__':unittest.main()

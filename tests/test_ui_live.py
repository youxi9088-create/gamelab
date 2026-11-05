import tempfile,unittest
from pathlib import Path
from controlplane.service import Service
from controlplane.ui_live import install,operational

class LiveTests(unittest.TestCase):
 def test_committed_status_replaces_stale_statistics_and_rollback_does_not(self):
  with tempfile.TemporaryDirectory() as d:
   s=Service(Path(d)/'data',Path(d)/'repo','http://localhost')
   with s.store.tx() as db:
    s.store.put(db,'versions',{'id':'v','status':'review','candidate_id':'c','report':{'large':'x'*100000}})
    install(db)
   snapshot={'versions':[{'id':'v','status':'review','preview_url':'/preview'}]}
   with s.store.tx() as db:
    v=s.store.get(db,'versions','v');v['status']='approved';s.store.put(db,'versions',v)
   result=operational(s,snapshot)
   self.assertEqual(result['versions'][0]['status'],'approved')
   self.assertEqual(snapshot['versions'][0]['status'],'review')
   self.assertEqual(result['versions'][0]['preview_url'],'/preview')
   with s.store.read() as db:
    self.assertLess(len(db.execute("SELECT data FROM ui_live_records WHERE id='v'").fetchone()[0]),200)
   try:
    with s.store.tx() as db:
     v['status']='review';s.store.put(db,'versions',v);raise ValueError('rollback')
   except ValueError:pass
   self.assertEqual(operational(s,snapshot)['versions'][0]['status'],'approved')

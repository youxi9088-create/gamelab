import tempfile,unittest,sqlite3
from pathlib import Path
from unittest.mock import patch
from controlplane.service import Service
from controlplane.store import later
from controlplane.supply import SupplyWorker

class CallbackContentionTests(unittest.TestCase):
 def setUp(self):
  self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
  p=Path(self.tmp.name);self.s=Service(p/'data',p/'repo','http://localhost')
  self.tool={'id':'fixture','capabilities':['rea','reconstruct'],'name':'fixture'}
 def seed(self):
  with self.s.store.tx() as db:
   settings=self.s.get(db,'settings','main');settings['concurrency']=1;self.s.store.put(db,'settings',settings)
   self.s.store.put(db,'batches',{'id':'b','status':'running'})
   self.s.store.put(db,'jobs',{'id':'busy','status':'running','lease_expires_at':later(300),'stage':'rea','batch_id':'b'})
   self.s.store.put(db,'jobs',{'id':'q','status':'queued','stage':'rea','batch_id':'b'})
 def test_full_capacity_check_is_read_only_even_while_another_writer_holds_lock(self):
  self.seed();db=sqlite3.connect(self.s.store.path);db.execute('BEGIN IMMEDIATE')
  try:
   with patch.object(self.s.store,'tx',side_effect=AssertionError('unexpected writer')):
    result=self.s.claim_available(self.tool)
   self.assertFalse(result['available']);self.assertEqual(result['running'],1)
  finally:db.rollback();db.close()
 def test_expired_lease_can_reach_atomic_claim_and_maintenance_blocks_advice(self):
  self.seed()
  with self.s.store.tx() as db:
   j=self.s.get(db,'jobs','busy');j['lease_expires_at']=later(-1);self.s.store.put(db,'jobs',j)
  self.assertTrue(self.s.claim_available(self.tool)['available'])
  with self.s.store.tx() as db:self.s.store.put(db,'settings',{'id':'maintenance','draining':True})
  self.assertFalse(self.s.claim_available(self.tool)['available'])
 def test_idle_supply_scan_never_opens_write_transaction(self):
  worker=SupplyWorker(self.s)
  with patch.object(self.s.store,'tx',side_effect=AssertionError('idle scan acquired writer')):
   worker.tick()
 def test_two_available_readers_do_not_reserve_or_bypass_global_capacity(self):
  import test_platform,concurrent.futures
  fixture=test_platform.PlatformTest();fixture.setUp();self.addCleanup(fixture.doCleanups)
  fixture.s.mutate('/api/settings',{'concurrency':1})
  fixture.enqueue(fixture.candidate('https://example.org/first'))
  fixture.enqueue(fixture.candidate('https://example.org/second'))
  self.assertTrue(fixture.s.claim_available(fixture.tool)['available'])
  self.assertTrue(fixture.s.claim_available(fixture.tool)['available'])
  with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
   jobs=list(pool.map(lambda _:fixture.claim(),range(2)))
  self.assertEqual(sum(j is not None for j in jobs),1)

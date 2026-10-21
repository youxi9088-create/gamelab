import concurrent.futures
import tempfile
import threading
import time
import unittest
from pathlib import Path
from controlplane.service import Service, ApiError
from controlplane.executor import Executor
from server import build_server


class AutomaticTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        root=Path(self.tmp.name)
        self.service=Service(root/'data',root/'repo','http://127.0.0.1:8766')

    def tearDown(self):self.tmp.cleanup()

    def test_wechat_share_link_preserved_and_deduplicated(self):
        link='#小程序://几何王国/Xq1y10POetHAipF'
        first=self.service.mutate('/api/conversions',{'url':link})
        second=self.service.mutate('/api/conversions',{'url':link})
        self.assertEqual(first['candidate']['url'],link)
        self.assertEqual(first['candidate']['title'],'几何王国')
        self.assertEqual(first['job']['id'],second['job']['id'])
        self.assertTrue(second['deduplicated'])
        with self.assertRaises(ApiError):
            self.service.mutate('/api/conversions',{'url':'#小程序://几何王国/'})

    def test_dashboard_counts_games_across_versions_and_time_ranges(self):
        from controlplane.store import now, later
        with self.service.store.tx() as db:
            for item in [dict(id='old',title='Old fixture',created_at=later(-86400),imported_at=later(-86400)),dict(id='new',title='New fixture',created_at=now())]:
                self.service.store.put(db,'candidates',item)
            for i,status in enumerate(['queued','running','blocked']):
                self.service.store.put(db,'jobs',dict(id=str(i),candidate_id='new',status=status))
            for i,status in enumerate(['review','review','approved','published']):
                self.service.store.put(db,'versions',dict(id=str(i),candidate_id='new' if status=='review' else 'old',status=status))
        metrics=self.service.state()['metrics']
        self.assertEqual(metrics['submitted_today'],1)
        self.assertEqual(metrics['converting_games'],1)
        self.assertEqual(metrics['pending_review_games'],1)
        self.assertEqual(metrics['accepted_games'],1)
        self.assertEqual(metrics['errors'],1)
        self.assertEqual(metrics['trend'][-1]['submitted'],1)
        self.assertEqual(metrics['trend'][-1]['imported'],0)

    def test_concurrent_link_submission_creates_one_job_and_preserves_rights(self):
        def submit(_):return self.service.mutate('/api/conversions',{'url':'https://example.org/game'})
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:
            results=list(pool.map(submit,range(4)))
        self.assertEqual(len({r['job']['id'] for r in results}),1)
        state=self.service.state()
        self.assertEqual(len(state['jobs']),1)
        self.assertEqual(state['candidates'][0]['rights'],'unknown')
        self.assertEqual(state['versions'],[])

    def test_automatic_worker_does_not_claim_manual_queue(self):
        c=self.service.mutate('/api/candidates',{'title':'Manual','url':'https://example.org/manual'})['candidate']
        b=self.service.mutate('/api/batches',{'name':'Manual','candidate_ids':[c['id']]})['batch']
        self.service.mutate('/api/batches/'+b['id']+'/start',{})
        tool=self.service.mutate('/api/tools',{'name':'Auto','capabilities':['rea']})['tool']
        claim=lambda:self.service.mutate('/api/v1/jobs/claim',{'capabilities':['rea'],'automatic_only':True},tool)
        self.assertIsNone(claim()['job'])
        expected=self.service.mutate('/api/conversions',{'url':'https://example.org/auto'})['job']
        job=claim()['job'];self.assertEqual(job['id'],expected['id'])
        with self.assertRaises(ApiError):
            self.service.mutate('/api/v1/jobs/'+job['id']+'/acquired',{'lease_token':'invalid','observations':{}},tool)
        self.service.mutate('/api/v1/jobs/'+job['id']+'/acquired',{'lease_token':job['lease_token'],'title':'Discovered','observations':{'controls':'click'}},tool)
        self.assertEqual(self.service.state()['candidates'][0]['title'],'Discovered')

    def test_executor_starts_and_restarts_after_crash(self):
        server=build_server(self.service,0)
        thread=threading.Thread(target=server.serve_forever,daemon=True);thread.start()
        executor=Executor(self.service,server.server_port)
        try:
            executor.start()
            for _ in range(100):
                if executor.health()['ready']:break
                time.sleep(.1)
            self.assertTrue(executor.health()['ready'])
            old=executor.process.pid;executor.process.terminate();executor.process.wait(timeout=5)
            for _ in range(100):
                if executor.health()['ready'] and executor.process.pid!=old:break
                time.sleep(.1)
            self.assertTrue(executor.health()['ready'])
            self.assertNotEqual(executor.process.pid,old)
        finally:
            executor.close();server.shutdown();server.server_close();thread.join()
        self.assertFalse(executor.health()['ready'])

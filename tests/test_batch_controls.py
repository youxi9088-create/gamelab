import unittest
import tempfile
import sys
import subprocess
import urllib.error
from pathlib import Path
from unittest.mock import patch
import test_platform as fixtures
from controlplane.service import ApiError


class BatchControlsTest(unittest.TestCase):
    def setUp(self):
        self.f=fixtures.PlatformTest();self.f.setUp();self.addCleanup(self.f.doCleanups)
        self.s=self.f.s

    def test_stop_revokes_running_lease_and_resume_requeues(self):
        self.f.enqueue();job=self.f.claim();bid=job['batch_id']
        self.s.mutate('/api/batches/'+bid+'/stop',{})
        state=self.s.state();self.assertEqual('stopped',state['jobs'][0]['status'])
        self.assertIsNone(self.f.claim())
        with self.assertRaises(ApiError):self.f.completion(job)
        self.s.mutate('/api/batches/'+bid+'/resume',{'automatic':True})
        next_job=self.f.claim();self.assertNotEqual(job['lease_token'],next_job['lease_token'])
        self.assertTrue(next_job['automatic'])

    def test_batch_retry_only_retries_failures(self):
        c1=self.f.candidate();c2=self.f.candidate('https://example.org/second')
        batch=self.s.mutate('/api/batches',{'name':'Two games','candidate_ids':[c1['id'],c2['id']]})['batch']
        self.s.mutate('/api/batches/'+batch['id']+'/start',{'automatic':True})
        first=self.f.claim();self.s.mutate('/api/v1/jobs/'+first['id']+'/complete',{'lease_token':first['lease_token'],'outcome':'failed','reason':'Temporary error'},self.f.tool)
        from controlplane.delivery_requirements import REQUIRED
        # Synthetic evidence belongs only to the disposable test artifact.
        report={'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['index.html'],'reason':'isolated fixture'} for k in REQUIRED}}
        second=self.f.claim();completed=self.f.completion(second,report=report)
        self.s.mutate('/api/batches/'+batch['id']+'/retry',{})
        jobs={j['id']:j for j in self.s.state()['jobs']}
        self.assertEqual('queued',jobs[first['id']]['status'])
        self.assertEqual('Temporary error',jobs[first['id']]['reason'])
        self.assertEqual('review',jobs[completed['id']]['status'])
        self.assertEqual(completed['version_id'],jobs[completed['id']]['version_id'])

    def test_stopped_batch_cannot_override_newer_active_task(self):
        candidate=self.f.enqueue();job=self.f.claim();bid=job['batch_id']
        self.s.mutate('/api/batches/'+bid+'/stop',{})
        self.f.enqueue(candidate)
        with self.assertRaises(ApiError):self.s.mutate('/api/batches/'+bid+'/resume',{})
        old=next(j for j in self.s.state()['jobs'] if j['id']==job['id'])
        self.assertEqual('stopped',old['status'])

    def test_revoked_lease_terminates_actual_job_process(self):
        sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
        import worker
        class Client:
            base='http://127.0.0.1:1';token='test'
            def post(self,*args):raise urllib.error.HTTPError(self.base,409,'revoked',{},None)
        with tempfile.TemporaryDirectory() as directory:
            script=Path(directory)/'fake_worker.py'
            script.write_text('import sys,json,time\njson.load(sys.stdin)\ntime.sleep(60)\n')
            original=subprocess.Popen;processes=[]
            def spawn(*args,**kwargs):
                process=original(*args,**kwargs);processes.append(process);return process
            with patch.object(worker,'__file__',str(script)),patch.object(worker.subprocess,'Popen',side_effect=spawn):
                worker.execute_isolated(Client(),{'id':'stopped-test','lease_token':'old'})
            self.assertIsNotNone(processes[0].poll())

if __name__=='__main__':unittest.main()

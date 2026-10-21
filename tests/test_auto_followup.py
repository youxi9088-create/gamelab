import unittest
import test_platform
from controlplane.auto_followup import decide
from controlplane.delivery_requirements import REQUIRED
from controlplane.service import ApiError


class AutoFollowupTests(unittest.TestCase):
    def setUp(self):
        self.f=test_platform.PlatformTest();self.f.setUp();self.addCleanup(self.f.doCleanups)
        self.s=self.f.s;self.f.enqueue()

    def draft(self,job,report=None):
        if job.get('continuation'):
            lease={'lease_token':job['lease_token']}
            artifact=self.s.mutate('/api/v1/artifacts',{**lease,'job_id':job['id'],'changes':{'index.html':'<html>Fixture revision</html>'},'entry':'index.html'},self.f.tool)
            return self.s.mutate('/api/v1/jobs/'+job['id']+'/complete',{**lease,'outcome':'draft','artifact_id':artifact['artifact_id'],'report':report or {'runtime_verified':True}},self.f.tool)['job']
        return self.f.completion(job,'recovered' if job['stage']=='rea' else 'draft',report or {'runtime_verified':True})

    def test_pending_work_requeues_latest_version_without_user_message(self):
        job=self.f.claim()
        # Automatic initial conversion must go through the same delivery gate.
        with self.s.store.tx() as db:
            current=self.s.get(db,'jobs',job['id']);current['automatic']=True;self.s.store.put(db,'jobs',current)
        result=self.draft(job)
        self.assertEqual(result['status'],'queued')
        self.assertTrue(result['continuation'])
        self.assertEqual(result['base_version_id'],result['version_id'])
        self.assertNotIn('lease_token',result)
        claimed=self.f.claim()
        self.assertTrue(claimed['input']['pending_delivery']['gaps'])
        messages=claimed['input']['conversation']
        self.assertTrue(any(m['role']=='system' and m['kind']=='auto_followup' for m in messages))
        with self.assertRaises(ApiError):self.draft(job)
        self.assertEqual(self.s.state()['versions'][0]['status'],'draft')

    def test_stalled_work_has_concrete_blocker_and_preserves_versions(self):
        j=self.f.claim()
        # Explicit drafts are also covered for non-automatic initial jobs.
        with self.s.store.tx() as db:
            row=self.s.get(db,'jobs',j['id']);row['automatic']=True;self.s.store.put(db,'jobs',row)
        for i in range(4):
            result=self.draft(j)
            if i<3:
                self.assertEqual(result['status'],'queued');j=self.f.claim()
        self.assertEqual(result['status'],'blocked')
        self.assertEqual(result['blocker']['code'],'NO_VERIFICATION_PROGRESS')
        self.assertEqual(len(self.s.state()['versions']),4)
        self.assertIsNone(self.f.claim())

    def test_explicit_blocker_does_not_queue(self):
        j=self.f.claim()
        with self.s.store.tx() as db:
            row=self.s.get(db,'jobs',j['id']);row['automatic']=True;self.s.store.put(db,'jobs',row)
        result=self.draft(j,{'runtime_verified':True,'blocker':{'code':'MISSING_MATERIAL','reason':'Required reference unavailable','next_action':'Provide reference'}})
        self.assertEqual(result['status'],'blocked')
        self.assertEqual(result['blocker']['code'],'MISSING_MATERIAL')

    def test_pause_is_preserved(self):
        j=self.f.claim()
        with self.s.store.tx() as db:
            row=self.s.get(db,'jobs',j['id']);row['automatic']=True;self.s.store.put(db,'jobs',row)
        self.s.mutate('/api/batches/'+j['batch_id']+'/pause',{})
        result=self.draft(j)
        self.assertEqual(result['status'],'queued')
        self.assertEqual(self.s.state()['batches'][0]['status'],'paused')
        self.assertIsNone(self.f.claim())

    def test_progress_resets_stall_counter_and_complete_goes_to_review(self):
        previous,_=decide(None,['a','b'],{'runtime_verified':True})
        previous,_=decide(previous,['a','b'],{'runtime_verified':True})
        current,blocker=decide(previous,['a'],{'runtime_verified':True})
        self.assertEqual(current['stalled'],0);self.assertIsNone(blocker)
        j=self.f.claim()
        with self.s.store.tx() as db:
            row=self.s.get(db,'jobs',j['id']);row['automatic']=True;self.s.store.put(db,'jobs',row)
        report={'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['index.html']} for k in REQUIRED}}
        result=self.f.completion(j,report=report)
        self.assertEqual(result['status'],'review')
        self.assertIsNone(self.f.claim())

    def test_reworded_reasons_and_timestamps_are_not_progress(self):
        report={'foundation_checks':{'gameplay':{'status':'pending','reason':'first'}},'spec_tests':{'created_at':'first','cases':[{'id':'win','status':'pending'}]}}
        previous,_=decide(None,['pending'],report)
        report['foundation_checks']['gameplay']['reason']='reworded'
        report['spec_tests']['created_at']='later'
        current,_=decide(previous,['different explanation'],report)
        self.assertEqual(current['stalled'],1)

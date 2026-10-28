import unittest
import test_platform as fixtures
from controlplane.service import ApiError
from controlplane.accounts import authorize


class JobControlsTest(unittest.TestCase):
    def setUp(self):
        self.f=fixtures.PlatformTest();self.f.setUp();self.addCleanup(self.f.doCleanups)
        self.s=self.f.s

    def control(self, action, *ids):
        return self.s.mutate('/api/jobs/bulk', {'action':action,'ids':list(ids)})

    def test_pause_revokes_lease_and_start_preserves_task(self):
        self.f.enqueue();job=self.f.claim()
        self.control('pause',job['id'])
        self.assertIsNone(self.f.claim())
        self.assertEqual(self.s.state()['jobs'][0]['display_status'],'paused')
        with self.assertRaises(ApiError):self.f.completion(job)
        self.control('start',job['id']);resumed=self.f.claim()
        self.assertEqual(resumed['id'],job['id'])
        self.assertNotEqual(resumed['lease_token'],job['lease_token'])

    def test_selected_start_does_not_resume_batch_siblings(self):
        batch=self.s.mutate('/api/conversions',{'urls':['https://example.org/a','https://example.org/b']})
        first,second=batch['jobs']
        self.s.mutate('/api/batches/'+first['batch_id']+'/pause',{})
        self.control('start',first['id'])
        jobs={j['id']:j for j in self.s.state()['jobs']}
        self.assertTrue(jobs[second['id']]['manual_paused'])
        self.assertEqual(self.f.claim()['id'],first['id'])

    def test_invalid_ids_roll_back_and_duplicate_actions_skip(self):
        self.f.enqueue();job=self.s.state()['jobs'][0]
        with self.assertRaises(ApiError):self.control('pause',job['id'],'missing')
        self.assertNotIn('manual_paused',self.s.state()['jobs'][0])
        self.control('pause',job['id'])
        self.assertEqual(self.control('pause',job['id'])['skipped'],[job['id']])

    def test_roles(self):
        authorize({'role':'operator'},'/api/jobs/bulk',True)
        with self.assertRaises(ApiError):authorize({'role':'viewer'},'/api/jobs/bulk',True)
        self.f.enqueue();job=self.s.state()['jobs'][0]
        with self.assertRaises(ApiError):self.s.mutate('/api/v1/jobs/bulk',{'action':'pause','ids':[job['id']]},self.f.tool)


if __name__=='__main__':unittest.main()

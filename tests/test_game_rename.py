import unittest
import test_platform as fixtures
from controlplane.service import ApiError

class GameRenameTest(unittest.TestCase):
    def setUp(self):
        self.f=fixtures.PlatformTest();self.f.setUp();self.addCleanup(self.f.doCleanups)
        self.s=self.f.s

    def test_rename_updates_versions_but_preserves_snapshot(self):
        c=self.f.enqueue();job=self.f.completion(self.f.claim())
        before=self.s.state()['versions'][0]
        self.s.mutate('/api/candidates/'+c['id']+'/update',{'title':'  新游戏名称  '})
        state=self.s.state();self.assertEqual('新游戏名称',state['candidates'][0]['title'])
        self.assertEqual('新游戏名称',state['versions'][0]['title'])
        self.assertEqual(before['commit'],state['versions'][0]['commit'])
        self.assertEqual(before['artifact_id'],state['versions'][0]['artifact_id'])
        for title in ('','   ','x'*121,None):
            with self.assertRaises(ApiError):self.s.mutate('/api/candidates/'+c['id']+'/update',{'title':title})

    def test_acquisition_does_not_overwrite_manual_title(self):
        c=self.s.mutate('/api/conversions',{'url':'https://example.org/rename'})['candidate']
        self.s.mutate('/api/candidates/'+c['id']+'/update',{'title':'我的名字'})
        job=self.f.claim()
        self.s.mutate('/api/v1/jobs/'+job['id']+'/acquired',{'lease_token':job['lease_token'],'title':'网站原始名称','observations':{}},self.f.tool)
        self.assertEqual('我的名字',self.s.state()['candidates'][0]['title'])

if __name__=='__main__':unittest.main()

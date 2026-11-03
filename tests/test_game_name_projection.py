import unittest
import test_platform

class GameNameProjectionTests(unittest.TestCase):
    def test_state_projects_names_without_writing_historical_records(self):
        fixture=test_platform.PlatformTest();fixture.setUp();self.addCleanup(fixture.doCleanups)
        service=fixture.s
        title='Play Example Game - Free Online Game | Rosebud'
        candidate={'id':'name-fixture','title':title,'url':'https://rosebud.ai/play/c/fixture','canonical_url':'https://rosebud.ai/play/c/fixture','source':'Rosebud','category':'益智','engine':'Canvas','rights':'unknown','status':'approved','title_source':'acquired_clean'}
        candidate['created_at']='2026-11-01T00:00:00+00:00'
        version={'id':'v-name-fixture','candidate_id':candidate['id'],'title':title,'status':'approved','created_at':'2026-11-01T00:00:00+00:00','artifact_id':'artifact-name-fixture','report':{}}
        with service.store.tx() as db:
            service.store.put(db,'candidates',candidate);service.store.put(db,'versions',version)
        state=service.state()
        self.assertEqual(next(c for c in state['candidates'] if c['id']==candidate['id'])['title'],'Example Game')
        self.assertEqual(next(v for v in state['versions'] if v['id']==version['id'])['title'],'Example Game')
        with service.store.read() as db:
            self.assertEqual(service.store.get(db,'candidates',candidate['id']),candidate)
            self.assertEqual(service.store.get(db,'versions',version['id']),version)

if __name__=='__main__':unittest.main()

import unittest
from tools.import_task_adaptation import intake_task
from controlplane.delivery_requirements import REQUIRED
import test_conversations as fixtures

class TaskAdaptationTest(unittest.TestCase):
    def test_completed_task_gets_new_review_without_revoking_old_acceptance(self):
        f=fixtures.ConversationsTest();f.setUp();self.addCleanup(f.doCleanups)
        state=f.s.state();job=state['jobs'][0];base=state['versions'][0]
        with f.s.store.tx() as db:
            job.update(status='completed');f.s.store.put(db,'jobs',job)
            base.update(status='approved',approved_at='2026-10-20T12:00:00Z',checks={'gameplay':True,'visual':True})
            f.s.store.put(db,'versions',base)
        source=f.s.repo.artifacts/base['artifact_id']
        (source/'screenshots').mkdir(exist_ok=True);(source/'screenshots/runtime.png').write_bytes(b'fixture')
        report={'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['index.html','screenshots/runtime.png']} for k in REQUIRED}}
        version=intake_task(f.s,job['id'],source,report)
        self.assertEqual(version['status'],'review')
        self.assertEqual(version['base_version_id'],base['id'])
        self.assertNotEqual(version['artifact_id'],base['artifact_id'])
        self.assertEqual(version['round'],job.get('round',1)+1)
        with f.s.store.tx() as db:
            self.assertEqual(f.s.store.get(db,'versions',base['id']),base)
        self.assertEqual(f.s.state()['jobs'][0]['status'],'review')
        self.assertEqual(len(f.s.state()['jobs']),len(state['jobs']))

    def test_material_question_preserves_draft_and_resumes_same_task(self):
        f=fixtures.ConversationsTest();f.setUp();self.addCleanup(f.doCleanups)
        state=f.s.state();job=state['jobs'][0];base=state['versions'][0]
        with f.s.store.tx() as db:
            job['status']='blocked';f.s.store.put(db,'jobs',job)
            f.s.request_job_input(db,job,'请补充原版操作说明')
        current=f.s.state()['jobs'][0]
        self.assertEqual(current['status'],'waiting_input')
        self.assertEqual(current['version_id'],base['id'])
        with f.s.store.tx() as db:
            f.s.continue_job(db,current,'向右移动后吞食小鱼')
        resumed=f.s.state()['jobs'][0]
        self.assertEqual(resumed['id'],job['id'])
        self.assertEqual(resumed['base_version_id'],base['id'])
        self.assertEqual(resumed['status'],'queued')
        self.assertNotIn('question',resumed)

    def test_incomplete_work_is_saved_as_draft_not_review(self):
        f=fixtures.ConversationsTest();f.setUp();self.addCleanup(f.doCleanups)
        state=f.s.state();job=state['jobs'][0];base=state['versions'][0]
        source=f.s.repo.artifacts/base['artifact_id'];(source/'screenshots').mkdir();(source/'screenshots/test.png').write_bytes(b'fixture')
        v=intake_task(f.s,job['id'],source,{'runtime_verified':True},save_draft=True)
        self.assertEqual(v['status'],'draft');self.assertEqual(f.s.state()['jobs'][0]['status'],'blocked')
        self.assertEqual(f.s.state()['metrics']['review'],0)

    def test_same_task_snapshot_and_no_approval(self):
        f=fixtures.ConversationsTest();f.setUp();self.addCleanup(f.doCleanups)
        state=f.s.state();job=state['jobs'][0];base=state['versions'][0]
        with f.s.store.tx() as db:
            job.update(status='waiting_input',question='export resources');f.s.store.put(db,'jobs',job)
        source=f.s.repo.artifacts/base['artifact_id']
        (source/'screenshots').mkdir(exist_ok=True);(source/'screenshots/runtime.png').write_bytes(b'test fixture')
        report={'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['index.html','screenshots/runtime.png']} for k in REQUIRED}}
        v=intake_task(f.s,job['id'],source,report)
        self.assertEqual(v['job_id'],job['id']);self.assertEqual(v['status'],'review')
        self.assertEqual(v['base_version_id'],base['id'])
        with f.s.store.tx() as db:
            self.assertTrue(f.s.store.get(db,'artifacts',v['artifact_id'])['runtime_local'])
        current=f.s.state()['jobs'][0];self.assertEqual(current['status'],'review');self.assertNotIn('question',current)
        self.assertEqual(len(f.s.state()['jobs']),len(state['jobs']))
        with self.assertRaises(Exception):intake_task(f.s,job['id'],source,{'runtime_verified':True})

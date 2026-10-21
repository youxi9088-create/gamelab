import copy
import tempfile
import unittest
from pathlib import Path
from controlplane.service import Service, ApiError
from controlplane.dependencies import normalize, summary, KINDS
from controlplane.delivery_requirements import delivery_gaps, REQUIRED
from executors.dependency_inventory import inventory


def record():
    return {'scope':'isolated fixture', 'items':[
        dict(id=k,name=k,kind=k,status='verified',evidence='proof.json',reason='',next_action='') for k in KINDS]}


class DependencyTests(unittest.TestCase):
    def test_available_is_not_ready_and_categories_required(self):
        value=record()
        self.assertTrue(summary(normalize(value))['ready'])
        value['items'][0]['status']='available'
        self.assertFalse(summary(value)['ready'])
        value['items'].pop()
        self.assertTrue(summary(value)['missing_categories'])

    def test_evidence_and_unique_ids_required(self):
        value=record(); value['items'][0]['evidence']=''
        with self.assertRaises(ValueError):normalize(value)
        value=record(); value['items'].append(value['items'][0])
        with self.assertRaises(ValueError):normalize(value)

    def test_runtime_pass_does_not_override_missing_dependency(self):
        value=record();value['items'][0]['status']='missing'
        report={'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['proof.json']} for k in REQUIRED},'dependencies':value}
        self.assertEqual(len(delivery_gaps(report,['proof.json'])),1)

    def test_auto_inventory_never_claims_complete(self):
        result=normalize(inventory({'resource_directory':'cache','cache_manifest':[{'files':[{'file':'game.js'},{'file':'scene.bin'}]}]}))
        self.assertFalse(summary(result)['ready'])
        self.assertEqual(result['items'][0]['status'],'available')

    def test_api_revision_history_and_worker_ownership(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); service=Service(root/'data',root/'repo','http://localhost:8766')
            c=service.mutate('/api/candidates',{'title':'fixture','url':'https://example.com/game'})['candidate']
            endpoint='/api/candidates/'+c['id']+'/dependencies'
            payload={'revision':0,'dependencies':record()}
            result=service.mutate(endpoint,payload)
            self.assertEqual(result['dependencies']['revision'],1)
            with self.assertRaises(ApiError):service.mutate(endpoint,payload)
            with service.store.tx() as db:
                self.assertEqual(len(service.store.all(db,'dependency-history')),1)
            tool=service.mutate('/api/tools',{'name':'fixture worker','capabilities':['collect']})['tool']
            with self.assertRaises(ApiError):service.mutate(endpoint.replace('/api/','/api/v1/'),{'revision':1,'dependencies':record(),'job_id':'missing','lease_token':'wrong'},tool)

    def test_dependency_plan_clears_stale_question_without_requeue(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); service=Service(root/'data',root/'repo','http://localhost:8766')
            result=service.mutate('/api/conversions',{'url':'https://example.org/plan'})
            c,j=result['candidate'],result['job']
            service.mutate('/api/candidates/'+c['id']+'/dependencies',{'revision':0,'dependencies':record()})
            with service.store.tx() as db:
                j.update(status='waiting_input',question='stale question')
                service.store.put(db,'jobs',j)
            service.mutate('/api/jobs/'+j['id']+'/dependency-plan',{'reason':'Continue dependency analysis without requiring backend credentials.'})
            job=service.state()['jobs'][0]
            self.assertEqual(job['display_status'],'dependency_pending')
            self.assertEqual(job['status'],'blocked')
            self.assertNotIn('question',job)

    def test_unresolved_dependency_cannot_be_approved(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); service=Service(root/'data',root/'repo','http://localhost:8766')
            c=service.mutate('/api/candidates',{'title':'fixture','url':'https://example.com/review'})['candidate']
            dep=record();dep['items'][0]['status']='missing'
            service.mutate('/api/candidates/'+c['id']+'/dependencies',{'revision':0,'dependencies':dep})
            with service.store.tx() as db:
                service.store.put(db,'versions',dict(id='test-version',candidate_id=c['id'],status='review'))
            with self.assertRaises(ApiError):
                service.mutate('/api/versions/test-version/approve',{'checks':{'gameplay':True,'visual':True}})

    def test_work_log_does_not_requeue_or_complete_task(self):
        with tempfile.TemporaryDirectory() as d:
            root=Path(d); service=Service(root/'data',root/'repo','http://localhost:8766')
            j=service.mutate('/api/conversions',{'url':'https://example.org/log'})['job']
            before=service.state()['jobs'][0]
            service.mutate('/api/jobs/'+j['id']+'/work-log',{'message':'Validated browser inputs; original-game comparison remains pending.'})
            self.assertEqual(before,service.state()['jobs'][0])
            with self.assertRaises(ApiError):
                service.mutate('/api/jobs/'+j['id']+'/work-log',{'message':'short'})

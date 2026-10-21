import base64
import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from controlplane.service import Service, ApiError
from tools.import_local_review import intake
from controlplane.delivery_requirements import REQUIRED

def fixture_report():
    return {'runtime_verified':True,'foundation_checks':{k:{'status':'verified','evidence':['index.html']} for k in REQUIRED}}

sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
import worker


class ConversationsTest(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        root=Path(self.tmp.name);self.s=Service(root/'data',root/'repo','http://127.0.0.1:8766')
        src=root/'source';src.mkdir();(src/'index.html').write_text('<button id="start">Old</button>')
        (src/'assets').mkdir();(src/'assets/original.bin').write_bytes(b'original-resource')
        self.c=self.s.mutate('/api/candidates',{'title':'Conversation fixture','url':'https://example.org/rounds','source_path':str(src),'rights':'owned'})['candidate']
        self.v=intake(self.s,self.c['id'],'http://127.0.0.1:9876/',fixture_report())
        self.j=self.s.state()['jobs'][0]
        self.tool=self.s.mutate('/api/tools',{'name':'test','capabilities':['rea','reconstruct']})['tool']

    def reply(self,text='Change the button label'):
        return self.s.mutate('/api/jobs/'+self.j['id']+'/message',{'message':text})['job']

    def claim(self):
        return self.s.mutate('/api/v1/jobs/claim',{'capabilities':['reconstruct'],'automatic_only':True},self.tool)['job']

    def test_waiting_reply_releases_lease_and_keeps_context(self):
        queued=self.reply();self.assertEqual('reconstruct',queued['stage']);job=self.claim()
        self.s.mutate('/api/v1/jobs/'+job['id']+'/ask',{'lease_token':job['lease_token'],'question':'What label?'},self.tool)
        self.assertEqual(1,self.s.state()['metrics']['waiting_input'])
        self.assertIsNone(self.claim())
        with self.assertRaises(ApiError):
            self.s.mutate('/api/v1/jobs/'+job['id']+'/complete',{'lease_token':job['lease_token'],'outcome':'failed'},self.tool)
        resumed=self.reply('New label');self.assertEqual(queued['round'],resumed['round'])
        next_job=self.claim();self.assertNotEqual(job['lease_token'],next_job['lease_token'])
        self.assertEqual(['user','assistant','user'],[m['role'] for m in next_job['input']['conversation']])
        self.assertEqual(self.v['id'],next_job['input']['base_version']['id'])

    def test_duplicate_submit_and_resource_overwrite_rejected(self):
        self.reply()
        with self.assertRaises(ApiError):self.reply('double click')
        job=self.claim()
        for changes in ({'../bad.js':'x'},{'assets/original.bin':'x'},{'vendor/a.js':'x'}):
            with self.assertRaises(ApiError):
                self.s.mutate('/api/v1/artifacts',{'job_id':job['id'],'lease_token':job['lease_token'],'changes':changes,'entry':'index.html'},self.tool)

    def test_revision_preserves_exact_newlines_in_template_strings(self):
        self.reply();job=self.claim()
        text='<html>\r\n<script>const text=`first\r\nsecond`;</script>\r\n</html>'
        artifact=self.s.mutate('/api/v1/artifacts',{'job_id':job['id'],'lease_token':job['lease_token'],'changes':{'index.html':text},'entry':'index.html'},self.tool)
        self.assertEqual((self.s.repo.artifacts/artifact['artifact_id']/'index.html').read_bytes(),text.encode('utf-8'))

    def test_partial_revision_is_preserved_as_playable_draft(self):
        self.reply();job=self.claim();lease={'lease_token':job['lease_token']}
        report={'runtime_verified':True,'foundation_checks':{}}
        artifact=self.s.mutate('/api/v1/artifacts',{**lease,'job_id':job['id'],'changes':{'index.html':'<button>Revised draft</button>'},'entry':'index.html','report':report},self.tool)
        done=self.s.mutate('/api/v1/jobs/'+job['id']+'/complete',{**lease,'outcome':'draft','artifact_id':artifact['artifact_id'],'report':report,'reason':'Partial repair'},self.tool)['job']
        self.assertEqual(done['status'],'queued')
        state=self.s.state();version=next(v for v in state['versions'] if v['id']==done['version_id'])
        self.assertEqual(version['status'],'draft')
        self.assertEqual(version['base_version_id'],self.v['id'])
        self.assertEqual(state['metrics']['review'],0)
        self.assertEqual(state['jobs'][0]['display_status'],'queued')
        self.assertEqual(state['metrics']['errors'],0)
        self.assertTrue((self.s.repo.artifacts/version['artifact_id']/'assets/original.bin').exists())

    def test_failed_round_preserves_draft_and_syncs_candidate(self):
        self.reply();job=self.claim()
        self.s.mutate('/api/v1/jobs/'+job['id']+'/complete',{'lease_token':job['lease_token'],'outcome':'failed','reason':'AI schema invalid'},self.tool)
        state=self.s.state()
        self.assertEqual(next(c for c in state['candidates'] if c['id']==job['candidate_id'])['status'],'failed')
        self.assertEqual(state['jobs'][0]['display_status'],'failed')
        resumed=self.s.mutate('/api/jobs/'+job['id']+'/retry',{})['job']
        self.assertNotEqual(resumed['reason'],'AI schema invalid')
        self.assertEqual(resumed['base_version_id'],self.v['id'])

    def test_failed_continuation_keeps_overall_task_needs_work(self):
        with self.s.store.tx() as db:
            v=self.s.get(db,'versions',self.v['id']);v['status']='draft';self.s.store.put(db,'versions',v)
        self.reply();job=self.claim()
        self.s.mutate('/api/v1/jobs/'+job['id']+'/complete',{'lease_token':job['lease_token'],'outcome':'failed','reason':'Invalid AI response'},self.tool)
        state=self.s.state();current=state['jobs'][0]
        self.assertEqual(current['display_status'],'needs_work')
        self.assertEqual(current['last_attempt_status'],'failed')
        self.assertEqual(current['version_id'],self.v['id'])
        self.assertEqual(state['metrics']['errors'],1)
        self.assertEqual(state['metrics']['review'],0)

    def test_worker_question_reply_revision_real_browser(self):
        service,tool=self.s,self.tool
        class Client:
            def post(self,path,body):return service.mutate('/api/v1/'+path,body,tool)
        self.reply();job=self.claim()
        with patch.object(worker,'chat',return_value={'question':'按钮显示什么文字？'}):worker.execute(Client(),job)
        self.assertEqual('waiting_input',self.s.state()['jobs'][0]['status'])
        self.reply('显示“继续游戏”');job=self.claim()
        html='<html><body><button id="start">继续游戏</button><p>资源保留</p></body></html>'
        result={'changes':{'index.html':html},'entry':'index.html','summary':'已修改按钮文字','acceptance_actions':[{'type':'click','selector':'#start','expect_text':'继续游戏'},{'type':'click','selector':'#start','expect_text':'资源保留'}]}
        result.update(fixture_report())
        with patch.object(worker,'chat',return_value=result):worker.execute(Client(),job)
        state=self.s.state();latest=state['versions'][0]
        self.assertEqual('review',state['jobs'][0]['status'])
        self.assertEqual(self.v['id'],latest['base_version_id'])
        self.assertTrue(latest['report']['runtime_verified'])
        self.assertIn('/runtime/',latest['preview_url'])
        self.assertTrue(latest['cover'])
        self.assertEqual(b'original-resource',(self.s.repo.artifacts/latest['artifact_id']/'assets/original.bin').read_bytes())
        self.assertEqual('<button id="start">Old</button>',(self.s.repo.artifacts/self.v['artifact_id']/'index.html').read_text())
        self.s.mutate('/api/versions/'+latest['id']+'/reject',{'reason':'继续调整按钮尺寸'})
        job=self.claim();self.assertEqual(latest['id'],job['base_version_id'])
        self.assertEqual('继续调整按钮尺寸',job['input']['conversation'][-1]['text'])
        self.assertEqual(1,len(self.s.state()['jobs']))

    def test_historical_duplicates_are_migrated_without_enqueueing(self):
        with self.s.store.tx() as db:
            older=dict(self.j,id='older',status='blocked');self.s.store.put(db,'jobs',older)
            newer=dict(self.j,id='newer',status='review');self.s.store.put(db,'jobs',newer)
            duplicate=dict(self.v,id='new-version');self.s.store.put(db,'versions',duplicate)
            self.s.reconcile_history(db)
        state=self.s.state()
        self.assertEqual(0,state['metrics']['errors'])
        self.assertEqual(1,state['metrics']['review'])
        self.assertFalse(any(j['status']=='queued' for j in state['jobs']))

if __name__=='__main__':unittest.main()

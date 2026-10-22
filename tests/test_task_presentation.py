import tempfile
import unittest
import threading
import subprocess
from pathlib import Path
from controlplane.pipeline import timeline,progress_summary
from controlplane.service import Service
from controlplane.discovery_language import public


class TaskPresentationTests(unittest.TestCase):
    def test_isolated_task_page(self):
        from server import build_server
        from controlplane.runtime import node_binary
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);s=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            job=s.mutate('/api/conversions',{'url':'https://example.org/fixture'})['job']
            with s.store.tx() as db:
                job.update(status='blocked',round=2,progress=90,version_id='v-fixture',auto_followup={'gaps':['存档恢复：尚未取得刷新后的进度证据']})
                s.store.put(db,'jobs',job)
                s.store.put(db,'versions',dict(id='v-fixture',job_id=job['id'],candidate_id=job['candidate_id'],round=2,status='draft',report={'runtime_verified':True}))
                s.store.event(db,'开始适配',job['id'],'adapt',node='adapt',node_status='running',round=1)
            server=build_server(s,0);threading.Thread(target=server.serve_forever,daemon=True).start()
            try:
                result=subprocess.run([node_binary(),'tools/check_task_flow_ui.cjs',f'http://127.0.0.1:{server.server_port}'],capture_output=True,text=True,timeout=60)
                self.assertEqual(result.returncode,0,result.stderr)
            finally:server.shutdown();server.server_close()

    def test_old_round_does_not_remain_running(self):
        job=dict(id='j',status='completed',stage='reconstruct',round=2,version_id='v')
        events=[dict(id='e',job_id='j',round=1,node='adapt',node_status='running')]
        versions=[dict(id='v',job_id='j',round=2,status='approved',approved_at='2026-10-22T00:00:00+00:00')]
        p=timeline(job,events,versions)
        self.assertFalse(any(n['status']=='running' for n in p['nodes']))
        self.assertEqual(p['nodes'][3]['records'][0]['round'],1)

    def test_legacy_verification_is_in_test_node(self):
        p=timeline(dict(id='j',status='blocked',stage='reconstruct'),[
            dict(id='e',job_id='j',stage='reconstruct',message='平台 Web 验证第 2 轮：证据已保存')],[])
        self.assertEqual(len(p['nodes'][4]['records']),1)

    def test_draft_is_not_ninety_percent(self):
        text=progress_summary(dict(status='blocked',version_id='v',progress=90),[dict(id='v',status='draft')])
        self.assertIn('验证未完成',text)
        self.assertNotIn('90',text)

    def test_translation_retains_source(self):
        r=dict(gameplay='Collect coins and avoid enemies',gameplay_zh='收集金币并躲避敌人')
        self.assertEqual(public(r)['gameplay'],'收集金币并躲避敌人')
        self.assertEqual(r['gameplay'],'Collect coins and avoid enemies')
        self.assertIn('中文翻译待完成',public(dict(gameplay='Collect coins'))['gameplay'])

    def test_global_single_claim_and_queue(self):
        with tempfile.TemporaryDirectory() as directory:
            root=Path(directory);s=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            s.mutate('/api/conversions',{'urls':['https://example.org/a','https://example.org/b']})
            a=s.mutate('/api/tools',{'name':'a','capabilities':['rea']})['tool']
            b=s.mutate('/api/tools',{'name':'b','capabilities':['rea']})['tool']
            with s.store.tx() as db:
                settings=s.store.get(db,'settings','main');settings['concurrency']=8;s.store.put(db,'settings',settings)
            first=s.mutate('/api/v1/jobs/claim',{'capabilities':['rea']},a)['job']
            self.assertIsNone(s.mutate('/api/v1/jobs/claim',{'capabilities':['rea']},b)['job'])
            state=s.state()
            self.assertEqual(state['conversion_queue'],dict(limit=1,running=1,waiting=1))
            self.assertEqual(next(j for j in state['jobs'] if j['status']=='queued')['queue_position'],1)
            s.mutate('/api/v1/jobs/'+first['id']+'/complete',{'lease_token':first['lease_token'],'outcome':'blocked','reason':'fixture'},a)
            self.assertIsNotNone(s.mutate('/api/v1/jobs/claim',{'capabilities':['rea']},b)['job'])


if __name__=='__main__':unittest.main()

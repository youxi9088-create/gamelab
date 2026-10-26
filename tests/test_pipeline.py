import unittest
from controlplane.pipeline import timeline
from test_automatic import AutomaticTests
from controlplane.service import ApiError


class LinkBatchTests(AutomaticTests):
    def test_link_batch_atomic_and_dedup(self):
        r=self.service.mutate('/api/conversions',{'urls':['https://example.org/a','https://example.org/b','https://example.org/a']})
        self.assertEqual(len(r['jobs']),2)
        self.assertTrue(all(j['automatic'] for j in r['jobs']))
        self.assertEqual({j['batch_id'] for j in r['jobs']},{r['batch']['id']})
        again=self.service.mutate('/api/conversions',{'urls':['https://example.org/a']})
        self.assertIsNone(again['batch'])
        self.assertEqual(len(again['reused']),1)
        with self.assertRaises(ApiError):
            self.service.mutate('/api/conversions',{'urls':['https://example.org/c','not a url']})
        self.assertEqual(len(self.service.state()['candidates']),2)

    def test_node_events_require_valid_lease_and_status(self):
        r=self.service.mutate('/api/conversions',{'url':'https://example.org/a'})
        tool=self.service.mutate('/api/tools',{'name':'worker','capabilities':['rea']})['tool']
        j=self.service.mutate('/api/v1/jobs/claim',{'capabilities':['rea']},tool)['job']
        path=f"/api/v1/jobs/{j['id']}/events"
        body={'lease_token':j['lease_token'],'node':'acquire','node_status':'running','message':'获取缓存'}
        self.service.mutate(path,body,tool)
        self.service.mutate(path,dict(body,execution_id='exec1',node_attempt=1),tool)
        self.service.mutate(path,dict(body,node_status='failed',execution_id='exec1',node_attempt=1),tool)
        self.service.mutate(path,dict(body,node_status='repairing'),tool)
        self.service.mutate(path,dict(body,node='repair',parent_node='acquire'),tool)
        self.service.mutate(path,dict(body,execution_id='exec2',node_attempt=2),tool)
        with self.assertRaises(ApiError):
            self.service.mutate(path,dict(body,node='made-up'),tool)
        with self.assertRaises(ApiError):
            self.service.mutate(path,dict(body,lease_token='wrong'),tool)
        state=self.service.state()
        self.assertEqual(state['jobs'][0]['pipeline']['current'],'acquire')
        self.assertNotIn('lease_token',state['jobs'][0])
        node=state['jobs'][0]['pipeline']['nodes'][1]
        self.assertEqual(node['failure_count'],1)
        self.assertEqual(node['retry_count'],1)


class TimelineTests(unittest.TestCase):
    def test_legacy_machine_proof_exposes_executed_entry_and_failed_verify(self):
        job=dict(id='j',round=10,stage='rea',status='blocked',reason='Web verify：timeout',report={'auto_repair':{
            'original_error':'Web verify：timeout','episodes':[{'attempts':[{'attempt':1,'verified':True,'action':'verify_dom_entry',
                'tool_result':{'passed':True,'url':'https://example.org/game'}}]}]}})
        pipe=timeline(job,[],[]);nodes={n['key']:n for n in pipe['nodes']}
        self.assertEqual(nodes['identify']['status'],'succeeded')
        self.assertEqual(nodes['test']['status'],'blocked')
        self.assertEqual(pipe['current'],'test')
        self.assertEqual(nodes['test']['execution_count'],0)  # Do not invent attempt counts.
        job['status']='running'
        self.assertNotEqual(timeline(job,[],[])['nodes'][0]['status'],'succeeded')
    def test_legacy_logs_do_not_fake_completion(self):
        j=dict(id='j',stage='rea',status='blocked',reason='缺少缓存')
        p=timeline(j,[dict(id='e',job_id='j',stage='rea',message='开始分析',created_at='2026-10-20T00:00:00+00:00')],[])
        self.assertEqual(p['nodes'][0]['status'],'unrecorded')
        self.assertEqual(p['nodes'][2]['status'],'blocked')
        self.assertFalse(any(n['status']=='succeeded' for n in p['nodes']))

    def test_import_does_not_invent_test_success(self):
        p=timeline(dict(id='j',stage='packaging',status='review',version_id='v'),[],
                   [dict(id='v',job_id='j',status='review',created_at='2026-10-20T00:00:00+00:00')])
        self.assertEqual(p['nodes'][4]['status'],'unrecorded')
        self.assertEqual(next(n for n in p['nodes'] if n['key']=='delivery')['status'],'succeeded')
        self.assertEqual(p['current'],'review')

    def test_repeated_steps_preserve_history_and_latest_duration(self):
        events=[dict(id=str(i),job_id='j',node='test',node_status=status,created_at=f'2026-10-20T00:00:0{i}+00:00')
                for i,status in enumerate(['running','failed','running','succeeded'])]
        p=timeline(dict(id='j',stage='reconstruct',status='review'),events,[])
        node=p['nodes'][4]
        self.assertEqual(node['status'],'succeeded')
        self.assertEqual(node['duration_seconds'],1)
        self.assertEqual(len(node['records']),4)

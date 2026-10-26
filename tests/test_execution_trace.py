import sys
from pathlib import Path
import unittest
sys.path.insert(0,str(Path(__file__).resolve().parents[1]/'executors'))
from execution_trace import ExecutionTrace, TRACE
from controlplane.pipeline import timeline


class TraceTests(unittest.TestCase):
    def test_recording_a_blocked_plan_is_not_successful_analysis(self):
        plan={'route':'blocked','next_action':'Need an observed entry'}
        self.assertEqual(self.trace.run('analysis',lambda:plan),plan)
        node=next(n for n in self.pipe()['nodes'] if n['key']=='analysis')
        self.assertEqual(node['status'],'waiting_input')
        self.assertEqual(node['executions'][0]['status'],'waiting_input')

    def setUp(self):
        self.events=[]
        def emit(**event):
            self.events.append(dict(event,id=str(len(self.events)),job_id='j',round=2,
                created_at=f'2026-10-26T10:00:{len(self.events):02d}+00:00'))
        self.trace=ExecutionTrace(emit)

    def pipe(self,status='running'):
        return timeline(dict(id='j',round=2,status=status,stage='rea',telemetry_version=2),list(reversed(self.events)),[])

    def test_failed_then_actual_retry_and_success_remain_distinct(self):
        calls=[]
        def operation():
            calls.append(1)
            if len(calls)==1: raise ValueError('missing resource')
            return 42
        def recovery(error,retry):
            p=self.pipe();n=next(n for n in p['nodes'] if n['key']=='test')
            self.assertEqual(n['failure_count'],1)
            self.assertEqual(n['execution_count'],1)
            return True,retry()
        self.assertEqual(self.trace.run('test',operation,recovery),42)
        node=next(n for n in self.pipe('review')['nodes'] if n['key']=='test')
        self.assertEqual([e['status'] for e in node['executions']],['failed','succeeded'])
        self.assertEqual(node['retry_count'],1)
        self.assertEqual(node['presentation']['label'],'✓ 重试后通过')

    def test_repeated_diagnosis_is_not_an_execution(self):
        self.trace.run('adapt',lambda: self.trace.run('test',lambda: 1))
        for i in range(5):
            self.trace.emit(node='repair',node_status='running',parent_node='test',message='inspect')
        nodes={n['key']:n for n in self.pipe()['nodes']}
        self.assertEqual(nodes['test']['execution_count'],1)
        self.assertEqual(nodes['test']['status'],'repairing')
        self.assertEqual(nodes['repair']['execution_count'],0)
        self.assertEqual(nodes['identify']['status'],'pending')

    def test_recovery_failure_stays_failed_and_preserves_attempt(self):
        def fail():raise ValueError('unavailable')
        with self.assertRaises(ValueError):
            self.trace.run('test',fail,lambda error,retry:(False,None))
        node=next(n for n in self.pipe('blocked')['nodes'] if n['key']=='test')
        self.assertEqual(node['failure_count'],1)
        self.assertEqual(node['retry_count'],0)
        self.assertEqual(node['status'],'blocked')

    def test_nested_guarded_reports_real_verification(self):
        from auto_repair import guarded
        token=TRACE.set(self.trace)
        try:self.trace.run('adapt',lambda:guarded(lambda:1,None,None,node='test'))
        finally:TRACE.reset(token)
        nodes={n['key']:n for n in self.pipe('review')['nodes']}
        self.assertEqual(nodes['test']['status'],'succeeded')
        self.assertEqual(nodes['adapt']['status'],'succeeded')
        self.assertEqual(nodes['test']['records'][0]['parent_node'],'adapt')

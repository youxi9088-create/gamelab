import tempfile
import unittest
from pathlib import Path
from controlplane.policy_presentation import web_pause
from controlplane.service import Service


CASES = [
    ('本批仅转换 Web：检测到非 Web 平台声明，暂停转换', 'paused_non_web'),
    ('本批仅转换 Web：尚未确认 Web 游戏类型或运行入口，暂停转换', 'paused_web_unknown'),
    ('Web 类型检测无法访问页面，已暂停；connection failed', 'paused_web_access'),
]


class PausePresentationTests(unittest.TestCase):
    def test_explicit_scope_and_lifecycle_only(self):
        for reason, status in CASES:
            job=dict(web_only=True,status='waiting_input',reason=reason)
            self.assertEqual(web_pause(job)['status'], status)
            self.assertIsNone(web_pause(dict(job,status='running')))
            self.assertIsNone(web_pause(dict(job,web_only=False)))
        self.assertIsNone(web_pause(dict(web_only=True,status='waiting_input',reason='请提供操作说明')))

    def test_read_model_does_not_rewrite_history(self):
        with tempfile.TemporaryDirectory() as temp:
            root=Path(temp);service=Service(root/'data',root/'repo','http://127.0.0.1:8766')
            batch=service.mutate('/api/conversions',{'urls':['https://example.org/game/'+str(i) for i in range(3)]})
            with service.store.tx() as db:
                for job,(reason,_) in zip(batch['jobs'],CASES):
                    job.update(status='waiting_input',web_only=True,reason=reason,question=reason)
                    service.store.put(db,'jobs',job)
            state=service.state()
            self.assertEqual({j['display_status'] for j in state['jobs']},{s for _,s in CASES})
            self.assertTrue(all(j['status']=='waiting_input' for j in state['jobs']))
            self.assertTrue(all('已暂停' in j['pipeline']['presentation']['headline'] for j in state['jobs']))
            with service.store.tx() as db:
                self.assertTrue(all('policy_pause' not in j for j in service.store.all(db,'jobs')))

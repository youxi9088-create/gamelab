"""Rule layer: known failures are handled without AI; publisher site locks are only identified."""
import json
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
sys.path[:0] = [str(ROOT), str(ROOT / 'executors')]

from controlplane import failure_rules
from controlplane.service import Service

# Self-authored fixtures that mimic the shape of observed minified host checks.
HOST_GATE = 'const _n=x=>x.includes("crazygames"),pn=x=>{const{flags:n,hostname:t}=x;let f=!n.isCrazyWeb;f=n.isCrazyWeb&&_n(t)||f;return f};'
SDK_LOCK = 'console.log("[CrazySDK] SiteLock v1.9.0");'
POKI_LOCK = 'if(!allowed)location.href="https://poki.com/sitelock";'


class FailureRuleTests(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory();self.addCleanup(self.tmp.cleanup)
        self.run_dir = Path(self.tmp.name) / 'run'
        (self.run_dir / 'converted/evidence').mkdir(parents=True)

    def write(self, name, text):
        path = self.run_dir / name;path.parent.mkdir(parents=True, exist_ok=True);path.write_text(text, 'utf-8')

    def runtime(self, **value):
        self.write('converted/evidence/runtime.json', json.dumps(value))

    def test_signatures_detected_with_file_evidence(self):
        for code, vendor in ((HOST_GATE, 'crazygames'), (SDK_LOCK, 'crazygames'), (POKI_LOCK, 'poki')):
            with self.subTest(vendor=vendor, code=code[:20]):
                (self.run_dir / 'converted/assets/app.js').unlink(missing_ok=True)
                self.write('converted/assets/app.js', code)
                found = failure_rules.scan_publisher_lock(self.run_dir / 'converted')
                self.assertEqual(found['vendor'], vendor)
                self.assertEqual(found['file'], 'assets/app.js')

    def test_silent_start_failure_with_lock_is_blocked(self):
        self.write('converted/assets/app.js', HOST_GATE)
        self.runtime(passed=False, errors=[], missing=[], canvasCount=0, loaded=False)
        matched = failure_rules.classify(TimeoutError('Web verify：page.waitForFunction: Timeout 90000ms exceeded.'), self.run_dir, 'test')
        self.assertEqual((matched['code'], matched['handling']), ('PUBLISHER_SITE_LOCK', 'block'))
        self.assertIn('不规避', matched['next_action'])

    def test_logged_activation_counts_even_with_other_noise(self):
        self.write('converted/js/sdk.js', SDK_LOCK)
        self.runtime(passed=False, errors=['unrelated'], missing=['/x.png'], siteLockLogs=['SiteLock v1.9.0 activated, Code 3'])
        self.assertEqual(failure_rules.classify(RuntimeError('timeout'), self.run_dir, 'test')['code'], 'PUBLISHER_SITE_LOCK')

    def test_sdk_presence_alone_is_not_a_failure_cause(self):
        self.write('converted/js/sdk.js', SDK_LOCK)
        # Real resource/script errors must go to AI, not be mislabelled as a lock.
        self.runtime(passed=False, errors=['TypeError: x is undefined'], missing=[])
        self.assertIsNone(failure_rules.classify(RuntimeError('Offline check failed'), self.run_dir, 'test'))
        self.runtime(passed=False, errors=[], missing=[])
        self.assertIsNone(failure_rules.classify(RuntimeError('timeout'), self.run_dir, 'acquire'))

    def test_platform_rejection_and_transient_rules(self):
        import worker
        rejected = failure_rules.classify(worker.PlatformApiError('jobs/job-1/events', 400, '无效流水线节点或状态'))
        self.assertEqual(rejected['code'], 'PLATFORM_API_REJECTED')
        self.assertEqual(rejected['evidence']['endpoint'], 'jobs/<job>/events')
        self.assertIsNone(failure_rules.classify(worker.PlatformApiError('jobs/job-1/heartbeat', 409, 'lease')))
        self.assertEqual(failure_rules.classify(RuntimeError('page.goto: Target page, context or browser has been closed'))['code'], 'TRANSIENT_BROWSER')

    def test_diagnose_blocks_lock_without_ai_and_reports_rule(self):
        import auto_repair, worker
        self.write('converted/assets/app.js', HOST_GATE)
        self.runtime(passed=False, errors=[], missing=[])
        self.write('web-acquisition.json', json.dumps({'files': []}))
        calls = []
        token = auto_repair.CHAT.set(lambda *a: calls.append(a) or {'action': 'stop'})
        try:
            error = worker.Blocked('Web verify timeout')
            recovered, _ = auto_repair.diagnose(error, self.run_dir, worker.Budget(600), retry=lambda: None, stage='test')
        finally:
            auto_repair.CHAT.reset(token)
        self.assertFalse(recovered);self.assertEqual(calls, [])
        self.assertEqual(error.classification['code'], 'PUBLISHER_SITE_LOCK')
        report = json.loads((self.run_dir / 'auto-repair/report.json').read_text('utf-8'))
        self.assertEqual(report['classification']['code'], 'PUBLISHER_SITE_LOCK')
        completion = worker.classified(error, str(error), {'run_directory': str(self.run_dir)})
        self.assertEqual(completion['report']['blocker']['code'], 'PUBLISHER_SITE_LOCK')
        self.assertIn('发行方', completion['reason'])

    def test_transient_failure_retries_once_without_ai(self):
        import auto_repair, worker
        calls, retries = [], []
        token = auto_repair.CHAT.set(lambda *a: calls.append(a) or {'action': 'stop'})
        try:
            recovered, result = auto_repair.diagnose(RuntimeError('TargetClosedError: browser has been closed'), self.run_dir,
                                                     worker.Budget(600), retry=lambda: retries.append(1) or 'ok', stage='test')
        finally:
            auto_repair.CHAT.reset(token)
        self.assertEqual((recovered, result, len(retries), calls), (True, 'ok', 1, []))

    def test_completed_blocker_is_shown_on_job(self):
        root = Path(self.tmp.name)
        s = Service(root / 'data', root / 'repo', 'http://127.0.0.1:8766')
        created = s.mutate('/api/tools', {'name': 'w', 'capabilities': ['collect', 'rea', 'reconstruct']})
        tool = created['tool']
        candidate = s.mutate('/api/candidates', {'title': 'Fixture', 'url': 'https://example.org/game', 'rights': 'owned'})['candidate']
        batch = s.mutate('/api/batches', {'name': 'T', 'candidate_ids': [candidate['id']]})['batch']
        s.mutate('/api/batches/' + batch['id'] + '/start', {})
        job = s.mutate('/api/v1/jobs/claim', {'capabilities': ['rea', 'reconstruct']}, tool)['job']
        rule = failure_rules.rule('PUBLISHER_SITE_LOCK')
        done = s.mutate('/api/v1/jobs/' + job['id'] + '/complete', {'lease_token': job['lease_token'], 'outcome': 'blocked',
            'reason': rule['reason'], 'report': {'blocker': {k: rule[k] for k in ('code', 'reason', 'next_action')}}}, tool)['job']
        self.assertEqual(done['blocker']['code'], 'PUBLISHER_SITE_LOCK')

class AIReliabilityTests(unittest.TestCase):
    def test_transient_backoff_and_format_corrections_are_bounded_and_metered(self):
        import worker
        from unittest.mock import patch
        sleeps = []
        with patch.object(worker, 'ai_config', return_value={'backend': 'api'}), patch.object(worker.time, 'sleep', sleeps.append), \
                patch.object(worker, 'complete', side_effect=[RuntimeError('AI API 调用失败：HTTP 502；请检查连接和模型配置'),
                    RuntimeError('AI API 调用失败：超时，任务等待上限 300 秒'), ({'ok': True}, 'api')]) as provider:
            budget = worker.Budget(600, calls=5)
            self.assertEqual(worker.chat([], budget), {'ok': True})
        self.assertEqual((provider.call_count, budget.calls, sleeps), (3, 2, [3, 9]))
        malformed = RuntimeError('AI API 调用失败：响应不是有效 JSON；请检查连接和模型配置')
        with patch.object(worker, 'ai_config', return_value={'backend': 'api'}), \
                patch.object(worker, 'complete', side_effect=[malformed, malformed, ({'ok': True}, 'api')]) as provider:
            self.assertEqual(worker.chat([{'role': 'system', 'content': 'JSON'}], worker.Budget(600, calls=5)), {'ok': True})
            self.assertIn('合法 JSON', provider.call_args.args[0][0]['content'])
        with patch.object(worker, 'ai_config', return_value={'backend': 'api'}), patch.object(worker.time, 'sleep'), \
                patch.object(worker, 'complete', side_effect=RuntimeError('AI API 调用失败：HTTP 503')) as provider:
            with self.assertRaises(worker.Blocked):worker.chat([], worker.Budget(600, calls=10))
            self.assertEqual(provider.call_count, 3)  # first try + two bounded retries
        with patch.object(worker, 'ai_config', return_value={'backend': 'api'}), \
                patch.object(worker, 'complete', side_effect=RuntimeError('AI API 调用失败：HTTP 400')) as provider:
            with self.assertRaises(worker.Blocked):worker.chat([], worker.Budget(600, calls=10))
            self.assertEqual(provider.call_count, 1)  # request/config errors are not retried

    def test_diagnosis_corrects_missing_action_instead_of_stopping(self):
        import auto_repair, worker
        with tempfile.TemporaryDirectory() as tmp:
            run = Path(tmp)
            answers = iter([{'diagnosis': 'no action field'}, {'action': 'retry', 'diagnosis': 'temporary', 'reason': 'r'}])
            seen = []
            def chat(messages, budget):
                seen.append(json.loads(messages[1]['content'][0]['text']).get('tool_feedback'))
                return next(answers)
            token = auto_repair.CHAT.set(chat)
            try:
                recovered, result = auto_repair.diagnose(RuntimeError('fixture failure'), run, worker.Budget(600, calls=6),
                                                         retry=lambda: 'verified', stage='test')
            finally:
                auto_repair.CHAT.reset(token)
            self.assertEqual((recovered, result), (True, 'verified'))
            self.assertIn('allowed_actions', seen[1])


class LearningSummaryTests(unittest.TestCase):
    def test_layers_codes_and_promotion_candidates(self):
        def ai_job(i, error):
            return {'id': f'job-{i}', 'status': 'review', 'report': {'auto_repair': {'episodes': [{'stage': 'test', 'attempts': [
                {'action': 'inspect'}, {'action': 'patch_host', 'verified': True, 'error': error, 'diagnosis': 'host path'}]}]}}}
        jobs = [ai_job(1, r'Missing module C:\GameLab\runs\a1\x.js line 12'), ai_job(2, 'Missing module C:/GameLab/runs/b2/x.js line 99'),
                {'id': 'job-3', 'status': 'blocked', 'blocker': {'code': 'PUBLISHER_SITE_LOCK'}, 'report': {'auto_repair': {'episodes': [
                    {'stage': 'test', 'classification': failure_rules.rule('PUBLISHER_SITE_LOCK'), 'attempts': []}]}}},
                {'id': 'job-4', 'status': 'failed', 'report': {'auto_repair': {'episodes': [{'stage': 'test', 'attempts': [{'action': 'stop'}]}]}}}]
        summary = failure_rules.summarize(jobs)
        self.assertEqual(summary['success_rate'], 0.5)
        self.assertEqual(summary['resolution_layers'], {'rule_blocked': 1, 'rule_recovered': 0, 'ai_recovered': 2, 'unresolved': 1})
        self.assertEqual(summary['blocking_codes'][0], {'code': 'PUBLISHER_SITE_LOCK', 'handling': 'block', 'jobs': 1})
        candidate = summary['rule_candidates'][0]
        self.assertEqual((candidate['occurrences'], candidate['promote'], candidate['action']), (2, True, 'patch_host'))
        json.dumps(summary)  # must stay serializable for /api/state


if __name__ == '__main__':unittest.main()

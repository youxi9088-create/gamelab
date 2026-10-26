import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / 'executors'))
import conversion_checkpoint as checkpoints
import worker


class CheckpointTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.runs = self.root / 'runs'
        self.prior = self.runs / 'previous'
        self.current = self.runs / 'current'
        self.current.mkdir(parents=True)
        self.inp = {'url': 'https://example.org/source'}
        self.observation = {'url': self.inp['url'], 'title': 'fixture', 'web_discovery': {'entries': []}}
        self.write('job-binding.json', {'job_id': 'job-fixture'})
        self.write('acquisition/collected.json', self.observation)
        self.write('discovered-web-input.json', {'url': 'https://example.org/entry'})
        self.write('conversion-plan.json', {'route': 'web'})
        self.write('converted/index.html', '<script src="game.js"></script>')
        self.write('converted/game.js', 'game()')
        self.write('web-original/game.js', 'game()')
        self.write('web-acquisition.json', {'url': 'https://example.org/entry', 'engine': 'browser',
            'files': [{'path': 'game.js', 'sha256': checkpoints.digest(self.prior / 'web-original/game.js')}],
            'patches': [], 'preloadErrors': []})
        self.job = {'id': 'job-fixture', 'candidate_id': 'candidate-fixture', 'lease_token': 'fixture',
                    'stage': 'rea', 'automatic': True, 'round': 2, 'input': self.inp,
                    'report': {'run_directory': str(self.prior), 'auto_repair': {'episodes': [{'stage': 'test'}]}}}

    def write(self, name, value):
        path = self.prior / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(value if isinstance(value, str) else json.dumps(value), 'utf-8')

    def save(self):
        checkpoints.save(self.prior, self.inp, self.observation)
        self.write('converted/evidence/runtime.json', {'passed': False, 'failure': 'fixture timeout'})

    def tearDown(self):self.temp.cleanup()

    def test_restores_immutable_capture_and_carries_failed_runtime_as_history(self):
        self.save()
        self.write('converted/game.js', 'later failed patch')
        result, reason = checkpoints.restore(self.job, self.current, self.runs)
        self.assertIsNone(reason)
        self.assertEqual((self.current / 'converted/game.js').read_text(), 'game()')
        self.assertEqual(result['resume_node'], 'test')
        self.assertFalse(result.get('prior_runtime_failed'))  # Different bytes require fresh validation.
        self.assertEqual((self.prior / 'converted/game.js').read_text(), 'later failed patch')

    def test_changed_input_or_wrong_job_invalidates_before_copy(self):
        self.save()
        for changed in ({**self.job, 'id': 'other-job'},
                        {**self.job, 'input': {'url': 'https://example.org/changed'}},
                        {**self.job, 'input': {**self.inp, 'game_spec': {'changed': True}}}):
            value, reason = checkpoints.restore(changed, self.current, self.runs)
            self.assertIsNone(value)
            self.assertTrue(reason)
            self.assertFalse((self.current / 'converted').exists())

    def test_corrupt_snapshot_falls_back_without_partial_outputs(self):
        self.save()
        (self.prior / 'checkpoints/web-capture/converted/game.js').write_text('tampered')
        value, reason = checkpoints.restore(self.job, self.current, self.runs)
        self.assertIsNone(value)
        self.assertTrue(reason)
        self.assertFalse((self.current / 'converted').exists())

    def test_verified_working_copy_is_not_replaced_by_pre_repair_capture(self):
        self.save()
        self.write('converted/game.js', 'adaptedGame()')
        self.write('converted/evidence/runtime.json', {'passed': True})
        checkpoints.save(self.prior, self.inp, self.observation, kind='web-runtime')
        result, reason = checkpoints.restore(self.job, self.current, self.runs)
        self.assertIsNone(reason)
        self.assertEqual((self.current/'converted/game.js').read_text(), 'adaptedGame()')
        self.assertFalse(result.get('prior_runtime_failed'))

    def test_legacy_capture_requires_test_evidence_and_original_hashes(self):
        self.write('converted/evidence/runtime.json', {'passed': False})
        before = {p.relative_to(self.prior).as_posix(): p.read_bytes() for p in self.prior.rglob('*') if p.is_file()}
        value, reason = checkpoints.restore(self.job, self.current, self.runs)
        self.assertIsNone(reason)
        self.assertTrue(value['legacy_verified'])
        after = {p.relative_to(self.prior).as_posix(): p.read_bytes() for p in self.prior.rglob('*') if p.is_file()}
        self.assertEqual(before, after)

    def test_legacy_incomplete_capture_cannot_resume(self):
        self.write('converted/evidence/runtime.json', {'passed': False})
        self.job['report']['auto_repair'] = {'stage': 'identify'}
        self.assertIsNone(checkpoints.restore(self.job, self.current, self.runs)[0])
        self.job['report']['auto_repair'] = {'stage': 'test'}
        self.write('web-original/game.js', 'changed')
        self.assertIsNone(checkpoints.restore(self.job, self.current, self.runs)[0])

    def test_worker_resumes_without_entry_probe_or_acquisition(self):
        self.save()
        calls = []
        class Client:
            def post(self, path, body):
                calls.append((path, body))
                return {'artifact_id': 'fixture-artifact'}
        with patch.object(worker, 'ROOT', self.root), patch('acquisition.acquire') as acquire, \
                patch('entry_recovery.recover') as recover, \
                patch('discovered_web.convert', return_value={'dependencies': {}, 'runtime_verified': True}) as convert:
            worker.execute(Client(), self.job)
        acquire.assert_not_called()
        recover.assert_not_called()
        self.assertTrue(convert.call_args.kwargs['resume'])
        reused = [body['node'] for path, body in calls if body.get('node_status') == 'reused']
        self.assertEqual(set(reused), {'identify', 'acquire', 'analysis'})
        self.assertFalse(any(body.get('node') in ('identify', 'acquire') and body.get('node_status') == 'running' for _, body in calls))
        from controlplane.pipeline import timeline
        events = [dict(body, id=str(i), job_id=self.job['id'], round=2, created_at=f'2026-10-26T00:00:{i:02d}+00:00')
                  for i, (path, body) in enumerate(calls) if path.endswith('/events')]
        nodes = {node['key']: node for node in timeline({**self.job, 'status': 'blocked', 'telemetry_version': 1}, events, [])['nodes']}
        for key in ('identify', 'acquire', 'analysis'):
            self.assertEqual(nodes[key]['status'], 'reused')
            self.assertEqual(nodes[key]['execution_count'], 0)

    def test_resume_diagnoses_before_repeating_runtime_test(self):
        import discovered_web
        self.save()
        value, reason = checkpoints.restore(self.job, self.current, self.runs)
        self.assertIsNone(reason)
        with patch('discovered_web.subprocess.run') as command, \
                patch('discovered_web.prepare_viewport', return_value=(None, {})), \
                patch('auto_repair.diagnose', return_value=(False, None)) as diagnose:
            with self.assertRaises(worker.Blocked):
                discovered_web.convert(self.inp, value['observation'], self.current, worker.Budget(60), None, resume=True)
        command.assert_not_called()
        self.assertEqual(diagnose.call_args.kwargs['stage'], 'test')


if __name__ == '__main__':unittest.main()

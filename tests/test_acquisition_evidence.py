import json
import tempfile
import unittest
from pathlib import Path

from controlplane.acquisition_evidence import engine_by_candidate, reset


class AcquisitionEvidenceTests(unittest.TestCase):
    def setUp(self):
        reset()
        self.tmp = tempfile.TemporaryDirectory()
        self.root = Path(self.tmp.name)
        self.addCleanup(self.tmp.cleanup)

    def _run(self, name, job_id, engine):
        directory = self.root / name
        directory.mkdir()
        (directory / 'job-binding.json').write_text(json.dumps({'job_id': job_id}), encoding='utf-8')
        payload = {'engine': engine} if engine is not None else {}
        (directory / 'web-acquisition.json').write_text(json.dumps(payload), encoding='utf-8')

    def test_maps_run_evidence_to_candidate_and_prefers_cocos(self):
        self._run('run-a', 'job-1', 'cocos2')
        self._run('run-b', 'job-2', 'browser')      # later attempt, same candidate
        self._run('run-c', 'job-3', 'ruffle')
        self._run('run-d', 'job-4', 'something-new')  # unknown code, ignored
        self._run('run-e', 'job-5', None)
        jobs = [{'id': 'job-1', 'candidate_id': 'c1'}, {'id': 'job-2', 'candidate_id': 'c1'},
                {'id': 'job-3', 'candidate_id': 'c2'}, {'id': 'job-4', 'candidate_id': 'c3'},
                {'id': 'job-5', 'candidate_id': 'c4'}]
        self.assertEqual(engine_by_candidate(self.root, jobs),
                         {'c1': 'Cocos 2', 'c2': 'Ruffle / Flash'})

    def test_job_without_candidate_and_directory_without_binding_are_skipped(self):
        self._run('run-a', 'job-orphan', 'cocos2')
        (self.root / 'run-b').mkdir()
        (self.root / 'run-b' / 'web-acquisition.json').write_text(
            json.dumps({'engine': 'cocos2'}), encoding='utf-8')
        (self.root / 'run-c').mkdir()
        (self.root / 'run-c' / 'job-binding.json').write_text('not json', encoding='utf-8')
        (self.root / 'run-c' / 'web-acquisition.json').write_text(
            json.dumps({'engine': 'cocos2'}), encoding='utf-8')
        self.assertEqual(engine_by_candidate(self.root, [{'id': 'job-x', 'candidate_id': 'c9'}]), {})

    def test_scan_is_memoised_so_dashboard_polls_do_not_reread_run_directories(self):
        self._run('run-a', 'job-1', 'cocos2')
        jobs = [{'id': 'job-1', 'candidate_id': 'c1'}]
        first = engine_by_candidate(self.root, jobs)
        self.assertEqual(first, {'c1': 'Cocos 2'})
        # Mutate the evidence on disk: the memoised scan must keep serving until it expires.
        (self.root / 'run-a' / 'web-acquisition.json').write_text(
            json.dumps({'engine': 'browser'}), encoding='utf-8')
        self.assertEqual(engine_by_candidate(self.root, jobs), {'c1': 'Cocos 2'})
        reset()
        self.assertEqual(engine_by_candidate(self.root, jobs), {'c1': '通用 Web 运行包'})

    def test_unchanged_directory_signature_skips_the_rescan_after_ttl(self):
        import os
        from controlplane import acquisition_evidence as module
        self._run('run-a', 'job-1', 'cocos2')
        jobs = [{'id': 'job-1', 'candidate_id': 'c1'}]
        self.assertEqual(engine_by_candidate(self.root, jobs), {'c1': 'Cocos 2'})
        original = module.CACHE_SECONDS
        module.CACHE_SECONDS = 0
        self.addCleanup(setattr, module, 'CACHE_SECONDS', original)
        # Rewrite the evidence but restore the mtime: entry count and newest mtime
        # are unchanged, so the scan is skipped even though the TTL has expired.
        target = self.root / 'run-a' / 'web-acquisition.json'
        stamp = target.stat().st_mtime_ns
        target.write_text(json.dumps({'engine': 'browser'}), encoding='utf-8')
        os.utime(target, ns=(stamp, stamp))
        self.assertEqual(engine_by_candidate(self.root, jobs), {'c1': 'Cocos 2'})

    def test_missing_runs_directory_yields_no_evidence(self):
        self.assertEqual(engine_by_candidate(self.root / 'nope', []), {})


if __name__ == '__main__':
    unittest.main()

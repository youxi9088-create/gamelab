import importlib.util
from pathlib import Path
import unittest
import tempfile
from unittest.mock import Mock, patch

spec = importlib.util.spec_from_file_location('sync_runner', Path(__file__).resolve().parents[1] / 'tools/sync_service/runner.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class ScopeTest(unittest.TestCase):
    def test_missing_second_site_cannot_report_daily_success(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(runner.subprocess, 'run', return_value=Mock(returncode=0)):
            result = runner.sync_targets({'required_cloud_targets': ['cloudflare', 'origin'],
                'cloud_targets': [{'id': 'cloudflare', 'command': ['sync-cloudflare']}]}, Path(directory))
        self.assertFalse(result['ok'])
        self.assertTrue(result['targets']['cloudflare']['ok'])
        self.assertFalse(result['targets']['origin']['ok'])

    def test_first_target_failure_does_not_skip_second_site(self):
        with tempfile.TemporaryDirectory() as directory, patch.object(runner.subprocess, 'run',
                side_effect=[TimeoutError(), Mock(returncode=0)]) as run:
            result = runner.sync_targets({'required_cloud_targets': ['cloudflare', 'origin'],
                'cloud_targets': [{'id': 'cloudflare', 'command': ['cf']},
                                  {'id': 'origin', 'command': ['origin']}]}, Path(directory))
        self.assertEqual(run.call_count, 2)
        self.assertFalse(result['ok'])
        self.assertTrue(result['targets']['origin']['ok'])

    def test_excludes_private_runtime_files_from_git(self):
        for name in ['data/private.json', 'migration-private/state.json', '.cache/file.py',
                     'docs/reports/private.md', 'web/.env.json', 'services/demo/node_modules/x.js',
                     'executors/runs/task.json', 'platform.sqlite3']:
            self.assertFalse(runner.eligible(name), name)

    def test_includes_source_and_ignore_rules(self):
        for name in ['tools/sync_cloud.py', 'tools/sync_service/run.ps1', 'web/app.js',
                     'README.md', 'services/task_backend/.gitignore']:
            self.assertTrue(runner.eligible(name), name)


if __name__ == '__main__':
    unittest.main()

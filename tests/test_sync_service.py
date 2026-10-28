import importlib.util
from pathlib import Path
import unittest

spec = importlib.util.spec_from_file_location('sync_runner', Path(__file__).resolve().parents[1] / 'tools/sync_service/runner.py')
runner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(runner)


class ScopeTest(unittest.TestCase):
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

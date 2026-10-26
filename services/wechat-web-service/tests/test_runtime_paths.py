import shutil
import subprocess
import unittest
from pathlib import Path


class RuntimePathsTest(unittest.TestCase):
    def test_root_and_nested_mounts(self):
        node = shutil.which('node')
        self.assertIsNotNone(node, 'Node is required for runtime loader regression checks')
        result = subprocess.run(
            [node, str(Path(__file__).with_name('runtime-paths.cjs'))],
            capture_output=True, text=True, timeout=30)
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)

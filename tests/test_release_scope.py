import importlib.util
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

SPEC = importlib.util.spec_from_file_location('build_release', Path(__file__).resolve().parents[1] / 'tools/build_release.py')
release = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(release)

class ReleaseScopeTests(unittest.TestCase):
    def test_tracked_runtime_artifacts_never_enter_release(self):
        files = ['web/app.js', 'controlplane/server.py', 'data/artifacts/draft/index.html',
                 'game-library/versions/draft.zip', 'repo/draft.bin', 'qa-output/draft.png',
                 'backups/data.zip', 'executors/runs/draft/index.html',
                 'executors/node_modules/dependency.js', 'node_modules/dependency.js']
        archive = io.BytesIO()
        with zipfile.ZipFile(archive, 'w') as z:
            for name in files: z.writestr(name, 'fixture')
        def git(*args):
            return {'rev-parse': b'a'*40, 'fetch': b'', 'branch': b'origin/main',
                    'ls-tree': b'web\ncontrolplane\ndata\ngame-library\nrepo\nqa-output\nbackups\nexecutors\nnode_modules',
                    'archive': archive.getvalue()}[args[0]]
        with tempfile.TemporaryDirectory() as folder, patch.object(release, 'git', side_effect=git):
            output = Path(folder) / 'release.zip'
            release.build('HEAD', output)
            with zipfile.ZipFile(output) as z:
                self.assertEqual(set(z.namelist()), {'web/app.js', 'controlplane/server.py', 'RELEASE_MANIFEST.json'})
                self.assertEqual(set(json.loads(z.read('RELEASE_MANIFEST.json'))['files']), set(files[:2]))

if __name__ == '__main__': unittest.main()

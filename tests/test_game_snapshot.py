import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile
from contextlib import closing

spec = importlib.util.spec_from_file_location('game_snapshot', Path(__file__).resolve().parents[1] / 'tools/game_snapshot.py')
snapshot = importlib.util.module_from_spec(spec)
spec.loader.exec_module(snapshot)


class SnapshotTest(unittest.TestCase):
    def test_integrity_restore_and_refuse_overwrite(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            bundle = root / 'bundle'
            game = bundle / 'games/example'
            game.mkdir(parents=True)
            (game / 'index.html').write_text('launcher')
            with zipfile.ZipFile(game / 'web-runtime.zip', 'w') as z:
                z.writestr('index.html', '<html>playable</html>')
            manifest = {'games': [{'folder': 'games/example',
                'candidate': {'id': 'c', 'status': 'approved'},
                'version': {'id': 'v', 'candidate_id': 'c', 'artifact_id': 'a', 'status': 'approved'},
                'artifact': {'id': 'a', 'entry': 'index.html', 'files': ['index.html', 'web-runtime.zip']}}]}
            (bundle / 'manifest.json').write_text(json.dumps(manifest))
            snapshot.seal(bundle)
            snapshot.restore(bundle, root / 'data', 'http://localhost:9999')
            self.assertTrue((root / 'data/artifacts/a/runtime/index.html').is_file())
            import sqlite3
            with closing(sqlite3.connect(root / 'data/platform.sqlite3')) as db:
                version = json.loads(db.execute("SELECT data FROM records WHERE kind='versions'").fetchone()[0])
            self.assertEqual(version['status'], 'approved')
            self.assertEqual(version['preview_url'], 'http://localhost:9999/runtime/a/runtime/index.html')
            with self.assertRaises(ValueError):
                snapshot.restore(bundle, root / 'data', 'http://localhost:9999')
            (game / 'index.html').write_text('tampered')
            with self.assertRaises(ValueError):
                snapshot.verify(bundle)

    def test_path_escape_rejected(self):
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaises(ValueError):
                snapshot.inside(Path(tmp), '../outside')

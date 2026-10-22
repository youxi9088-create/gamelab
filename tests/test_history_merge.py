import hashlib
import json
from pathlib import Path
import sqlite3
import tempfile
import unittest
import zipfile

from tools.merge_game_history import merge


class HistoryMergeTests(unittest.TestCase):
    def test_only_unique_games_preserve_draft_and_never_import_jobs(self):
        with tempfile.TemporaryDirectory() as td:
            root = Path(td); shared = root / 'shared'
            (shared / 'data').mkdir(parents=True); (shared / 'history').mkdir()
            schema = 'CREATE TABLE records(kind TEXT,id TEXT,data TEXT,PRIMARY KEY(kind,id))'
            old = root / 'old.sqlite3'
            with sqlite3.connect(old) as db:
                db.execute(schema)
                for kind, value in [
                    ('candidates', {'id': 'unique', 'title': 'Fixture', 'url': 'https://example.org/new', 'status': 'waiting_input'}),
                    ('candidates', {'id': 'existing', 'title': 'Stale', 'url': 'https://example.org/existing'}),
                    ('candidates', {'id': 'hidden', 'title': 'Self test', 'observations': {'catalog_hidden': True}}),
                    ('versions', {'id': 'v1', 'candidate_id': 'unique', 'artifact_id': 'a1', 'status': 'draft', 'commit': 'old-commit'}),
                    ('artifacts', {'id': 'a1', 'entry': 'index.html', 'runtime_local': True}),
                    ('jobs', {'id': 'old-job', 'candidate_id': 'unique', 'status': 'queued'}),
                ]:
                    db.execute('INSERT INTO records VALUES (?,?,?)', (kind, value['id'], json.dumps(value)))
            db.close()
            with sqlite3.connect(shared / 'data/platform.sqlite3') as db:
                db.execute(schema)
                for k, v in [('settings', {'id': 'maintenance', 'draining': True}),
                             ('candidates', {'id': 'existing', 'title': 'Current', 'url': 'https://example.org/existing'})]:
                    db.execute('INSERT INTO records VALUES (?,?,?)', (k, v['id'], json.dumps(v)))
            db.close()
            archive = shared / 'history/fixture.zip'
            files = {'data/platform.sqlite3': old.read_bytes(), 'data/artifacts/a1/index.html': b'fixture',
                     'game-library/games/unique/versions/v1/index.html': b'fixture'}
            with zipfile.ZipFile(archive, 'w') as z:
                rows = []
                for name, data in files.items():
                    z.writestr(name, data); rows.append({'path': name, 'bytes': len(data), 'sha256': hashlib.sha256(data).hexdigest()})
                z.writestr('BACKUP_MANIFEST.json', json.dumps({'files': rows}))
            plan = merge(archive, shared)
            self.assertEqual([g['id'] for g in plan['games']], ['unique'])
            self.assertFalse((shared / 'data/artifacts/a1').exists())
            with sqlite3.connect(shared / 'data/platform.sqlite3') as db:
                db.execute("UPDATE records SET data=? WHERE kind='settings'", (json.dumps({'id': 'maintenance', 'draining': False}),))
            db.close()
            with self.assertRaisesRegex(ValueError, 'Pause new work'):
                merge(archive, shared, True)
            self.assertFalse((shared / 'data/artifacts/a1').exists())
            with sqlite3.connect(shared / 'data/platform.sqlite3') as db:
                db.execute("UPDATE records SET data=? WHERE kind='settings'", (json.dumps({'id': 'maintenance', 'draining': True}),))
                db.execute('INSERT INTO records VALUES (?,?,?)', ('artifacts', 'a1', json.dumps({'id': 'a1'})))
            db.close()
            with self.assertRaisesRegex(ValueError, 'Record ID collision'):
                merge(archive, shared, True)
            with sqlite3.connect(shared / 'data/platform.sqlite3') as db:
                db.execute("DELETE FROM records WHERE kind='artifacts' AND id='a1'")
            db.close()
            self.assertTrue(merge(archive, shared, True)['applied'])
            with sqlite3.connect(shared / 'data/platform.sqlite3') as db:
                values = {(k, i): json.loads(v) for k, i, v in db.execute('SELECT * FROM records')}
            db.close()
            self.assertEqual(values['candidates', 'existing']['title'], 'Current')
            self.assertEqual(values['versions', 'v1']['status'], 'draft')
            self.assertEqual(values['versions', 'v1']['preview_url'], '/runtime/a1/index.html')
            self.assertEqual(values['versions', 'v1']['history_commit'], 'old-commit')
            self.assertNotIn(('jobs', 'old-job'), values)
            self.assertEqual(merge(archive, shared, True)['games'], [])

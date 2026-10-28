import importlib.util
import json
from pathlib import Path
import sqlite3
import unittest

SPEC = importlib.util.spec_from_file_location('sync_cloud', Path(__file__).resolve().parents[1] / 'tools/sync_cloud.py')
sync = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(sync)


class Transfer:
    EXCLUDED_KINDS = set()
    ReadOnlySource = object
    @staticmethod
    def clean_record(kind, row, counts):
        return {k: v for k, v in row.items() if k != 'token'}
    @staticmethod
    def artifact_files(source, db, artifact, root):
        return [{'artifact_id': artifact}]


class SyncTests(unittest.TestCase):
    def test_mirror_scope_preserves_execution_and_cloud_identity(self):
        db = sqlite3.connect(':memory:')
        db.execute('CREATE TABLE records(kind,id,data)')
        rows = [('users', {'id': 'admin'}), ('settings', {'id': 'maintenance'}),
                ('jobs', {'id': 'job', 'status': 'running', 'token': 'private'}),
                ('versions', {'id': 'v1', 'status': 'approved', 'artifact_id': 'a1'}),
                ('versions', {'id': 'v2', 'status': 'draft', 'artifact_id': 'a2'})]
        db.executemany('INSERT INTO records VALUES (?,?,?)', [(k, r['id'], json.dumps(r)) for k, r in rows])
        records, files = sync.collect(db, Transfer, Path('.'))
        self.assertEqual([r[0] for r in records], ['jobs', 'versions', 'versions'])
        self.assertEqual(json.loads(records[0][2]), {'id': 'job', 'status': 'running'})
        self.assertEqual(files, [{'artifact_id': 'a1'}])
        self.assertEqual(db.execute('SELECT count(*) FROM records').fetchone()[0], 5)
        db.close()

    def test_digest_changes_with_content(self):
        self.assertEqual(sync.digest('same'), sync.digest('same'))
        self.assertNotEqual(sync.digest('old'), sync.digest('new'))


if __name__ == '__main__':
    unittest.main()

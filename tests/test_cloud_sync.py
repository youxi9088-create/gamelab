import importlib.util
import json
from pathlib import Path
import sqlite3
import unittest
from unittest.mock import Mock, patch
import io
import tempfile

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

    def test_rejects_mismatched_identity_before_publishing(self):
        db = sqlite3.connect(':memory:')
        db.execute('CREATE TABLE records(kind,id,data)')
        db.execute('INSERT INTO records VALUES (?,?,?)', ('jobs', 'a', '{"id":"b"}'))
        with self.assertRaisesRegex(ValueError, 'identity'):
            sync.collect(db, Transfer, Path('.'))
        db.close()

    def test_readback_checks_unchanged_records_and_rejects_missing_or_stale_data(self):
        d1 = Mock()
        records = [('jobs', 'j', '{"id":"j","status":"review"}')]
        d1.post_query.return_value = {'result': [{'results': [{'data': records[0][2]}]}]}
        sync.verify_records(d1, (), records)
        for reply in ({'result': []}, {'result': [{'results': []}]},
                      {'result': [{'results': [{'data': '{"id":"j","status":"running"}'}]}]}):
            d1.post_query.return_value = reply
            with self.assertRaises(ValueError):
                sync.verify_records(d1, (), records)

    def test_portal_get_readback_not_only_successful_upload(self):
        with tempfile.TemporaryDirectory() as folder:
            state = Path(folder)
            (state / 'portal-state-core.json').write_text('{"state_generated_at":"now"}', encoding='utf-8')
            backend = Mock()
            bodies = []
            backend.s3.put_object.side_effect = lambda **kw: bodies.append(kw['Body'])
            backend.s3.get_object.side_effect = lambda **kw: {'Body': io.BytesIO(bodies[-1])}
            with patch.object(sync.subprocess, 'run'), patch.object(sync.shutil, 'which', return_value='node'):
                receipt = sync.publish_portal(state, state, backend, 'bucket', {'records': 2})
                self.assertEqual(receipt['verification'], 'd1-records-and-r2-content')
                self.assertEqual(json.loads(bodies[-1])['sync_receipt']['records'], 2)
                backend.s3.get_object.side_effect = lambda **kw: {'Body': io.BytesIO(b'old snapshot')}
                with self.assertRaisesRegex(ValueError, 'readback'):
                    sync.publish_portal(state, state, backend, 'bucket', {'records': 2})


if __name__ == '__main__':
    unittest.main()

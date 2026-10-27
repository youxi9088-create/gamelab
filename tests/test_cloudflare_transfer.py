import ctypes
import hashlib
import io
import json
import os
import sqlite3
import stat
import tempfile
import threading
import unittest
from contextlib import closing, contextmanager, redirect_stderr, redirect_stdout
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from unittest.mock import patch

from tools import cloudflare_transfer as transfer


class PrepareTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='cf-transfer-fixture-')
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.database = self.root / 'fixture.sqlite3'
        self.artifacts = self.root / 'artifacts'
        self.artifacts.mkdir()
        self.output = self.root / 'private-export'
        with closing(sqlite3.connect(self.database)) as db, db:
            db.executescript('CREATE TABLE records(kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(kind,id));'
                             'CREATE TABLE credentials(token_hash TEXT PRIMARY KEY,tool_id TEXT NOT NULL);'
                             'CREATE TABLE idempotency(scope TEXT,key TEXT,body_hash TEXT,response TEXT);')
            db.execute('INSERT INTO credentials VALUES (?,?)', ('fixture-executor-hash', 'tool-fixture'))
            db.execute('INSERT INTO idempotency VALUES (?,?,?,?)', ('fixture', 'once', 'hash', 'fixture-response'))
        self.payloads = {'index.html': b'<html>fixture</html>', 'runtime/game.data': b'\x00\xfffixture-game',
                         'screenshots/view.png': b'fixture-image'}
        self.register_artifact('artifact-fixture', self.payloads, runtime_local=True)
        self.user_hash = 'fixture-salt:' + 'c' * 64
        self.put('users', {'id': 'user-fixture', 'username': 'fixture', 'password_hash': self.user_hash, 'role': 'admin'})
        self.put('jobs', {'id': 'job-running', 'status': 'running', 'lease_token': 'fixture-lease',
                          'lease_expires_at': 'future', 'blocker': {'code': 'OLD_FAILURE', 'reason': '旧阻断'},
                          'history': [{'status': 'failed', 'blocker': {'code': 'HISTORY_FAILURE'}, 'round': 1},
                                      {'status': 'running', 'round': 2}], 'round': 3})
        self.put('events', {'id': 'event-fixture', 'status': 'running', 'node_status': 'running',
                            'message': '历史未结束记录', 'job_id': 'job-running'})
        for status in ('approved', 'draft', 'review', 'superseded', 'published', 'running'):
            self.put('versions', {'id': 'v-' + status, 'status': status, 'artifact_id': 'artifact-fixture'})
        self.put('jobs', {'id': 'job-done', 'status': 'completed', 'lease_token': 'old-fixture-lease', 'completed_at': 'past'})
        self.put('portal_sessions', {'id': 'session-fixture', 'csrf': 'fixture-csrf'})
        self.put('auth_throttles', {'id': 'throttle-fixture', 'attempts': 4})
        self.put('tools', {'id': 'tool-fixture', 'enabled': True, 'last_seen': 'past', 'token': 'fixture-only-token'})

    def put(self, kind, row):
        with closing(sqlite3.connect(self.database)) as db, db:
            db.execute('INSERT OR REPLACE INTO records VALUES (?,?,?)',
                       (kind, row['id'], json.dumps(row, ensure_ascii=True)))

    def get(self, kind, key):
        with closing(sqlite3.connect(self.database)) as db:
            return transfer.ReadOnlySource.get(db, kind, key)

    def register_artifact(self, key, payloads, **extra):
        base = self.artifacts / key
        base.mkdir(exist_ok=True)
        aggregate = hashlib.sha256()
        for name, content in sorted(payloads.items()):
            target = base / name
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_bytes(content)
            aggregate.update(name.encode('utf-8') + b'\0' + content)
        row = {'id': key, 'files': list(payloads), 'entry': 'index.html',
               'sha256': aggregate.hexdigest(), 'size': sum(map(len, payloads.values())), **extra}
        self.put('artifacts', row)
        return row

    def export(self):
        result = transfer.prepare(self.database, self.artifacts, self.output)
        manifest = json.loads((self.output / 'manifest.json').read_text('utf-8'))
        sql = (self.output / 'private.sql').read_text('utf-8')
        return result, manifest, sql

    def imported(self, sql):
        db = sqlite3.connect(':memory:')
        self.addCleanup(db.close)
        db.executescript(sql)
        return db

    def test_actual_registered_files_and_runtime_root_only(self):
        extra = self.artifacts / 'artifact-fixture' / 'unregistered.txt'
        extra.write_bytes(b'not-authorized')
        (self.artifacts / 'artifact-fixture' / 'executor-token.txt').write_bytes(b'fixture-not-for-export')
        other = self.artifacts / 'unregistered-artifact'
        other.mkdir()
        (other / 'index.html').write_bytes(b'not-authorized')
        with patch.object(transfer.ReadOnlySource, 'get', wraps=transfer.ReadOnlySource.get) as getter:
            result, manifest, sql = self.export()
        getter.assert_called_once()
        self.assertEqual(getter.call_args.args[1:], ('artifacts', 'artifact-fixture'))
        self.assertEqual(result['files'], len(self.payloads))
        self.assertEqual(set(self.output.iterdir()), {self.output / 'private.sql', self.output / 'manifest.json'})
        self.assertTrue(manifest['private'])
        for row in manifest['files']:
            self.assertEqual(set(row), {'artifact_id', 'path', 'object_key', 'sha256', 'bytes', 'source_path'})
            self.assertEqual(Path(row['source_path']).read_bytes(), self.payloads[row['path']])
            self.assertEqual(row['sha256'], hashlib.sha256(self.payloads[row['path']]).hexdigest())
            self.assertEqual(row['object_key'], 'artifacts/artifact-fixture/' + row['path'])
        db = self.imported(sql)
        artifact = transfer.ReadOnlySource.get(db, 'artifacts', 'artifact-fixture')
        self.assertTrue(artifact['runtime_local'])
        self.assertEqual(db.execute('SELECT COUNT(*) FROM artifact_files').fetchone()[0], 3)

    def test_game_config_directories_names_and_non_private_key_assets_migrate(self):
        payloads = {**self.payloads, 'assets/config/levels.json': b'{"levels":[1,2]}',
                    'config/settings.json': b'{"volume":0.5}', 'config.json': b'{"game":"fixture"}',
                    'assets/game-config.json': b'{"difficulty":2}', 'assets/config/level.key': b'fixture-level-data'}
        self.register_artifact('artifact-game-config', payloads)
        _, manifest, sql = self.export()
        rows = {row['path']: row for row in manifest['files'] if row['artifact_id'] == 'artifact-game-config'}
        self.assertEqual(set(rows), set(payloads))
        for name, content in payloads.items():
            self.assertEqual(rows[name]['sha256'], hashlib.sha256(content).hexdigest())
            self.assertEqual(rows[name]['bytes'], len(content))
        db = self.imported(sql)
        self.assertEqual(transfer.ReadOnlySource.get(db, 'artifacts', 'artifact-game-config')['files'], list(payloads))

    def test_service_credentials_hidden_and_account_files_rejected_in_game_config(self):
        original = self.get('artifacts', 'artifact-fixture')
        for name in ('assets/config/services.json', 'config/auth.json', 'assets/config/supply-config.json',
                     'config/portal-env.json', 'assets/config/executor-token.txt', 'assets/config/credentials.json',
                     'assets/config/account.json', 'config/accounts/current.json', 'config/users.json',
                     'assets/config/.env', 'assets/config/.account/session.json', 'assets/config/server.key'):
            with self.subTest(path=name):
                target = self.artifacts / 'artifact-fixture' / name
                target.parent.mkdir(parents=True, exist_ok=True)
                target.write_bytes(b'fixture-service-credentials-not-real')
                self.put('artifacts', {**original, 'files': ['index.html', name]})
                with self.assertRaisesRegex(transfer.TransferError, '拒绝'):
                    transfer.prepare(self.database, self.artifacts, self.output)
                self.assertFalse(self.output.exists())

    def test_private_key_contents_are_not_allowed_under_game_asset_name(self):
        self.register_artifact('artifact-private-key', {**self.payloads,
            'assets/config/level.key': b'-----BEGIN PRIVATE KEY-----\nfixture-not-a-real-key\n-----END PRIVATE KEY-----'})
        with self.assertRaisesRegex(transfer.TransferError, '私钥'):
            transfer.prepare(self.database, self.artifacts, self.output)
        self.assertFalse(self.output.exists())

    def test_manifest_scope_disclaims_unlisted_runtime_git_runs_and_archives(self):
        unlisted = self.artifacts / 'artifact-fixture' / 'runtime' / 'unlisted.data'
        unlisted.write_bytes(b'fixture-unlisted-runtime')
        original = transfer.checked_open
        opened = []
        @contextmanager
        def tracked_open(path):
            opened.append(Path(path))
            with original(path) as stream:
                yield stream
        with patch.object(transfer, 'checked_open', tracked_open):
            _, manifest, _ = self.export()
        self.assertNotIn(unlisted, opened)
        self.assertNotIn('runtime/unlisted.data', [row['path'] for row in manifest['files']])
        self.assertNotIn('complete', manifest)
        self.assertEqual(manifest['scope'], 'registered-artifact-files-and-records')
        self.assertEqual(manifest['coverage']['file_selection'], 'database-registered-files-only')
        self.assertFalse(manifest['coverage']['unregistered_files_scanned'])
        self.assertEqual(set(manifest['not_included']), {'git-working-library', 'runs/checkpoints',
            'backup-archives', 'unregistered-artifact-files-including-runtime'})
        self.assertEqual(manifest['upload']['lease_contract'], 'pre-registered-artifact-copy-only')
        self.assertEqual(manifest['upload']['authorization'], {'type': 'bearer-migration-token',
            'server_binding': 'MIGRATION_UPLOAD_TOKEN', 'task_lease': False})
        self.assertTrue(manifest['upload']['requires_registered_bytes_match'])
        self.assertTrue(manifest['upload']['requires_registered_hash_match'])
        self.assertTrue(manifest['upload']['requires_immutable_object'])

    def test_snapshot_aggregate_matches_sorted_utf8_path_nul_and_raw_bytes(self):
        payloads = {'z.data': b'\xff\x00fixture', 'index.html': b'<html>fixture</html>',
                    'assets/config/中文.json': b'{"fixture":1}'}
        aggregate = hashlib.sha256()
        for name in sorted(payloads):
            aggregate.update(name.encode('utf-8') + b'\0')
            content = payloads[name]
            for offset in range(0, len(content), 3):
                aggregate.update(content[offset:offset + 3])
        artifact = self.register_artifact('artifact-aggregate', payloads)
        self.assertEqual(artifact['sha256'], aggregate.hexdigest())
        self.put('artifacts', {**artifact, 'files': list(reversed(payloads))})
        _, _, sql = self.export()
        db = self.imported(sql)
        self.assertEqual(transfer.ReadOnlySource.get(db, 'artifacts', 'artifact-aggregate')['sha256'], aggregate.hexdigest())

    def test_completed_jobs_and_discovery_history_unchanged_running_blocked(self):
        completed = {'id': 'job-completed-history', 'status': 'completed', 'completed_at': 'past',
                     'history': [{'status': 'failed', 'blocker': {'code': 'OLD_FAILURE'}}, {'status': 'running'}]}
        discovery_done = {'id': 'discovery-done', 'status': 'completed', 'completed_at': 'past',
                          'history': [{'status': 'running'}, {'status': 'failed', 'reason': 'fixture'}], 'count': 3}
        discovery_failed = {**discovery_done, 'id': 'discovery-failed', 'status': 'failed'}
        discovery_running = {**discovery_done, 'id': 'discovery-running', 'status': 'running',
                             'lease_token': 'fixture-expired-lease', 'blocker': {'code': 'OLD_BLOCKER'}}
        self.put('jobs', completed)
        for row in (discovery_done, discovery_failed, discovery_running):
            self.put('discovery_runs', row)
        _, _, sql = self.export()
        db = self.imported(sql)
        for kind, row in (('jobs', completed), ('discovery_runs', discovery_done), ('discovery_runs', discovery_failed)):
            self.assertEqual(transfer.ReadOnlySource.get(db, kind, row['id']), row)
            self.assertEqual(self.get(kind, row['id']), row)
        running = transfer.ReadOnlySource.get(db, 'discovery_runs', discovery_running['id'])
        self.assertEqual(running['status'], 'blocked')
        self.assertEqual(running['previous_status'], 'running')
        self.assertEqual(running['blocker']['code'], transfer.RECONNECT_CODE)
        self.assertEqual(running['migration']['previous_state']['blocker'], {'code': 'OLD_BLOCKER'})
        self.assertEqual(running['history'], discovery_running['history'])
        self.assertNotIn('lease_token', running)
        self.assertEqual(self.get('discovery_runs', discovery_running['id']), discovery_running)

    def test_password_legacy600k_history_and_states_are_not_upgraded(self):
        _, manifest, sql = self.export()
        db = self.imported(sql)
        self.assertEqual(transfer.ReadOnlySource.get(db, 'users', 'user-fixture')['password_hash'], self.user_hash)
        for status in ('approved', 'draft', 'review', 'superseded', 'published', 'running'):
            self.assertEqual(transfer.ReadOnlySource.get(db, 'versions', 'v-' + status)['status'], status)
        job = transfer.ReadOnlySource.get(db, 'jobs', 'job-running')
        self.assertEqual(job['status'], 'blocked')
        self.assertEqual(job['previous_status'], 'running')
        self.assertEqual(job['blocker']['code'], transfer.RECONNECT_CODE)
        self.assertEqual(job['migration']['previous_state']['blocker']['code'], 'OLD_FAILURE')
        self.assertEqual(job['history'], self.get('jobs', 'job-running')['history'])
        self.assertNotIn('lease_token', job)
        self.assertNotIn('lease_expires_at', job)
        self.assertEqual(transfer.ReadOnlySource.get(db, 'jobs', 'job-done')['status'], 'completed')
        self.assertEqual(transfer.ReadOnlySource.get(db, 'events', 'event-fixture'), self.get('events', 'event-fixture'))
        self.assertEqual(manifest['counts']['version_statuses']['draft'], 1)

    def test_transient_credentials_are_excluded_and_account_hash_remains(self):
        self.put('jobs', {'id': 'job-secret', 'status': 'failed', 'history': [{'lease_token': 'fixture-nested-lease',
                          'status': 'failed'}], 'executor_credentials': {'token': 'fixture-nested-token'}})
        _, manifest, sql = self.export()
        db = self.imported(sql)
        self.assertEqual(db.execute('SELECT COUNT(*) FROM credentials').fetchone()[0], 0)
        self.assertIsNone(transfer.ReadOnlySource.get(db, 'portal_sessions', 'session-fixture'))
        self.assertIsNone(transfer.ReadOnlySource.get(db, 'auth_throttles', 'throttle-fixture'))
        self.assertEqual(manifest['counts']['excluded_tables'], {'credentials': 1, 'idempotency': 1})
        self.assertEqual(manifest['counts']['excluded_kinds'], {'auth_throttles': 1, 'portal_sessions': 1})
        self.assertNotIn('fixture-only-token', sql)
        self.assertNotIn('fixture-nested-token', sql)
        self.assertNotIn('fixture-nested-lease', sql)
        tool = transfer.ReadOnlySource.get(db, 'tools', 'tool-fixture')
        self.assertFalse(tool['enabled'])
        self.assertTrue(tool['migration_previous_enabled'])

    def test_sql_safe_each_insert_independent_and_empty_schema_import(self):
        key = "quotes'; DROP TABLE records;--\nfixture"
        self.put("kind'fixture", {'id': key, 'message': "'\n\0中文; --", 'password_hash': self.user_hash})
        _, manifest, sql = self.export()
        db = sqlite3.connect(':memory:')
        self.addCleanup(db.close)
        db.executescript('CREATE TABLE records(kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(kind,id));'
                         'CREATE TABLE credentials(token_hash TEXT PRIMARY KEY,tool_id TEXT NOT NULL);'
                         'CREATE TABLE artifact_files(artifact_id TEXT,path TEXT,object_key TEXT UNIQUE,sha256 TEXT,bytes INTEGER,PRIMARY KEY(artifact_id,path));')
        for statement in sql.splitlines():
            db.execute(statement)
        self.assertEqual(transfer.ReadOnlySource.get(db, "kind'fixture", key)['message'], "'\n\0中文; --")
        self.assertNotIn('INSERT OR', sql)
        self.assertNotIn('ON CONFLICT', sql)
        self.assertEqual(manifest['sql']['sha256'], hashlib.sha256((self.output / 'private.sql').read_bytes()).hexdigest())
        self.assertTrue(manifest['sql']['requires_empty_target'])

    def test_nonempty_target_in_any_table_is_rejected_without_overwriting(self):
        _, _, sql = self.export()
        for target, statement in [
            ('records', "INSERT INTO records VALUES('old','old','{}')"),
            ('credentials', "INSERT INTO credentials VALUES('old','old')"),
            ('artifact_files', "INSERT INTO artifact_files VALUES('old','old','old','old',1)"),
        ]:
            with self.subTest(target=target), closing(sqlite3.connect(':memory:')) as db:
                db.executescript('\n'.join(sql.splitlines()[:3]))
                db.execute(statement)
                with self.assertRaises(sqlite3.IntegrityError):
                    db.executescript(sql)
                self.assertEqual(db.execute(f'SELECT COUNT(*) FROM {target}').fetchone()[0], 1)
                self.assertEqual(db.execute("SELECT COUNT(*) FROM records WHERE id='job-running'").fetchone()[0], 0)

    def test_output_must_be_new_outside_artifact_root_with_existing_parent(self):
        self.output.mkdir()
        sentinel = self.output / 'sentinel'
        sentinel.write_bytes(b'preserve')
        for output in (self.output, self.artifacts / 'new-output', self.root / 'missing' / 'output'):
            with self.subTest(output=output), self.assertRaises((transfer.TransferError, OSError)):
                transfer.prepare(self.database, self.artifacts, output)
        self.assertEqual(sentinel.read_bytes(), b'preserve')

    def test_missing_database_is_not_created(self):
        missing = self.root / 'missing.sqlite3'
        with self.assertRaises(OSError):
            transfer.prepare(missing, self.artifacts, self.output)
        self.assertFalse(missing.exists())
        self.assertFalse(self.output.exists())

    def test_invalid_paths_and_secret_registration_fail_closed(self):
        original = self.get('artifacts', 'artifact-fixture')
        for name in ('../outside.txt', 'runtime/../index.html', 'runtime\\game.data', '/outside',
                     '.env', 'config/services.json', 'secret.txt', 'executor-token.txt', 'auth.json',
                     'runtime//game.data', 'runtime/./game.data', 'runtime/game.data/', 'a%2fb', 'x\nfile'):
            with self.subTest(name=name):
                self.put('artifacts', {**original, 'files': ['index.html', name]})
                with self.assertRaises(transfer.TransferError):
                    transfer.prepare(self.database, self.artifacts, self.output)
                self.assertFalse(self.output.exists())

    def test_directory_missing_entry_duplicate_and_missing_file_fail(self):
        original = self.get('artifacts', 'artifact-fixture')
        for files, entry in [(['index.html', 'runtime'], 'index.html'), (['index.html', 'missing.js'], 'index.html'),
                             (['index.html', 'index.html'], 'index.html'), (['index.html'], 'missing.html'),
                             (['index.html', 'INDEX.html'], 'index.html'), ([], 'index.html')]:
            with self.subTest(files=files), self.assertRaises((transfer.TransferError, OSError)):
                self.put('artifacts', {**original, 'files': files, 'entry': entry})
                transfer.prepare(self.database, self.artifacts, self.output)
            self.assertFalse(self.output.exists())

    def test_artifact_hash_mismatch_is_not_silently_skipped(self):
        artifact = self.get('artifacts', 'artifact-fixture')
        self.put('artifacts', {**artifact, 'sha256': '0' * 64})
        with self.assertRaisesRegex(transfer.TransferError, 'SHA-256'):
            transfer.prepare(self.database, self.artifacts, self.output)
        self.assertFalse(self.output.exists())

    def test_per_file_metadata_hash_and_bytes_when_present(self):
        artifact = self.get('artifacts', 'artifact-fixture')
        metadata = {name: {'sha256': hashlib.sha256(content).hexdigest(), 'bytes': len(content)}
                    for name, content in self.payloads.items()}
        self.put('artifacts', {**artifact, 'files': metadata})
        self.export()
        metadata['index.html']['sha256'] = '0' * 64
        self.put('artifacts', {**artifact, 'files': metadata})
        with self.assertRaisesRegex(transfer.TransferError, 'SHA-256'):
            transfer.prepare(self.database, self.artifacts, self.root / 'mismatch')
        metadata['index.html']['sha256'] = hashlib.sha256(self.payloads['index.html']).hexdigest()
        metadata['index.html']['bytes'] = 1
        self.put('artifacts', {**artifact, 'files': metadata})
        with self.assertRaisesRegex(transfer.TransferError, '大小'):
            transfer.prepare(self.database, self.artifacts, self.root / 'bad-size')

    def test_list_of_per_file_metadata_and_missing_optional_hash(self):
        artifact = self.get('artifacts', 'artifact-fixture')
        artifact.pop('sha256')
        artifact['files'] = [{'path': name, 'sha256': hashlib.sha256(content).hexdigest()}
                             for name, content in self.payloads.items()]
        self.put('artifacts', artifact)
        _, manifest, _ = self.export()
        self.assertEqual(len(manifest['files']), 3)

    def test_symlink_file_and_ancestor_rejected(self):
        target = self.artifacts / 'artifact-fixture' / 'index.html'
        outside = self.root / 'outside.html'
        outside.write_bytes(b'fixture-outside')
        target.unlink()
        try:
            target.symlink_to(outside)
        except OSError:
            self.skipTest('当前隔离身份无法创建符号链接')
        with self.assertRaisesRegex(transfer.TransferError, '链接'):
            transfer.prepare(self.database, self.artifacts, self.output)
        self.assertFalse(self.output.exists())

    def test_reparse_point_detection_on_all_ancestors(self):
        original = Path.lstat
        root = self.artifacts
        def lstat(path):
            info = original(path)
            if path == root:
                class Reparse:
                    st_mode = info.st_mode
                    st_file_attributes = 0x400
                return Reparse()
            return info
        with patch.object(Path, 'lstat', lstat), self.assertRaisesRegex(transfer.TransferError, 'Junction'):
            transfer.prepare(self.database, self.artifacts, self.output)
        self.assertFalse(self.output.exists())

    def test_readonly_transaction_snapshot_includes_wal_not_later_write(self):
        writer = sqlite3.connect(self.database, isolation_level=None)
        self.addCleanup(writer.close)
        writer.execute('PRAGMA journal_mode=WAL')
        self.put('jobs', {'id': 'wal-before', 'status': 'failed'})
        original_get = transfer.ReadOnlySource.get
        original_connect = sqlite3.connect
        connections = []
        traces = []
        def connect(*args, **kwargs):
            connections.append((args, kwargs))
            db = original_connect(*args, **kwargs)
            db.set_trace_callback(traces.append)
            return db
        def get(db, kind, key):
            writer.execute('INSERT INTO records VALUES(?,?,?)', ('jobs', 'wal-later', json.dumps({'id': 'wal-later', 'status': 'completed'})))
            with self.assertRaises(sqlite3.OperationalError):
                db.execute("INSERT INTO records VALUES('x','x','{}')")
            return original_get(db, kind, key)
        with patch.object(transfer.sqlite3, 'connect', connect), patch.object(transfer.ReadOnlySource, 'get', staticmethod(get)):
            _, manifest, sql = self.export()
        self.assertEqual(len(connections), 1)
        self.assertIn('?mode=ro', connections[0][0][0])
        self.assertTrue(connections[0][1]['uri'])
        self.assertIn('BEGIN', traces)
        self.assertIn('ROLLBACK', traces)
        db = self.imported(sql)
        self.assertIsNotNone(transfer.ReadOnlySource.get(db, 'jobs', 'wal-before'))
        self.assertIsNone(transfer.ReadOnlySource.get(db, 'jobs', 'wal-later'))
        self.assertEqual(manifest['counts']['source_kinds']['jobs'], 3)

    def test_original_record_order_and_history_are_preserved(self):
        for key in ('z-first', 'a-later', 'm-last'):
            self.put('events', {'id': key, 'node_status': 'failed', 'message': key})
        with closing(sqlite3.connect(self.database)) as source:
            original = source.execute("SELECT id FROM records WHERE kind='events' ORDER BY rowid DESC").fetchall()
        _, _, sql = self.export()
        db = self.imported(sql)
        self.assertEqual(db.execute("SELECT id FROM records WHERE kind='events' ORDER BY rowid DESC").fetchall(), original)

    def test_source_logical_hash_and_database_unchanged(self):
        before = self.database.read_bytes()
        expected = hashlib.sha256()
        with closing(sqlite3.connect(self.database)) as db:
            for row in db.execute('SELECT kind,id,data FROM records ORDER BY kind,id'):
                for value in row:
                    data = value.encode('utf-8')
                    expected.update(len(data).to_bytes(8, 'big') + data)
        _, manifest, _ = self.export()
        self.assertEqual(manifest['source']['sha256'], expected.hexdigest())
        self.assertEqual(self.database.read_bytes(), before)

    def test_cli_summary_never_echoes_password_or_private_paths(self):
        stdout, stderr = io.StringIO(), io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            code = transfer.main(['prepare', '--database', str(self.database), '--artifacts', str(self.artifacts), '--output', str(self.output)])
        self.assertEqual(code, 0)
        result = json.loads(stdout.getvalue())
        self.assertTrue(all(type(value) is int for value in result.values()))
        self.assertNotIn(self.user_hash, stdout.getvalue() + stderr.getvalue())
        self.assertNotIn(str(self.database), stdout.getvalue() + stderr.getvalue())

    @unittest.skipIf(os.name == 'nt', 'POSIX 文件模式仅适用于 POSIX')
    def test_posix_private_permissions(self):
        self.export()
        self.assertEqual(stat.S_IMODE(self.output.stat().st_mode), 0o700)
        for file in self.output.iterdir():
            self.assertEqual(stat.S_IMODE(file.stat().st_mode), 0o600)

    @unittest.skipUnless(os.name == 'nt', 'Windows 私密 ACL 仅适用于 Windows')
    def test_windows_private_acl_is_protected_and_single_principal(self):
        from ctypes import wintypes as w
        self.export()
        adv = ctypes.WinDLL('advapi32', use_last_error=True)
        kernel = ctypes.WinDLL('kernel32', use_last_error=True)
        adv.GetFileSecurityW.argtypes = [w.LPCWSTR, w.DWORD, w.LPVOID, w.DWORD, ctypes.POINTER(w.DWORD)]
        adv.ConvertSecurityDescriptorToStringSecurityDescriptorW.argtypes = [w.LPVOID, w.DWORD, w.DWORD, ctypes.POINTER(w.LPWSTR), ctypes.POINTER(w.DWORD)]
        kernel.LocalFree.argtypes = [w.LPVOID]
        kernel.LocalFree.restype = w.LPVOID
        for file in (self.output, self.output / 'private.sql', self.output / 'manifest.json'):
            needed = w.DWORD()
            adv.GetFileSecurityW(str(file), 4, None, 0, ctypes.byref(needed))
            buffer = ctypes.create_string_buffer(needed.value)
            self.assertTrue(adv.GetFileSecurityW(str(file), 4, buffer, needed, ctypes.byref(needed)))
            sddl = w.LPWSTR()
            try:
                self.assertTrue(adv.ConvertSecurityDescriptorToStringSecurityDescriptorW(buffer, 1, 4, ctypes.byref(sddl), None))
                value = sddl.value
                if file == self.output:
                    self.assertTrue(value.startswith('D:P'), value)
                self.assertEqual(value.count('(A;'), 1, value)
                self.assertNotIn(';;;WD)', value)
                self.assertNotIn(';;;BU)', value)
            finally:
                if sddl:
                    kernel.LocalFree(ctypes.cast(sddl, w.LPVOID))

    def test_corrupt_json_error_redacted_by_cli(self):
        with closing(sqlite3.connect(self.database)) as db, db:
            db.execute("UPDATE records SET data=? WHERE kind='users'", ('fixture-private-broken-json',))
        stdout, stderr = io.StringIO(), io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            code = transfer.main(['prepare', '--database', str(self.database), '--artifacts', str(self.artifacts), '--output', str(self.output)])
        self.assertEqual(code, 1)
        self.assertNotIn('fixture-private-broken-json', stdout.getvalue() + stderr.getvalue())
        self.assertFalse(self.output.exists())


class UploadTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix='cf-upload-fixture-')
        self.addCleanup(self.temp.cleanup)
        root = Path(self.temp.name)
        self.file = root / 'fixture.data'
        self.payload = b'fixture-payload\x00\xff' * 50
        self.file.write_bytes(self.payload)
        self.token = root / 'bearer.txt'
        self.token.write_text('fixture-private-token\n', encoding='ascii')
        self.requests = []
        self.statuses = [201]
        owner = self
        class Handler(BaseHTTPRequestHandler):
            def do_PUT(self):
                body = self.rfile.read(int(self.headers['Content-Length']))
                owner.requests.append((self.path, dict(self.headers), body))
                status = owner.statuses[min(len(owner.requests) - 1, len(owner.statuses) - 1)]
                try:
                    self.send_response(status)
                    self.send_header('Content-Length', str(len(b'fixture-private-token')))
                    if status == 302:
                        self.send_header('Location', '/fixture-private-token')
                    self.end_headers()
                    self.wfile.write(b'fixture-private-token')
                except (BrokenPipeError, ConnectionResetError, ConnectionAbortedError):
                    # 文件变更夹具要求客户端中止，回环服务器不得回显断连堆栈。
                    pass
            def log_message(self, *args):
                pass
        self.server = ThreadingHTTPServer(('127.0.0.1', 0), Handler)
        thread = threading.Thread(target=self.server.serve_forever, daemon=True)
        thread.start()
        def stop():
            self.server.shutdown()
            self.server.server_close()
            thread.join(timeout=3)
        self.addCleanup(stop)
        self.url = f'http://127.0.0.1:{self.server.server_port}'

    def upload(self, **kwargs):
        return transfer.upload_file(self.url, 'artifact-fixture', 'runtime/中文 file.data', self.file, self.token,
                                    allow_loopback=True, **kwargs)

    def test_fixture_put_path_sha_length_bearer_and_stable_object_key(self):
        result = self.upload()
        self.assertEqual(result, {'files': 1, 'bytes': len(self.payload), 'attempts': 1})
        path, headers, body = self.requests[0]
        self.assertEqual(path, '/api/executor/artifacts/artifact-fixture/files/runtime/%E4%B8%AD%E6%96%87%20file.data')
        self.assertEqual(body, self.payload)
        self.assertEqual(headers['Authorization'], 'Bearer fixture-private-token')
        self.assertEqual(headers['Content-Length'], str(len(body)))
        self.assertEqual(headers['X-Content-SHA256'], hashlib.sha256(body).hexdigest())
        self.assertEqual(headers['X-Object-Key'], 'artifacts/artifact-fixture/runtime/%E4%B8%AD%E6%96%87%20file.data')

    def test_http_requires_explicit_loopback_optin(self):
        with self.assertRaisesRegex(transfer.TransferError, 'HTTPS'):
            transfer.upload_file(self.url, 'artifact-fixture', 'index.html', self.file, self.token)
        self.assertEqual(self.requests, [])
        for bad in ('http://example.invalid', 'http://192.168.1.1', 'http://127.0.0.1.example.invalid', 'http://2130706433'):
            with self.subTest(url=bad), self.assertRaises(transfer.TransferError):
                transfer.upload_target(bad, 'artifact-fixture', 'index.html', allow_loopback=True)
        for good in ('http://127.0.0.1', 'http://localhost', 'http://[::1]'):
            self.assertEqual(transfer.upload_target(good, 'artifact-fixture', 'index.html', True)[0], 'http')
        self.assertEqual(transfer.upload_target('https://example.invalid', 'artifact-fixture', 'index.html')[0], 'https')

    def test_invalid_url_credentials_queries_and_path_injection(self):
        for bad in ('https://fixture:token@example.invalid', 'https://example.invalid?token=fixture',
                    'https://example.invalid/path', 'https://example.invalid/#token', 'ftp://example.invalid',
                    'https://example.invalid:bad', 'https://example.invalid\n', 'https://example.invalid\\x'):
            with self.subTest(url=bad), self.assertRaises(transfer.TransferError):
                transfer.upload_target(bad, 'artifact-fixture', 'index.html', True)
        for bad in ('../index.html', 'a\\index.html', 'x%2findex.html', 'secret.txt'):
            with self.subTest(path=bad), self.assertRaises(transfer.TransferError):
                transfer.upload_target(self.url, 'artifact-fixture', bad, True)
        with self.assertRaises(transfer.TransferError):
            transfer.upload_target(self.url, '../artifact', 'index.html', True)

    def test_oversize_explicit_failure_before_token_or_network(self):
        with self.file.open('wb') as stream:
            stream.truncate(transfer.MAX_UPLOAD_BYTES + 1)
        with patch.object(transfer, 'read_token') as reader, self.assertRaisesRegex(transfer.TransferError, '64 MiB'):
            self.upload()
        reader.assert_not_called()
        self.assertEqual(self.requests, [])

    def test_exact_limit_allowed_with_bounded_reads(self):
        self.file.write_bytes(b'x' * (2 * transfer.CHUNK_BYTES + 7))
        original = transfer.checked_open
        reads = []
        @contextmanager
        def checked_open(path):
            with original(path) as stream:
                class Bounded:
                    def read(inner, size=-1):
                        self.assertGreaterEqual(size, 0)
                        self.assertLessEqual(size, transfer.CHUNK_BYTES)
                        reads.append(size)
                        return stream.read(size)
                    def seek(inner, offset):
                        return stream.seek(offset)
                yield Bounded()
        with patch.object(transfer, 'MAX_UPLOAD_BYTES', self.file.stat().st_size), patch.object(transfer, 'checked_open', checked_open):
            result = self.upload()
        self.assertEqual(result['bytes'], self.file.stat().st_size)
        self.assertGreater(len(reads), 6)

    def test_retry_once_same_idempotency_key_and_bytes(self):
        self.statuses = [503, 201]
        self.assertEqual(self.upload()['attempts'], 2)
        self.assertEqual(len(self.requests), 2)
        self.assertEqual(self.requests[0][1]['Idempotency-Key'], self.requests[1][1]['Idempotency-Key'])
        self.assertEqual(self.requests[0][1]['X-Object-Key'], self.requests[1][1]['X-Object-Key'])
        self.assertEqual(self.requests[0][2], self.requests[1][2])

    def test_repeated_failure_stops_after_one_retry(self):
        self.statuses = [503]
        with self.assertRaisesRegex(transfer.TransferError, 'HTTP 503'):
            self.upload()
        self.assertEqual(len(self.requests), 2)

    def test_redirect_auth_and_conflict_not_retried_or_echoed(self):
        for status in (302, 401, 403, 409):
            with self.subTest(status=status):
                self.requests.clear()
                self.statuses = [status]
                with self.assertRaisesRegex(transfer.TransferError, str(status)) as caught:
                    self.upload()
                self.assertEqual(len(self.requests), 1)
                self.assertNotIn('fixture-private-token', str(caught.exception))

    def test_invalid_token_is_not_sent_or_echoed(self):
        for token in ('', 'fixture\r\nInjected: header', 'Bearer fixture', 'x' * 8193, '中文'):
            with self.subTest(token_length=len(token)):
                self.token.write_text(token, encoding='utf-8')
                with self.assertRaises(transfer.TransferError) as caught:
                    self.upload()
                if token:
                    self.assertNotIn(token, str(caught.exception))
        self.assertEqual(self.requests, [])

    def test_cli_rejects_token_argument_without_echoing_value(self):
        stdout, stderr = io.StringIO(), io.StringIO()
        args = ['upload-file', '--url', self.url, '--artifact-id', 'artifact-fixture', '--path', 'index.html',
                '--file', str(self.file), '--token-file', str(self.token), '--token', 'fixture-private-token']
        with redirect_stdout(stdout), redirect_stderr(stderr), self.assertRaises(SystemExit):
            transfer.main(args)
        self.assertNotIn('fixture-private-token', stdout.getvalue() + stderr.getvalue())
        self.assertEqual(self.requests, [])

    def test_token_file_and_private_sql_are_never_uploaded(self):
        private_sql = self.file.with_name('private.sql')
        private_sql.write_bytes(b'fixture-private-records')
        manifest = self.file.with_name('manifest.json')
        manifest.write_text('{"private":true}', encoding='utf-8')
        for file in (self.token, private_sql, manifest):
            with self.subTest(file=file), self.assertRaisesRegex(transfer.TransferError, '私密数据库|令牌文件'):
                transfer.upload_file(self.url, 'artifact-fixture', 'index.html', file, self.token, allow_loopback=True)
        self.assertEqual(self.requests, [])

    def test_cli_success_and_server_echo_are_redacted(self):
        args = ['upload-file', '--url', self.url, '--artifact-id', 'artifact-fixture', '--path', 'index.html',
                '--file', str(self.file), '--token-file', str(self.token), '--allow-loopback']
        stdout, stderr = io.StringIO(), io.StringIO()
        with redirect_stdout(stdout), redirect_stderr(stderr):
            code = transfer.main(args)
        self.assertEqual(code, 0)
        self.assertEqual(json.loads(stdout.getvalue())['files'], 1)
        self.assertNotIn('fixture-private-token', stdout.getvalue() + stderr.getvalue())

    def test_secret_source_file_name_and_directory_rejected(self):
        secret_file = self.file.with_name('executor-token.txt')
        secret_file.write_bytes(b'fixture-not-for-upload')
        for file in (secret_file, self.file.parent):
            with self.subTest(file=file), self.assertRaises(transfer.TransferError):
                transfer.upload_file(self.url, 'artifact-fixture', 'index.html', file, self.token, allow_loopback=True)
        self.assertEqual(self.requests, [])

    def test_file_change_after_hash_never_reports_success(self):
        original_hash = transfer.hash_stream
        def hash_stream(stream, aggregate=None):
            result = original_hash(stream, aggregate)
            self.file.write_bytes(b'x' * len(self.payload))
            return result
        with patch.object(transfer, 'hash_stream', hash_stream), self.assertRaisesRegex(transfer.TransferError, '变化'):
            self.upload()

    def test_game_config_file_upload_uses_migration_bearer_not_task_lease(self):
        self.file = self.file.with_name('game-config.json')
        self.file.write_bytes(b'{"game":"fixture"}')
        result = transfer.upload_file(self.url, 'artifact-fixture', 'assets/config/game-config.json',
                                      self.file, self.token, allow_loopback=True)
        self.assertEqual(result['files'], 1)
        path, headers, body = self.requests[0]
        self.assertEqual(path, '/api/executor/artifacts/artifact-fixture/files/assets/config/game-config.json')
        self.assertEqual(headers['Authorization'], 'Bearer fixture-private-token')
        self.assertFalse(any('lease' in name.lower() for name in headers))
        self.assertEqual(headers['X-Content-SHA256'], hashlib.sha256(body).hexdigest())

    def test_http_success_checks_open_context_exit_before_return(self):
        original = transfer.checked_open
        events = []
        @contextmanager
        def checked_open(path):
            with original(path) as stream:
                yield stream
            if Path(path) == self.file:
                events.append('file-exit-validated')
        with patch.object(transfer, 'checked_open', checked_open):
            result = self.upload()
            events.append('success-returned')
        self.assertEqual(result['files'], 1)
        self.assertEqual(events, ['file-exit-validated', 'success-returned'])

    def test_exit_validation_error_after_http_success_prevents_success(self):
        original = transfer.checked_open
        @contextmanager
        def checked_open(path):
            with original(path) as stream:
                yield stream
            if Path(path) == self.file:
                raise transfer.TransferError('退出校验失败，拒绝认定成功')
        with patch.object(transfer, 'checked_open', checked_open), self.assertRaisesRegex(transfer.TransferError, '退出校验'):
            self.upload()
        self.assertEqual(len(self.requests), 1)
        self.assertEqual(self.requests[0][2], self.payload)

    def test_file_change_after_http_success_fails_real_exit_check_without_cli_summary(self):
        original_response = transfer.http.client.HTTPConnection.getresponse
        def changed_response(connection):
            response = original_response(connection)
            self.assertEqual(response.status, 201)
            before = self.file.stat()
            self.file.write_bytes(b'x' * len(self.payload))
            os.utime(self.file, ns=(before.st_atime_ns, before.st_mtime_ns + 2_000_000_000))
            return response
        stdout, stderr = io.StringIO(), io.StringIO()
        args = ['upload-file', '--url', self.url, '--artifact-id', 'artifact-fixture', '--path', 'index.html',
                '--file', str(self.file), '--token-file', str(self.token), '--allow-loopback']
        with patch.object(transfer.http.client.HTTPConnection, 'getresponse', changed_response), redirect_stdout(stdout), redirect_stderr(stderr):
            code = transfer.main(args)
        self.assertEqual(code, 1)
        self.assertEqual(stdout.getvalue(), '')
        self.assertIn('读取期间文件变化', stderr.getvalue())
        self.assertEqual(len(self.requests), 1)
        self.assertEqual(self.requests[0][2], self.payload)
        self.assertNotIn('fixture-private-token', stderr.getvalue())

    def test_upload_help_documents_independent_migration_token_and_loopback(self):
        stdout = io.StringIO()
        with redirect_stdout(stdout), self.assertRaises(SystemExit) as caught:
            transfer.main(['upload-file', '--help'])
        self.assertEqual(caught.exception.code, 0)
        self.assertIn('MIGRATION_UPLOAD_TOKEN', stdout.getvalue())
        self.assertIn('不使用任务租约', stdout.getvalue())
        self.assertIn('--allow-loopback', stdout.getvalue())
        self.assertNotIn('pending-main-integration', stdout.getvalue())

    def test_network_failure_retry_bound_without_raw_exception(self):
        with patch.object(transfer.http.client.HTTPConnection, 'endheaders', side_effect=OSError('fixture-private-token')) as request:
            with self.assertRaises(transfer.TransferError) as caught:
                self.upload()
        self.assertEqual(request.call_count, 2)
        self.assertNotIn('fixture-private-token', str(caught.exception))


if __name__ == '__main__':
    unittest.main()

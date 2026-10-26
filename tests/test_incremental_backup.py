import json
import sqlite3
import tempfile
import unittest
import zipfile
from contextlib import closing
from pathlib import Path
from unittest.mock import patch

from tools.production_data import backup, backup_capacity, restore, verify


class IncrementalBackupTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name) / 'shared'
        (self.root / 'data').mkdir(parents=True)
        with closing(sqlite3.connect(self.root / 'data/platform.sqlite3')) as db, db:
            db.execute('CREATE TABLE records(kind TEXT, data TEXT)')
            db.execute('INSERT INTO records VALUES (?,?)', ('settings', json.dumps({'id': 'maintenance', 'draining': True})))
        (self.root / 'game.bin').write_bytes(b'unchanged-game' * 10000)
        (self.root / 'edit.txt').write_text('old')
        (self.root / 'deleted.txt').write_text('deleted')
        self.base = Path(self.temp.name) / 'base.zip'
        backup(self.root, self.base)

    def tearDown(self):
        self.temp.cleanup()

    def test_delta_contains_only_changes_and_restores_latest_snapshot(self):
        (self.root / 'edit.txt').write_text('new')
        (self.root / 'deleted.txt').unlink()
        (self.root / 'added.txt').write_text('added')
        delta = self.base.with_name('delta.zip')
        result = backup(self.root, delta)
        self.assertEqual(result['mode'], 'incremental')
        with zipfile.ZipFile(delta) as z:
            self.assertNotIn('game.bin', z.namelist())
            self.assertNotIn('deleted.txt', z.namelist())
            self.assertIn('edit.txt', z.namelist())
        manifest = verify(delta)
        self.assertEqual(manifest['deleted'], ['deleted.txt'])
        restored = self.root.parent / 'restored'
        restore(delta, restored)
        self.assertEqual((restored / 'game.bin').read_bytes(), (self.root / 'game.bin').read_bytes())
        self.assertEqual((restored / 'edit.txt').read_text(), 'new')
        self.assertEqual((restored / 'added.txt').read_text(), 'added')
        self.assertFalse((restored / 'deleted.txt').exists())
        with closing(sqlite3.connect(restored / 'data/platform.sqlite3')) as db:
            self.assertEqual(db.execute('PRAGMA integrity_check').fetchone()[0], 'ok')

    def test_latest_delta_does_not_depend_on_previous_delta(self):
        (self.root / 'edit.txt').write_text('changed')
        first = self.base.with_name('first.zip')
        backup(self.root, first)
        (self.root / 'next.txt').write_text('next')
        second = self.base.with_name('second.zip')
        backup(self.root, second)
        first.unlink()
        manifest = verify(second)
        self.assertEqual(manifest['base']['name'], self.base.name)
        restored = self.root.parent / 'restored'
        restore(second, restored)
        self.assertEqual((restored / 'edit.txt').read_text(), 'changed')
        self.assertEqual((restored / 'next.txt').read_text(), 'next')

    def test_corrupt_or_missing_base_never_falls_back_to_full(self):
        delta = self.base.with_name('delta.zip')
        backup(self.root, delta)
        with self.base.open('ab') as stream:
            stream.write(b'corruption')
        with self.assertRaisesRegex(ValueError, '摘要不匹配'):
            verify(delta)
        with self.assertRaisesRegex(ValueError, '摘要不匹配'):
            backup(self.root, self.base.with_name('next.zip'))
        self.base.unlink()
        with self.assertRaises(FileNotFoundError):
            backup(self.root, self.base.with_name('next.zip'))

    def test_capacity_counts_changes_not_unchanged_game_resources(self):
        result = backup_capacity(self.root, self.root.parent)
        self.assertEqual(result['mode'], 'incremental')
        self.assertLess(result['source_bytes'], (self.root / 'game.bin').stat().st_size)

    def test_failed_delta_does_not_replace_last_verified_status(self):
        before = (self.root / 'backup-status.json').read_bytes()
        with patch('tools.production_data.verify', side_effect=ValueError('test failure')):
            with self.assertRaises(ValueError):
                backup(self.root, self.base.with_name('failed.zip'))
        self.assertEqual((self.root / 'backup-status.json').read_bytes(), before)

    def test_unsafe_base_path_is_rejected(self):
        delta = self.base.with_name('delta.zip')
        backup(self.root, delta)
        with zipfile.ZipFile(delta) as z:
            entries = {name: z.read(name) for name in z.namelist()}
        original = json.loads(entries['BACKUP_MANIFEST.json'])
        for bad in ('../base.zip', 'C:\\base.zip'):
            manifest = {**original, 'base': {**original['base'], 'name': bad}}
            with zipfile.ZipFile(delta, 'w') as z:
                for name, value in entries.items():
                    z.writestr(name, json.dumps(manifest) if name == 'BACKUP_MANIFEST.json' else value)
            with self.assertRaises(ValueError):
                verify(delta)

    def test_changed_file_cannot_be_falsely_inherited_from_base(self):
        (self.root / 'edit.txt').write_text('new')
        delta = self.base.with_name('delta.zip')
        backup(self.root, delta)
        with zipfile.ZipFile(delta) as z:
            entries = {name: z.read(name) for name in z.namelist()}
        manifest = json.loads(entries.pop('BACKUP_MANIFEST.json'))
        manifest['changed'].remove('edit.txt')
        entries.pop('edit.txt')
        with zipfile.ZipFile(delta, 'w') as z:
            for name, value in entries.items():z.writestr(name, value)
            z.writestr('BACKUP_MANIFEST.json', json.dumps(manifest))
        with self.assertRaisesRegex(ValueError, '缺少变化文件'):
            verify(delta)


if __name__ == '__main__':
    unittest.main()

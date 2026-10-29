import tempfile
import time
import unittest
from pathlib import Path

from controlplane import store as store_module
from controlplane.store import Store


class SlowWriteTransactionTests(unittest.TestCase):
    """A write transaction holds BEGIN IMMEDIATE, so a slow one starves every
    other writer and surfaces as "database is locked". It must be observable."""

    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.root = Path(self.tmp.name)
        self.threshold = store_module.SLOW_TX_SECONDS
        store_module.SLOW_TX_SECONDS = 0.0
        self.addCleanup(setattr, store_module, 'SLOW_TX_SECONDS', self.threshold)

    def _log(self):
        target = self.root / store_module.SLOW_TX_LOG
        return target.read_text(encoding='utf-8') if target.is_file() else ''

    def test_slow_write_is_recorded_with_the_calling_frame(self):
        def handler(s):
            with s.tx() as db:
                db.execute("INSERT INTO records VALUES ('k','i','{}')")
                time.sleep(0.05)
        handler(Store(self.root / 't.sqlite3'))
        text = self._log()
        self.assertIn('write tx', text)
        self.assertIn('handler', text)

    def test_fast_write_is_not_recorded(self):
        store_module.SLOW_TX_SECONDS = 30
        with Store(self.root / 't.sqlite3').tx() as db:
            db.execute("INSERT INTO records VALUES ('k','i','{}')")
        self.assertEqual(self._log(), '')

    def test_logging_failure_never_breaks_the_transaction(self):
        original = store_module.SLOW_TX_LOG
        store_module.SLOW_TX_LOG = 'no/such/directory/slow-tx.log'
        self.addCleanup(setattr, store_module, 'SLOW_TX_LOG', original)
        with Store(self.root / 't.sqlite3').tx() as db:
            db.execute("INSERT INTO records VALUES ('k','i','{}')")
        self.assertEqual(self._log(), '')


if __name__ == '__main__':
    unittest.main()

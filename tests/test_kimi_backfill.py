import contextlib
import io
import json
import sqlite3
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch
from tools import backfill_kimi_pricing as backfill


class KimiBackfillTests(unittest.TestCase):
    def test_missing_price_row_is_created_and_known_cost_untouched(self):
        with tempfile.TemporaryDirectory() as tmp:
            db=Path(tmp)/'platform.sqlite3'
            con=sqlite3.connect(db)
            con.execute('CREATE TABLE records(kind TEXT,id TEXT,data TEXT,PRIMARY KEY(kind,id))')
            base=dict(provider='api',model='kimi-k2.7-code',input_tokens=1000000,output_tokens=100000,cached_input_tokens=200000,cache_write_tokens=None,estimated_cost=None)
            for key,extra in [('new',{}),('known',{'estimated_cost':99}),('unknown',{'cached_input_tokens':None})]:
                con.execute('INSERT INTO records VALUES(?,?,?)',('ai_usage',key,json.dumps({**base,**extra})))
            con.commit();con.close()
            with patch.object(backfill,'DB',db),patch('sys.argv',['backfill','--apply']),contextlib.redirect_stdout(io.StringIO()):backfill.main()
            con=sqlite3.connect(db)
            rows={key:json.loads(value) for key,value in con.execute('SELECT id,data FROM records')};con.close()
            self.assertIn(backfill.KIMI_KEY,rows['ai_pricing']['rates'])
            self.assertAlmostEqual(rows['new']['estimated_cost'],8.16)
            self.assertEqual(rows['new']['pricing'],backfill.KIMI_RATE)
            self.assertEqual(rows['known']['estimated_cost'],99)
            self.assertIsNone(rows['unknown']['estimated_cost'])
            self.assertTrue(list(Path(tmp).glob('*.bak-*')))

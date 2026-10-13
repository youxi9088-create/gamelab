"""Transactional store. One SQLite transaction owns each lease/state transition."""
import contextlib
import json
import sqlite3
import uuid
from datetime import datetime, timezone, timedelta
from pathlib import Path

def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')

def ident(prefix):
    return prefix + '-' + uuid.uuid4().hex[:12]

def later(seconds=300):
    return (datetime.now(timezone.utc) + timedelta(seconds=seconds)).isoformat(timespec='seconds')

class Store:
    def __init__(self, path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        with self.tx() as db:
            db.execute('CREATE TABLE IF NOT EXISTS records (kind TEXT NOT NULL,id TEXT NOT NULL,data TEXT NOT NULL,PRIMARY KEY(kind,id))')
            db.execute('CREATE TABLE IF NOT EXISTS idempotency (scope TEXT NOT NULL,key TEXT NOT NULL,body_hash TEXT NOT NULL,response TEXT NOT NULL,PRIMARY KEY(scope,key))')
            db.execute('CREATE TABLE IF NOT EXISTS credentials (token_hash TEXT PRIMARY KEY,tool_id TEXT NOT NULL)')

    @contextlib.contextmanager
    def tx(self):
        db = sqlite3.connect(self.path, timeout=30)
        db.execute('PRAGMA journal_mode=WAL')
        db.execute('BEGIN IMMEDIATE')
        try:
            yield db
            db.commit()
        except Exception:
            db.rollback()
            raise
        finally:
            db.close()

    @staticmethod
    def get(db, kind, key):
        row = db.execute('SELECT data FROM records WHERE kind=? AND id=?', (kind,key)).fetchone()
        return json.loads(row[0]) if row else None

    @staticmethod
    def all(db, kind):
        return [json.loads(row[0]) for row in db.execute('SELECT data FROM records WHERE kind=? ORDER BY rowid DESC', (kind,))]

    @staticmethod
    def put(db, kind, value):
        db.execute('INSERT INTO records VALUES (?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data', (kind,value['id'],json.dumps(value,ensure_ascii=False)))
        return value

    def event(self, db, message, job_id=None, stage='', **extra):
        return self.put(db,'events',dict(id=ident('ev'),message=message,job_id=job_id,stage=stage,created_at=now(),**extra))

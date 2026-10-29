"""Transactional store. One SQLite transaction owns each lease/state transition."""
import contextlib
import json
import os
import sqlite3
import time
import traceback
import uuid
from contextvars import ContextVar
from datetime import datetime, timezone, timedelta
from pathlib import Path

ACTOR=ContextVar('request_actor',default=None)
# A write transaction holds BEGIN IMMEDIATE, so every other writer in the
# process queues behind it. Anything past this threshold is what turns into
# "database is locked" for heartbeats, so record where it happened.
SLOW_TX_SECONDS=float(os.getenv('DOOR_SLOW_TX_SECONDS','2'))
SLOW_TX_LOG='slow-tx.log'
# Plumbing frames tell us nothing; everything else points at the handler.
_IGNORED_FRAMES=('store.py','contextlib','importlib')

def now():
    return datetime.now(timezone.utc).isoformat(timespec='seconds')


def _log_slow_write(elapsed, path):
    """Best effort: diagnostics must never turn a slow request into a failed one."""
    try:
        frames = [f for f in traceback.extract_stack()
                  if not any(name in f.filename.replace('\\', '/') for name in _IGNORED_FRAMES)]
        where = ' | '.join(f'{os.path.basename(f.filename)}:{f.lineno} {f.name}'
                           for f in frames[-6:]) or 'unknown'
        with (Path(path).parent / SLOW_TX_LOG).open('a', encoding='utf-8') as stream:
            stream.write(f'--- {now()} write tx {elapsed:.2f}s\n    {where}\n')
    except Exception:
        pass

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
    def read(self):
        """Read-only connection: under WAL a reader never blocks the writer.

        Long read-only builds (dashboard state) must not take BEGIN IMMEDIATE,
        or every concurrent heartbeat and completion queues behind them.
        """
        db = sqlite3.connect(self.path, timeout=30)
        try:
            db.execute('PRAGMA busy_timeout=30000')
            db.execute('PRAGMA journal_mode=WAL')
            db.execute('PRAGMA query_only=1')
            yield db
        finally:
            db.close()

    @contextlib.contextmanager
    def tx(self):
        # Every request opens its own connection here. Under WAL the last
        # connection to close deletes the -wal/-shm pair, so a connection that
        # opened just before that is left with a stale shared-memory mapping and
        # fails its next write with "attempt to write a readonly database" even
        # though the file is writable. Heartbeats and playback both go through
        # this path, so the race used to surface as unexplained HTTP 500s.
        # Reopening on exactly that error is enough to clear it.
        delay = 0.05
        for attempt in range(6):
            db = sqlite3.connect(self.path, timeout=30)
            try:
                db.execute('PRAGMA busy_timeout=30000')
                db.execute('PRAGMA journal_mode=WAL')
                db.execute('BEGIN IMMEDIATE')
            except sqlite3.OperationalError as exc:
                db.close()
                if 'readonly' not in str(exc) or attempt == 5:
                    raise
                time.sleep(delay)
                delay = min(delay * 2, 1.0)
                continue
            started=time.monotonic()
            try:
                yield db
                db.commit()
            except Exception:
                db.rollback()
                raise
            finally:
                elapsed=time.monotonic()-started
                if elapsed>=SLOW_TX_SECONDS:
                    _log_slow_write(elapsed,self.path)
                db.close()
            return

    @staticmethod
    def get(db, kind, key):
        row = db.execute('SELECT data FROM records WHERE kind=? AND id=?', (kind,key)).fetchone()
        return json.loads(row[0]) if row else None

    @staticmethod
    def all(db, kind):
        return [json.loads(row[0]) for row in db.execute('SELECT data FROM records WHERE kind=? ORDER BY rowid DESC', (kind,))]

    @staticmethod
    def put(db, kind, value):
        actor=ACTOR.get()
        if actor and kind in ('jobs','candidates','batches','messages','versions'):
            if not db.execute('SELECT 1 FROM records WHERE kind=? AND id=?',(kind,value['id'])).fetchone():
                value.setdefault('created_by',actor['id'])
            value['updated_by']=actor['id']
        db.execute('INSERT INTO records VALUES (?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data', (kind,value['id'],json.dumps(value,ensure_ascii=False)))
        return value

    def event(self, db, message, job_id=None, stage='', **extra):
        actor=ACTOR.get()
        if actor:
            extra.setdefault('actor_id',actor['id']);extra.setdefault('actor_name',actor['username'])
        if job_id and 'round' not in extra:
            job=self.get(db,'jobs',job_id)
            if job:
                extra.update(round=job.get('round',1),attempt=job.get('attempt',0))
        return self.put(db,'events',dict(id=ident('ev'),message=message,job_id=job_id,stage=stage,created_at=now(),**extra))

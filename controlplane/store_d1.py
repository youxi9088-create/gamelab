"""D1-backed store with the same surface as controlplane.store.Store.

容器磁盘随休眠/重启丢失，平台状态必须落在 D1。本模块把 store.py 的 SQLite
事务语义映射到 D1：

- `tx()` 内的写操作先缓冲，退出时作为**单个 D1 batch**提交（D1 batch 是原子的）。
- `tx()` 内的读操作合并「D1 已提交数据 + 本事务待写数据」的覆盖层，
  保证读己之所写（read-your-writes）。
- 不支持交互式事务与 SAVEPOINT；`SAVEPOINT`/`RELEASE`/`ROLLBACK TO` 降级为标记，
  由调用方在应用层用「不提交即回滚」替代（见 discovery.py）。

不依赖第三方库：只用标准库 urllib。
"""
from __future__ import annotations

import contextlib
import json
import os
import sqlite3
import urllib.error
import urllib.request

API = 'https://api.cloudflare.com/client/v4'
MAX_RETRIES = 5
# D1 batch 里每条语句仍是独立 statement，100 KB 语句上限同样适用。
MAX_BATCH_BYTES = 1_000_000
MAX_BATCH_STMTS = 100


class D1Error(RuntimeError):
    pass


class _Row:
    """最小游标行为：支持 fetchone()/fetchall() 与索引访问。"""

    def __init__(self, rows):
        self._rows = rows
        self._index = 0

    def fetchone(self):
        if self._index < len(self._rows):
            row = self._rows[self._index]
            self._index += 1
            return row
        return None

    def fetchall(self):
        rows = self._rows[self._index:]
        self._index = len(self._rows)
        return rows

    def __iter__(self):
        return iter(self._rows[self._index:])


def _normalize(sql):
    return ' '.join(sql.split()).rstrip(';')


class D1Transaction:
    """模拟 sqlite3 连接的最小子集：execute(sql, params)。"""

    def __init__(self, store):
        self.store = store
        self._pending_records = {}   # (kind, id) -> data json str
        self._pending_statements = []  # (sql, params)
        self._savepoints = []        # (name, statements_len, records_snapshot)
        self._closed = False

    # ---- SAVEPOINT：D1 无嵌套事务，用缓冲快照还原 ----

    def _snapshot(self, name):
        return (name, len(self._pending_statements), dict(self._pending_records))

    def _restore(self, snapshot):
        _, length, records = snapshot
        del self._pending_statements[length:]
        self._pending_records.clear()
        self._pending_records.update(records)

    def savepoint(self, name):
        self._savepoints.append(self._snapshot(name))

    def release(self, name):
        if not self._savepoints:
            raise D1Error('RELEASE 没有对应的 SAVEPOINT')
        self._savepoints.pop()

    def rollback_to(self, name):
        for index in range(len(self._savepoints) - 1, -1, -1):
            if self._savepoints[index][0] == name:
                self._restore(self._savepoints[index])
                # SQLite 语义：回滚后该 SAVEPOINT 仍然存在
                del self._savepoints[index + 1:]
                return
        raise D1Error('没有这样的 SAVEPOINT: %s' % name)

    # ---- 读：D1 已提交数据 + 本事务覆盖层 ----

    def _records_where(self, kind, key=None):
        if key is None:
            rows = self.store._select(
                'SELECT rowid, id, data FROM records WHERE kind = ? ORDER BY rowid DESC', [kind])
            out = []
            seen = set()
            for rowid, rid, data in rows:
                seen.add(rid)
                out.append((rowid, rid, self._pending_records.get((kind, rid), data)))
            # 本事务新增的键 rowid 最大，排在最前
            for (k, rid), data in reversed(list(self._pending_records.items())):
                if k == kind and rid not in seen:
                    out.insert(0, (None, rid, data))
            return out
        pending = self._pending_records.get((kind, key))
        if pending is not None:
            return [(None, key, pending)]
        rows = self.store._select('SELECT rowid, id, data FROM records WHERE kind = ? AND id = ?', [kind, key])
        return [(rowid, rid, data) for rowid, rid, data in rows]

    def execute(self, sql, params=()):
        if self._closed:
            raise D1Error('事务已关闭')
        params = list(params or [])
        text = _normalize(sql)
        upper = text.upper()

        # 事务控制语句：D1 无交互式事务，用缓冲快照模拟
        if upper.startswith('SAVEPOINT'):
            parts = text.split()
            self.savepoint(parts[1] if len(parts) > 1 else '')
            return _Row([])
        if upper.startswith('RELEASE'):
            self.release(None)
            return _Row([])
        if upper.startswith('ROLLBACK TO'):
            parts = text.split()
            self.rollback_to(parts[2] if len(parts) > 2 else '')
            return _Row([])
        if upper.startswith(('BEGIN', 'COMMIT', 'ROLLBACK')):
            return _Row([])

        if upper.startswith('SELECT'):
            return self._execute_select(text, upper, params)

        # 其余一律视为写操作，缓冲后在 commit 时作为单个 batch 提交
        self._pending_statements.append((text, params))
        return _Row([])

    def _execute_select(self, text, upper, params):
        has_key = ('ID = ?' in upper) or ('ID=?' in upper)
        if 'FROM RECORDS' in upper and has_key and len(params) >= 2:
            kind, key = params[0], params[1]
            rows = self._records_where(kind, key)
            if 'DATA' in upper:
                return _Row([(r[2],) for r in rows])
            return _Row([(1,) for r in rows])
        if 'FROM RECORDS' in upper:
            kind = params[0]
            rows = self._records_where(kind)
            head = upper[upper.index('SELECT') + 6:upper.index('FROM')]
            columns = [c.strip().lower() for c in head.split(',')]
            out = []
            for rowid, rid, data in rows:
                row = []
                for column in columns:
                    if column == 'rowid':
                        row.append(rowid)
                    elif column == 'id':
                        row.append(rid)
                    else:
                        row.append(data)
                out.append(tuple(row))
            return _Row(out)
        if 'FROM CREDENTIALS' in upper:
            rows = self.store._select('SELECT tool_id FROM credentials WHERE token_hash = ?', params)
            return _Row([(r[0],) for r in rows])
        if 'FROM IDEMPOTENCY' in upper:
            rows = self.store._select(
                'SELECT body_hash, response FROM idempotency WHERE scope = ? AND key = ?', params)
            return _Row([(r[0], r[1]) for r in rows])
        # 未识别的 SELECT：直接打到 D1（可能读不到本事务未提交的写）
        return _Row(self.store._select(text, params))

    # ---- 写 ----

    def commit(self):
        statements = list(self._pending_statements)
        for (kind, rid), data in self._pending_records.items():
            statements.append((
                'INSERT INTO records(kind,id,data) VALUES (?,?,?) '
                'ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data',
                [kind, rid, data]))
        if statements:
            self.store._batch(statements)
        self._pending_records.clear()
        self._pending_statements.clear()

    def rollback(self):
        self._pending_records.clear()
        self._pending_statements.clear()

    def close(self):
        self._closed = True


class D1Store:
    """与 controlplane.store.Store 同名的公开接口：tx / get / all / put / event。"""

    def __init__(self, account_id=None, database_id=None, api_token=None):
        self.account_id = account_id or os.environ.get('CLOUDFLARE_ACCOUNT_ID')
        self.database_id = database_id or os.environ.get('D1_DATABASE_ID')
        self.api_token = api_token or os.environ.get('CLOUDFLARE_API_TOKEN')
        missing = [name for name, value in (('CLOUDFLARE_ACCOUNT_ID', self.account_id),
                                            ('D1_DATABASE_ID', self.database_id),
                                            ('CLOUDFLARE_API_TOKEN', self.api_token)) if not value]
        if missing:
            raise D1Error('缺少 D1 配置: %s' % ', '.join(missing))

    # ---- HTTP ----

    def _post(self, payload):
        import time
        url = f'{API}/accounts/{self.account_id}/d1/database/{self.database_id}/query'
        body = json.dumps(payload).encode('utf-8')
        request = urllib.request.Request(url, data=body, method='POST', headers={
            'Authorization': 'Bearer ' + self.api_token,
            'Content-Type': 'application/json',
        })
        last = None
        for attempt in range(MAX_RETRIES):
            try:
                with urllib.request.urlopen(request, timeout=120) as response:
                    result = json.loads(response.read().decode('utf-8'))
                if result.get('success'):
                    return result
                raise D1Error('D1 返回失败: %s' % json.dumps(result.get('errors', []), ensure_ascii=True)[:400])
            except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
                last = exc
                if isinstance(exc, urllib.error.HTTPError):
                    detail = (exc.read() or b'')[:300].decode('utf-8', 'replace')
                    if exc.code not in (429, 500, 502, 503, 504):
                        raise D1Error('D1 HTTP %s %s' % (exc.code, detail)) from None
                if attempt == MAX_RETRIES - 1:
                    break
                time.sleep(min(30, 2 ** attempt * 2))
        raise D1Error('D1 请求失败，已重试 %d 次: %s' % (MAX_RETRIES, last))

    def _select(self, sql, params=()):
        result = self._post({'sql': sql, 'params': list(params or [])})
        for item in result.get('result', []):
            if item.get('success') is False:
                raise D1Error('D1 查询失败: %s' % json.dumps(item.get('error'), ensure_ascii=True)[:300])
            rows = item.get('results') or []
            if isinstance(rows, list) and rows and isinstance(rows[0], dict):
                return [tuple(row[key] for key in row) for row in rows]
            return rows
        return []

    def _batch(self, statements):
        batch, size = [], 0
        for sql, params in statements:
            cost = len(sql) + sum(len(str(value).encode('utf-8')) for value in params)
            if batch and (len(batch) >= MAX_BATCH_STMTS or size + cost > MAX_BATCH_BYTES):
                self._post({'batch': batch})
                batch, size = [], 0
            batch.append({'sql': sql, 'params': list(params)})
            size += cost
        if batch:
            self._post({'batch': batch})

    # ---- 与 Store 对齐的接口 ----

    @contextlib.contextmanager
    def tx(self):
        db = D1Transaction(self)
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
        row = db.execute('SELECT data FROM records WHERE kind=? AND id=?', (kind, key)).fetchone()
        return json.loads(row[0]) if row else None

    @staticmethod
    def all(db, kind):
        return [json.loads(row[0]) for row in
                db.execute('SELECT data FROM records WHERE kind=? ORDER BY rowid DESC', (kind,)).fetchall()]

    @staticmethod
    def put(db, kind, value):
        from .store import ACTOR
        actor = ACTOR.get()
        if actor and kind in ('jobs', 'candidates', 'batches', 'messages', 'versions'):
            if not db.execute('SELECT 1 FROM records WHERE kind=? AND id=?', (kind, value['id'])).fetchone():
                value.setdefault('created_by', actor['id'])
            value['updated_by'] = actor['id']
        if isinstance(db, D1Transaction):
            db._pending_records[(kind, value['id'])] = json.dumps(value, ensure_ascii=False)
        else:
            # 误传 sqlite 连接时退回原语义，避免静默丢写
            db.execute('INSERT INTO records VALUES (?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data',
                       (kind, value['id'], json.dumps(value, ensure_ascii=False)))
        return value

    def event(self, db, message, job_id=None, stage='', **extra):
        from .store import ACTOR, ident, now
        actor = ACTOR.get()
        if actor:
            extra.setdefault('actor_id', actor['id'])
            extra.setdefault('actor_name', actor['username'])
        if job_id and 'round' not in extra:
            job = self.get(db, 'jobs', job_id)
            if job:
                extra.update(round=job.get('round', 1), attempt=job.get('attempt', 0))
        return self.put(db, 'events', dict(id=ident('ev'), message=message, job_id=job_id,
                                           stage=stage, created_at=now(), **extra))


def build_store(path=None):
    """按环境变量决定实现：设了 D1_STORE=1 就用 D1，否则保持本地 SQLite。

    这样同一份业务代码可在本地与容器内切换，不需要改动调用方。
    """
    if os.environ.get('D1_STORE') == '1':
        return D1Store()
    from .store import Store
    return Store(path)


def _split_statements(script):
    """复用 sqlite3 的语句切分，避免自己按行切错。"""
    statements, buffer = [], ''
    for line in script.splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('--'):
            continue
        buffer += (' ' if buffer else '') + stripped
        if sqlite3.complete_statement(buffer):
            statements.append(buffer.strip())
            buffer = ''
    if buffer.strip():
        statements.append(buffer.strip())
    return statements

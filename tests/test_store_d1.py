"""对真实 D1 验证 store_d1.D1Store 与 store.Store 的语义等价性。

需要环境变量 CLOUDFLARE_ACCOUNT_ID / D1_DATABASE_ID / CLOUDFLARE_API_TOKEN。
使用独立 kind `__selftest_<随机>` 并在结束时清理，不触碰业务数据。

用法：
    D1_DATABASE_ID=... python tests/test_store_d1.py
"""
from __future__ import annotations

import json
import os
import sys
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

from controlplane import store as sqlite_store          # noqa: E402
from controlplane.store_d1 import D1Store, _split_statements  # noqa: E402

CHECKS = []


def check(name, condition, detail=''):
    CHECKS.append((name, bool(condition), detail))
    print(('  PASS  ' if condition else '  FAIL  ') + name + ((' — ' + detail) if detail else ''))


def apply_schema(d1):
    statements = _split_statements((ROOT / 'cloudflare' / 'schema.sql').read_text(encoding='utf-8'))
    d1._post({'batch': [{'sql': s, 'params': []} for s in statements]})
    return len(statements)


def main():
    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    database = os.environ.get('D1_DATABASE_ID')
    if not account or not database:
        print('缺少 CLOUDFLARE_ACCOUNT_ID / D1_DATABASE_ID')
        return 1

    d1 = D1Store()
    kind = '__selftest_' + uuid.uuid4().hex[:10]
    print('测试 kind:', kind)
    print('应用 schema…')
    print('  %d 条语句' % apply_schema(d1))

    # 1. 写入并提交后可读
    with d1.tx() as db:
        d1.put(db, kind, {'id': 'a', 'n': 1})
        d1.put(db, kind, {'id': 'b', 'n': 2})
        d1.put(db, kind, {'id': 'c', 'n': 3})
    with d1.tx() as db:
        ids = [r['id'] for r in d1.all(db, kind)]
    check('写入 3 条后 all() 可读', ids == ['c', 'b', 'a'], '实际 %s' % ids)

    # 2. get 精确读取
    with d1.tx() as db:
        row = d1.get(db, kind, 'b')
    check('get() 精确读取', row and row['n'] == 2, json.dumps(row, ensure_ascii=True))

    # 3. 读己之所写（事务内 put 后立刻 get）
    with d1.tx() as db:
        d1.put(db, kind, {'id': 'd', 'n': 4})
        seen = d1.get(db, kind, 'd')
        listed = [r['id'] for r in d1.all(db, kind)]
    check('事务内读己之所写', seen and seen['n'] == 4, json.dumps(seen, ensure_ascii=True))
    check('事务内 all() 含未提交写', listed[:1] == ['d'], '实际 %s' % listed)

    # 4. SELECT 1 存在性判断（put 里 actor 分支依赖它）
    with d1.tx() as db:
        exists = db.execute('SELECT 1 FROM records WHERE kind=? AND id=?', (kind, 'a')).fetchone()
        absent = db.execute('SELECT 1 FROM records WHERE kind=? AND id=?', (kind, 'zz')).fetchone()
    check('SELECT 1 存在性判断', exists == (1,) and absent is None, 'exists=%s absent=%s' % (exists, absent))

    # 5. 更新既有记录：数据变化但 rowid 顺序保持
    with d1.tx() as db:
        d1.put(db, kind, {'id': 'b', 'n': 99})
    with d1.tx() as db:
        listed = [r['id'] for r in d1.all(db, kind)]
        value = d1.get(db, kind, 'b')
    check('更新后顺序保持', listed == ['d', 'c', 'b', 'a'], '实际 %s' % listed)
    check('更新后数据生效', value['n'] == 99, json.dumps(value, ensure_ascii=True))

    # 6. 异常回滚：事务内抛错不应落库
    try:
        with d1.tx() as db:
            d1.put(db, kind, {'id': 'rollback', 'n': 1})
            raise RuntimeError('boom')
    except RuntimeError:
        pass
    with d1.tx() as db:
        gone = d1.get(db, kind, 'rollback')
    check('异常时回滚（不落库）', gone is None, '实际 %s' % json.dumps(gone, ensure_ascii=True))

    # 7. event() 写入
    with d1.tx() as db:
        ev = d1.event(db, 'selftest event', stage='check')
    with d1.tx() as db:
        stored = d1.get(db, 'events', ev['id'])
    check('event() 写入 events', stored and stored['message'] == 'selftest event',
          json.dumps(stored, ensure_ascii=True) if stored else 'None')

    # 8. credentials 表（service.py:52 依赖）
    token_hash = uuid.uuid4().hex
    with d1.tx() as db:
        db.execute('INSERT INTO credentials VALUES (?,?)', (token_hash, 'tool-selftest'))
    with d1.tx() as db:
        row = db.execute('SELECT tool_id FROM credentials WHERE token_hash=?', (token_hash,)).fetchone()
    check('credentials 读写', row == ('tool-selftest',), '实际 %s' % (row,))

    # 9. idempotency 表（service.py:189/195 依赖）
    scope = 'selftest'
    with d1.tx() as db:
        db.execute('INSERT INTO idempotency VALUES (?,?,?,?)', (scope, 'k1', 'h1', '{"ok":true}'))
    with d1.tx() as db:
        row = db.execute('SELECT body_hash,response FROM idempotency WHERE scope=? AND key=?', (scope, 'k1')).fetchone()
    check('idempotency 读写', row == ('h1', '{"ok":true}'), '实际 %s' % (row,))

    # 10a. SAVEPOINT 正常路径（RELEASE）
    with d1.tx() as db:
        db.execute('SAVEPOINT automatic_dispatch')
        d1.put(db, kind, {'id': 'sp', 'n': 1})
        db.execute('RELEASE automatic_dispatch')
    with d1.tx() as db:
        sp = d1.get(db, kind, 'sp')
    check('SAVEPOINT 正常路径仍可提交', sp and sp['n'] == 1, json.dumps(sp, ensure_ascii=True))

    # 10b. SAVEPOINT 局部回滚：还原 discovery.py 的真实模式
    with d1.tx() as db:
        d1.put(db, kind, {'id': 'keep', 'n': 1})          # 回滚点之前，应保留
        db.execute('SAVEPOINT automatic_dispatch')
        d1.put(db, kind, {'id': 'partial', 'n': 1})       # 回滚点之内，应撤销
        try:
            raise RuntimeError('dispatch failed')
        except RuntimeError:
            db.execute('ROLLBACK TO automatic_dispatch')
            db.execute('RELEASE automatic_dispatch')
        d1.put(db, kind, {'id': 'after', 'n': 1})         # 回滚之后，应保留
    with d1.tx() as db:
        keep = d1.get(db, kind, 'keep')
        partial = d1.get(db, kind, 'partial')
        after = d1.get(db, kind, 'after')
    check('SAVEPOINT 回滚点之前的写入保留', keep is not None)
    check('SAVEPOINT 局部回滚撤销中间写入', partial is None, '实际 %s' % json.dumps(partial, ensure_ascii=True))
    check('SAVEPOINT 回滚之后的写入保留', after is not None)

    # 11. 大字段（超过 D1 单条 100KB 语句上限时的参数化路径）
    big = 'x' * 300_000
    with d1.tx() as db:
        d1.put(db, kind, {'id': 'big', 'blob': big})
    with d1.tx() as db:
        stored = d1.get(db, kind, 'big')
    check('300KB 大字段参数化写入', stored and stored.get('blob') == big,
          '长度 %s' % (len(stored.get('blob', '')) if stored else 'None'))

    # 清理
    d1._post({'sql': 'DELETE FROM records WHERE kind = ?', 'params': [kind]})
    d1._post({'sql': 'DELETE FROM records WHERE kind = ? AND id = ?', 'params': ['events', ev['id']]})
    d1._post({'sql': 'DELETE FROM credentials WHERE token_hash = ?', 'params': [token_hash]})
    d1._post({'sql': 'DELETE FROM idempotency WHERE scope = ?', 'params': [scope]})
    with d1.tx() as db:
        left = d1.all(db, kind)
    check('清理干净', left == [], '残留 %d 条' % len(left))

    passed = sum(1 for _, ok, _ in CHECKS if ok)
    print('\n%d/%d 通过' % (passed, len(CHECKS)))
    print(json.dumps({'checks': len(CHECKS), 'passed': passed, 'ok': passed == len(CHECKS),
                      'kind': kind}, ensure_ascii=True, sort_keys=True))
    return 0 if passed == len(CHECKS) else 1


if __name__ == '__main__':
    sys.exit(main())

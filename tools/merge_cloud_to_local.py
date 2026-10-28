"""把云端（D1 源库）数据合并进本机平台库。

取舍：只增不改同 id 之外的记录——云端有、本机没有的补进来；两边都有的同 id 以云端为准
（云端是生产快照，时间更新）；本机独有的原样保留，一条不删。

排除的三个 kind：
  users           —— 云端账号是 5000 轮 PBKDF2 重设过的哈希，本机 accounts.py 用原轮数校验，
                     合进来会让本机"有账号但永远登不上"。本机保持免登录更实用。
  portal_sessions —— 运行时会话，迁过来是纯污染。
  audit           —— 云端审计流水，对本机没有意义。

用法：python tools/merge_cloud_to_local.py [--apply]
      默认 dry-run，只报告将要发生什么；--apply 才真正写入。
"""
import pathlib
import sqlite3
import sys

LOCAL = pathlib.Path('F:/youxi/door/data/platform.sqlite3')
CLOUD = pathlib.Path('F:/youxi/door-cloudflare-migration/migration-private/platform.migration.sqlite3')
EXCLUDED = ('users', 'portal_sessions', 'audit')


def counts(conn):
    return {k: n for k, n in conn.execute(
        'SELECT kind, COUNT(*) AS c FROM records GROUP BY kind ORDER BY c DESC')}


def main():
    apply = '--apply' in sys.argv
    before = counts(sqlite3.connect(LOCAL.as_uri() + '?mode=ro', uri=True))

    conn = sqlite3.connect(str(LOCAL))
    conn.execute('ATTACH ? AS cloud', (str(CLOUD),))
    placeholders = ','.join('?' * len(EXCLUDED))
    # 同 id 以云端为准：REPLACE 会覆盖本机旧副本；本机独有的 id 不受影响。
    conn.execute(f'INSERT OR REPLACE INTO main.records (kind, id, data) '
                 f'SELECT kind, id, data FROM cloud.records '
                 f'WHERE kind NOT IN ({placeholders})', EXCLUDED)
    conn.execute('INSERT OR IGNORE INTO main.credentials (token_hash, tool_id) '
                 'SELECT token_hash, tool_id FROM cloud.credentials')
    conn.execute('CREATE TABLE IF NOT EXISTS idempotency '
                 '(scope TEXT, key TEXT, body_hash TEXT, response TEXT)')
    conn.execute('INSERT OR IGNORE INTO main.idempotency '
                 'SELECT scope, key, body_hash, response FROM cloud.idempotency')
    # 统计必须在回滚前取，否则 dry-run 只会看到原样。
    after = counts(conn)
    if apply:
        conn.commit()
    else:
        conn.rollback()
    conn.close()

    print(f'{"kind":22} {"合并前":>7} {"合并后":>7}  变化')
    total_before = total_after = 0
    for kind in sorted(set(before) | set(after), key=lambda k: -after.get(k, 0)):
        b, a = before.get(kind, 0), after.get(kind, 0)
        total_before += b
        total_after += a
        if b != a:
            print(f'{kind:22} {b:>7} {a:>7}  {"+" + str(a - b) if a > b else str(a - b)}')
    print(f'{"合计":21} {total_before:>7} {total_after:>7}  +{total_after - total_before}')
    print('\n模式:', '已写入' if apply else 'DRY-RUN（未写入，加 --apply 才生效）')


if __name__ == '__main__':
    main()

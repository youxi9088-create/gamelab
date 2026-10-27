"""逐记录比对 D1 与源库清洗结果，确认迁移数据未被污染。

用法：
    D1_DATABASE_ID=... python tools/verify_d1.py <platform.migration.sqlite3>
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import sqlite3
import sys
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent


def load_module():
    spec = importlib.util.spec_from_file_location('ct', ROOT / 'tools' / 'cloudflare_transfer.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def expected_rows(module, database_path):
    rows = {}
    with sqlite3.connect(Path(database_path).resolve().as_uri() + '?mode=ro', uri=True, isolation_level=None) as db:
        db.execute('PRAGMA query_only=ON')
        db.execute('BEGIN')
        try:
            for _, kind, key, raw in db.execute('SELECT rowid,kind,id,data FROM records ORDER BY kind,id'):
                if kind.lower() in module.EXCLUDED_KINDS:
                    continue
                record = json.loads(raw)
                cleaned = module.clean_record(kind, record, Counter())
                data = json.dumps(cleaned, ensure_ascii=True, sort_keys=True, separators=(',', ':'), allow_nan=False)
                rows[(kind, key)] = hashlib.sha256(data.encode('utf-8')).hexdigest()
        finally:
            db.rollback()
    return rows


def fetch_d1(token, account, database):
    out = {}
    offset = 0
    page = 500
    while True:
        request = urllib.request.Request(
            f'https://api.cloudflare.com/client/v4/accounts/{account}/d1/database/{database}/query',
            data=json.dumps({'sql': 'SELECT kind,id,data FROM records ORDER BY kind,id LIMIT ? OFFSET ?',
                             'params': [page, offset]}).encode(),
            headers={'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json'}, method='POST')
        result = json.loads(urllib.request.urlopen(request, timeout=180).read().decode('utf-8'))
        if not result.get('success'):
            raise SystemExit('D1 查询失败: %s' % json.dumps(result.get('errors'), ensure_ascii=True)[:300])
        rows = result['result'][0]['results']
        for row in rows:
            out[(row['kind'], row['id'])] = hashlib.sha256(row['data'].encode('utf-8')).hexdigest()
        if len(rows) < page:
            break
        offset += page
    return out


def main():
    if len(sys.argv) != 2:
        raise SystemExit('用法: verify_d1.py <platform.migration.sqlite3>')
    token = os.environ.get('CLOUDFLARE_API_TOKEN')
    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    database = os.environ.get('D1_DATABASE_ID')
    if not all((token, account, database)):
        raise SystemExit('缺少 CLOUDFLARE_API_TOKEN / CLOUDFLARE_ACCOUNT_ID / D1_DATABASE_ID')

    module = load_module()
    print('计算源库期望值…', flush=True)
    expected = expected_rows(module, sys.argv[1])
    print('  期望 %d 条' % len(expected), flush=True)
    print('拉取 D1 实际值…', flush=True)
    actual = fetch_d1(token, account, database)
    print('  实际 %d 条' % len(actual), flush=True)

    missing = sorted(set(expected) - set(actual))
    # 运行时产生的会话/限流记录本就被迁移排除，出现不算污染，单列出来
    runtime_only = sorted(k for k in set(actual) - set(expected) if k[0].lower() in module.EXCLUDED_KINDS)
    extra = sorted((set(actual) - set(expected)) - set(runtime_only))
    changed = sorted(k for k in set(expected) & set(actual) if expected[k] != actual[k])

    print('\n缺失: %d' % len(missing))
    for key in missing[:10]:
        print('  -', key)
    print('运行时新增（不计为污染）: %d' % len(runtime_only))
    for key in runtime_only[:10]:
        print('  *', key)
    print('多余: %d' % len(extra))
    for key in extra[:10]:
        print('  +', key)
    print('内容不一致: %d' % len(changed))
    for key in changed[:10]:
        print('  ~', key)

    ok = not missing and not extra and not changed
    print('\n' + json.dumps({'expected': len(expected), 'actual': len(actual), 'missing': len(missing),
                             'runtime_only': len(runtime_only), 'extra': len(extra),
                             'changed': len(changed), 'ok': ok},
                            ensure_ascii=True, sort_keys=True))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())

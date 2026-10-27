"""把 prepare 的清洗结果以参数化批量方式写入远端 D1。

D1 单条 SQL 上限 100 KB，而生产库里 artifacts/jobs/versions 的 report 字段单条可达 810 KB，
因此不能用字面量 INSERT（wrangler d1 execute --file 会失败）。改用 D1 REST API 的
batch + params：SQL 文本很短，大值走参数通道（行上限 2 MB，本库最大 810 KB，安全）。

复用 cloudflare_transfer 的 EXCLUDED_KINDS / clean_record，保证与 private.sql 完全同一套清洗规则。
"""
from __future__ import annotations

import hashlib
import importlib.util
import json
import os
import sqlite3
import sys
import time
import urllib.error
import urllib.request
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
API = 'https://api.cloudflare.com/client/v4'

# 单批目标：语句数 与 累计参数字节 双上限
MAX_STMTS = 200
MAX_BATCH_BYTES = 1_200_000
MAX_RETRIES = 5


def load_module():
    spec = importlib.util.spec_from_file_location('ct', ROOT / 'tools' / 'cloudflare_transfer.py')
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def credentials():
    token = os.environ.get('CLOUDFLARE_API_TOKEN')
    account = os.environ.get('CLOUDFLARE_ACCOUNT_ID')
    database = os.environ.get('D1_DATABASE_ID')
    missing = [name for name, value in
               (('CLOUDFLARE_API_TOKEN', token), ('CLOUDFLARE_ACCOUNT_ID', account), ('D1_DATABASE_ID', database))
               if not value]
    if missing:
        raise SystemExit('缺少环境变量: %s' % ', '.join(missing))
    return token, account, database


def post_query(token, account, database, payload):
    url = f'{API}/accounts/{account}/d1/database/{database}/query'
    body = json.dumps(payload).encode('utf-8')
    request = urllib.request.Request(url, data=body, method='POST', headers={
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json',
    })
    last = None
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(request, timeout=180) as response:
                result = json.loads(response.read().decode('utf-8'))
            if result.get('success'):
                return result
            raise RuntimeError('D1 返回失败: %s' % json.dumps(result.get('errors', []), ensure_ascii=True)[:400])
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError) as exc:
            last = exc
            detail = ''
            if isinstance(exc, urllib.error.HTTPError):
                detail = (exc.read() or b'')[:400].decode('utf-8', 'replace')
                if exc.code not in (429, 500, 502, 503, 504):
                    raise RuntimeError('D1 HTTP %s %s' % (exc.code, detail)) from None
            else:
                detail = str(exc)
            if attempt == MAX_RETRIES - 1:
                break
            time.sleep(min(30, 2 ** attempt * 2))
    raise RuntimeError('D1 请求失败，已重试 %d 次: %s' % (MAX_RETRIES, last))


def flush_batches(token, account, database, batches, label):
    sent = 0
    for index, batch in enumerate(batches, 1):
        post_query(token, account, database, {'batch': batch})
        sent += len(batch)
        print('  %s 批次 %d: +%d 条（累计 %d）' % (label, index, len(batch), sent), flush=True)
    return sent


def build_batches(rows):
    """rows: list of (sql, params)。按语句数与字节数双上限切分。"""
    batches, current, size = [], [], 0
    for sql, params in rows:
        cost = sum(len(value.encode('utf-8')) for value in params) + len(sql)
        if current and (len(current) >= MAX_STMTS or size + cost > MAX_BATCH_BYTES):
            batches.append(current)
            current, size = [], 0
        current.append({'sql': sql, 'params': list(params)})
        size += cost
    if current:
        batches.append(current)
    return batches


def collect_records(module, database_path):
    """与 prepare 完全一致的遍历与清洗顺序。"""
    rows = []
    digest = hashlib.sha256()
    with sqlite3.connect(Path(database_path).resolve().as_uri() + '?mode=ro', uri=True, isolation_level=None) as db:
        db.execute('PRAGMA query_only=ON')
        db.execute('BEGIN')
        try:
            for position, kind, key, raw in db.execute('SELECT rowid,kind,id,data FROM records ORDER BY kind,id'):
                if not all(isinstance(value, str) for value in (kind, key, raw)):
                    raise SystemExit('源记录类型无效')
                for value in (kind, key, raw):
                    encoded = value.encode('utf-8')
                    digest.update(len(encoded).to_bytes(8, 'big') + encoded)
                if kind.lower() in module.EXCLUDED_KINDS:
                    continue
                record = json.loads(raw)
                if not isinstance(record, dict) or record.get('id') != key:
                    raise SystemExit('源记录 ID 或 JSON 结构不一致')
                cleaned = module.clean_record(kind, record, Counter())
                rows.append((position, kind, key,
                             json.dumps(cleaned, ensure_ascii=True, sort_keys=True, separators=(',', ':'), allow_nan=False)))
        finally:
            db.rollback()
    rows.sort()
    return [row[1:] for row in rows], digest.hexdigest()


def main():
    if len(sys.argv) != 3:
        raise SystemExit('用法: d1_import.py <platform.migration.sqlite3> <manifest.json>')
    database_path, manifest_path = sys.argv[1], sys.argv[2]
    token, account, database = credentials()
    module = load_module()

    manifest = json.loads(Path(manifest_path).read_text(encoding='utf-8'))
    files = manifest['files']

    print('读取并清洗源库…', flush=True)
    records, digest = collect_records(module, database_path)
    print('  清洗后记录 %d 条（源摘要 %s…）' % (len(records), digest[:16]), flush=True)
    print('  清单登记文件 %d 个' % len(files), flush=True)

    statements = []
    buffer = ''
    for line in (ROOT / 'cloudflare' / 'schema.sql').read_text(encoding='utf-8').splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith('--'):
            continue
        buffer += (' ' if buffer else '') + stripped
        if sqlite3.complete_statement(buffer):
            statements.append(buffer.strip())
            buffer = ''
    if buffer.strip():
        statements.append(buffer.strip())
    print('应用 schema（%d 条）…' % len(statements), flush=True)
    post_query(token, account, database, {'batch': [{'sql': s, 'params': []} for s in statements]})

    print('写入 records…', flush=True)
    record_rows = [('INSERT OR REPLACE INTO records(kind,id,data) VALUES (?,?,?)', row) for row in records]
    record_batches = build_batches(record_rows)
    print('  切分为 %d 批（最大单条参数 %d B）'
          % (len(record_batches), max(len(r[1][2]) for r in records)), flush=True)
    flush_batches(token, account, database, record_batches, 'records')

    print('写入 artifact_files…', flush=True)
    file_rows = [('INSERT OR REPLACE INTO artifact_files(artifact_id,path,object_key,sha256,bytes) VALUES (?,?,?,?,?)',
                  (f['artifact_id'], f['path'], f['object_key'], f['sha256'], str(f['bytes'])))
                 for f in files]
    flush_batches(token, account, database, build_batches(file_rows), 'artifact_files')

    print('校验远端行数…', flush=True)
    result = post_query(token, account, database, {'sql': 'SELECT (SELECT COUNT(*) FROM records) AS r,(SELECT COUNT(*) FROM artifact_files) AS f', 'params': []})
    row = result['result'][0]['results'][0]
    print('远端 records=%s（期望 %d），artifact_files=%s（期望 %d）'
          % (row['r'], len(records), row['f'], len(files)), flush=True)
    ok = int(row['r']) == len(records) and int(row['f']) == len(files)
    print(json.dumps({'records': int(row['r']), 'artifact_files': int(row['f']),
                      'expected_records': len(records), 'expected_files': len(files),
                      'source_digest': digest, 'ok': ok}, ensure_ascii=True, sort_keys=True))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())

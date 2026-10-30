"""Incremental local-to-Cloudflare read-only mirror. Run with --apply to publish.

Requires existing Cloudflare/R2 credentials in the environment. Private checkpoint
and status live under data/cloud-sync; no credentials or database enter Git.
"""
import argparse
from collections import Counter
from concurrent.futures import ThreadPoolExecutor
from contextlib import closing
from datetime import datetime, timezone
import hashlib
import json
import os
import shutil
from pathlib import Path
import sqlite3
import subprocess
import sys
import tomllib

ROOT = Path(__file__).resolve().parents[1]
EXCLUDE = {'users', 'audit', 'settings', 'tools', 'portal_sessions', 'credentials',
           'executor_credentials', 'leases', 'executor_leases', 'auth_throttles',
           'auth_throttle', 'login_throttles', 'auth_attempts', 'auth_failures', 'login_attempts'}


def digest(value):
    return hashlib.sha256(value.encode('utf-8')).hexdigest()


def atomic_json(path, value):
    temp = path.with_suffix('.tmp')
    temp.write_text(json.dumps(value, ensure_ascii=True, indent=2), encoding='utf-8')
    temp.replace(path)


def verify_records(d1, credentials, records):
    """Read back every source record, including unchanged checkpoint entries."""
    for offset in range(0, len(records), 50):
        group = records[offset:offset + 50]
        reply = d1.post_query(*credentials, {'batch': [
            {'sql': 'SELECT data FROM records WHERE kind=? AND id=?', 'params': [kind, key]}
            for kind, key, _ in group]})
        results = reply.get('result', [])
        if len(results) != len(group):
            raise ValueError('Cloud record readback incomplete')
        for result, (_, _, raw) in zip(results, group):
            rows = result.get('results', [])
            if len(rows) != 1 or json.loads(rows[0]['data']) != json.loads(raw):
                raise ValueError('Cloud record readback differs from source snapshot')


def publish_portal(cloud, state, backend, bucket, summary):
    """Generate with the installed Node and verify bytes from cloud storage."""
    node = os.environ.get('NODE_BINARY') or shutil.which('node')
    if not node:
        raise ValueError('Node runtime is required for cloud portal generation')
    output = state / 'portal-state-core.json'
    subprocess.run([node, str(cloud / 'tools/build_portal_state_core.mjs'), str(output)],
                   cwd=cloud, check=True, timeout=600,
                   env={**os.environ, 'NODE_USE_ENV_PROXY': '1'})
    payload = json.loads(output.read_text('utf-8'))
    stamp = datetime.now(timezone.utc).isoformat()
    payload['sync_receipt'] = {'verified_at': stamp, **summary}
    body = json.dumps(payload, ensure_ascii=True, separators=(',', ':')).encode('utf-8')
    key = 'portal/state-core.json'
    backend.s3.put_object(Bucket=bucket, Key=key, Body=body,
                          ContentType='application/json; charset=utf-8', CacheControl='no-cache')
    stream = backend.s3.get_object(Bucket=bucket, Key=key)['Body']
    try:
        if stream.read() != body:
            raise ValueError('Cloud portal readback differs from generated snapshot')
    finally:
        stream.close()
    return {'verified_at': stamp, 'portal_sha256': hashlib.sha256(body).hexdigest(),
            'portal_bytes': len(body), 'verification': 'd1-records-and-r2-content'}


def collect(db, transfer, artifacts):
    records, keep = [], set()
    for kind, key, raw in db.execute('SELECT kind,id,data FROM records ORDER BY rowid'):
        if kind.lower() in EXCLUDE | transfer.EXCLUDED_KINDS:
            continue
        row = json.loads(raw)
        if row.get('id') != key:
            raise ValueError('Record identity mismatch')
        # Mirror execution status, without turning live local jobs into migration failures.
        clean = transfer.clean_record('mirror', row, Counter())
        records.append((kind, key, json.dumps(clean, ensure_ascii=True, sort_keys=True, separators=(',', ':'))))
        if kind == 'versions' and row.get('status') in {'approved', 'published'} and row.get('artifact_id'):
            keep.add(row['artifact_id'])
    files = []
    for artifact in sorted(keep):
        files.extend(transfer.artifact_files(transfer.ReadOnlySource(), db, artifact, artifacts))
    return records, files


def run(args, state):
    cloud = Path(args.cloud_root).resolve()
    sys.path.insert(0, str(cloud / 'tools'))
    import cloudflare_transfer as transfer
    import d1_import as d1
    import r2_upload
    config = tomllib.loads((cloud / 'cloudflare/wrangler.toml').read_text('utf-8'))
    os.environ.setdefault('CLOUDFLARE_ACCOUNT_ID', config['account_id'])
    os.environ.setdefault('D1_DATABASE_ID', config['d1_databases'][0]['database_id'])
    checkpoint = state / 'checkpoint.json'
    old = json.loads(checkpoint.read_text('utf-8')) if checkpoint.exists() else {}
    target = [config['account_id'], os.environ['D1_DATABASE_ID'], config['r2_buckets'][0]['bucket_name']]
    if old.get('target') != target:
        old = {}
    with closing(sqlite3.connect((ROOT / 'data/platform.sqlite3').as_uri() + '?mode=ro', uri=True)) as db:
        db.execute('PRAGMA query_only=ON')
        db.execute('BEGIN')
        records, files = collect(db, transfer, ROOT / 'data/artifacts')
    hashes = {kind + '/' + key: digest(raw) for kind, key, raw in records}
    changed = [r for r in records if old.get('records', {}).get(r[0] + '/' + r[1]) != hashes[r[0] + '/' + r[1]]]
    file_hashes = {f['object_key']: f['sha256'] for f in files}
    pending = [f for f in files if old.get('files', {}).get(f['object_key']) != f['sha256']]
    summary = {'records': len(records), 'changed_records': len(changed), 'files': len(files), 'pending_files': len(pending), 'applied': args.apply,
               'record_counts': dict(Counter(r[0] for r in records))}
    print(json.dumps(summary), flush=True)
    if not args.apply:
        return summary
    required = ('CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'D1_DATABASE_ID',
                'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY')
    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        print('Missing environment variables: ' + ', '.join(missing), file=sys.stderr)
        raise ValueError('Missing credentials')
    credentials = d1.credentials()
    backend = r2_upload.S3Backend(target[0], target[2])
    if pending:
        print('Checking cloud artifact inventory', flush=True)
        remote = d1.post_query(*credentials, {'sql': 'SELECT object_key,sha256,bytes FROM artifact_files', 'params': []})
        remote_files = {r['object_key']: r for r in remote['result'][0]['results']}
        objects = {}
        for page in backend.s3.get_paginator('list_objects_v2').paginate(Bucket=target[2], Prefix='artifacts/'):
            objects.update({obj['Key']: obj['Size'] for obj in page.get('Contents', [])})

        def upload(entry):
            key = entry['object_key']
            previous = remote_files.get(key)
            if previous and previous['sha256'] != entry['sha256']:
                raise ValueError('Immutable cloud artifact differs from local registered file')
            if not (previous and objects.get(key) == entry['bytes']):
                if r2_upload.sha256_file(entry['source_path']) != entry['sha256']:
                    raise ValueError('Artifact changed during synchronization')
                backend.put(key, Path(entry['source_path']), entry['sha256'])
                head = backend.s3.head_object(Bucket=target[2], Key=key)
                if head['ContentLength'] != entry['bytes'] or head.get('Metadata', {}).get('sha256') != entry['sha256']:
                    raise ValueError('R2 upload verification failed')
        with ThreadPoolExecutor(max_workers=8) as pool:
            for count, _ in enumerate(pool.map(upload, pending), 1):
                if count % 500 == 0 or count == len(pending):
                    print(f'Artifacts checked: {count}/{len(pending)}', flush=True)
        sql = 'INSERT INTO artifact_files(artifact_id,path,object_key,sha256,bytes) VALUES (?,?,?,?,?) ON CONFLICT(artifact_id,path) DO UPDATE SET object_key=excluded.object_key,sha256=excluded.sha256,bytes=excluded.bytes'
        rows = [(sql, tuple(str(f[k]) for k in ('artifact_id', 'path', 'object_key', 'sha256', 'bytes'))) for f in pending
                if not (remote_files.get(f['object_key'], {}).get('sha256') == f['sha256'])]
        d1.flush_batches(*credentials, d1.build_batches(rows), 'files')
    sql = 'INSERT INTO records(kind,id,data) VALUES (?,?,?) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data'
    d1.flush_batches(*credentials, d1.build_batches([(sql, row) for row in changed]), 'records')
    verify_records(d1, credentials, records)
    # Publish the pre-generated portal only after objects and their records exist.
    print('Refreshing cloud portal snapshot', flush=True)
    summary.update(publish_portal(cloud, state, backend, target[2], summary))
    atomic_json(checkpoint, {'target': target, 'records': hashes, 'files': file_hashes})
    atomic_json(state / 'last-success.json', summary)
    # Receipts contain aggregate counts, never source records, credentials or user accounts.
    from datetime import timedelta
    day = datetime.now(timezone(timedelta(hours=8))).strftime('%Y-%m-%d')
    receipts = state / 'daily'
    receipts.mkdir(exist_ok=True)
    atomic_json(receipts / (day + '.json'), summary)
    return summary


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--cloud-root', default=str(ROOT.parent / 'door-cloudflare-migration'))
    parser.add_argument('--apply', action='store_true')
    args = parser.parse_args()
    state = ROOT / 'data/cloud-sync'
    state.mkdir(parents=True, exist_ok=True)
    # OS-owned lock is released even after crashes; prevents overlapping executions.
    import msvcrt
    with (state / 'sync.lock').open('a+b') as lock:
        lock.seek(0)
        if not lock.read(1):
            lock.write(b'0'); lock.flush()
        lock.seek(0)
        try:
            msvcrt.locking(lock.fileno(), msvcrt.LK_NBLCK, 1)
        except OSError:
            print('Another sync is running', flush=True)
            return 2
        try:
            if args.apply:
                atomic_json(state / 'status.json', {'ok': None, 'running': True, 'at': datetime.now(timezone.utc).isoformat()})
            result = run(args, state)
            atomic_json(state / ('status.json' if args.apply else 'preflight.json'), {'ok': True, 'at': datetime.now(timezone.utc).isoformat(), **result})
            return 0
        except Exception as error:
            # Do not persist raw exception bodies that may include source records or credentials.
            atomic_json(state / 'status.json', {'ok': False, 'at': datetime.now(timezone.utc).isoformat(), 'error_type': type(error).__name__})
            print('Sync failed: ' + type(error).__name__, file=sys.stderr)
            return 1
        finally:
            lock.seek(0)
            msvcrt.locking(lock.fileno(), msvcrt.LK_UNLCK, 1)


if __name__ == '__main__':
    sys.exit(main())

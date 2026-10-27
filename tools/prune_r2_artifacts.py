"""按「只保留审核通过产物」清理云端 R2 与 D1 登记。

保留口径：versions.status in ('approved','published') 对应的 artifact_id。
其余（draft / superseded）从 R2 删除对象，并从 D1 artifact_files 移除登记。
D1 的 records 历史不动。

默认 dry-run，必须显式 --apply 才会真的删除。删除前会把清单写到
--report 指定的文件（默认 migration-private/prune-report.json）。

用法：
    <venv-python> tools/prune_r2_artifacts.py --database ... --manifest ... \
        --bucket ... --endpoint ... [--apply] [--report PATH]
"""
from __future__ import annotations

import argparse
import json
import os
import sqlite3
import sys
from collections import defaultdict
from pathlib import Path

KEEP_STATUSES = ('approved', 'published')


def load_keep(database: str):
    """返回 (保留的 artifact_id 集合, 版本状态->产物集合, 标题映射)。"""
    db = sqlite3.connect(Path(database).resolve().as_uri() + '?mode=ro', uri=True)
    by_status = defaultdict(set)
    titles = {}
    for _, raw in db.execute("SELECT id,data FROM records WHERE kind='versions'"):
        version = json.loads(raw)
        artifact = version.get('artifact_id')
        if not artifact:
            continue
        by_status[str(version.get('status'))].add(artifact)
        titles[artifact] = version.get('title')
    db.close()
    keep = set()
    for status in KEEP_STATUSES:
        keep |= by_status.get(status, set())
    return keep, by_status, titles


def manifest_stats(manifest_path: str):
    manifest = json.loads(Path(manifest_path).read_text(encoding='utf-8'))
    size, count = defaultdict(int), defaultdict(int)
    for item in manifest['files']:
        size[item['artifact_id']] += item['bytes']
        count[item['artifact_id']] += 1
    return size, count


def main():
    parser = argparse.ArgumentParser(description='按审核状态清理云端产物')
    parser.add_argument('--database', required=True)
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--bucket', default=os.environ.get('R2_BUCKET'))
    parser.add_argument('--endpoint', default=os.environ.get('R2_ENDPOINT'))
    parser.add_argument('--report', default='migration-private/prune-report.json')
    parser.add_argument('--apply', action='store_true', help='真正执行删除；默认只演练')
    args = parser.parse_args()

    keep, by_status, titles = load_keep(args.database)
    size, count = manifest_stats(args.manifest)
    drop = sorted(set(size) - keep)

    print('保留状态: %s' % ', '.join(KEEP_STATUSES))
    for status in sorted(by_status):
        artifacts = by_status[status]
        print('  %-12s %2d 产物 %5d 文件 %7.0f MB' % (
            status, len(artifacts), sum(count[a] for a in artifacts),
            sum(size[a] for a in artifacts) / 1048576))
    print()
    print('保留: %d 产物 / %d 文件 / %.0f MB' % (
        len(keep), sum(count[a] for a in keep), sum(size[a] for a in keep) / 1048576))
    print('删除: %d 产物 / %d 文件 / %.0f MB' % (
        len(drop), sum(count[a] for a in drop), sum(size[a] for a in drop) / 1048576))

    report = {
        'keep_statuses': list(KEEP_STATUSES),
        'keep': sorted(keep),
        'drop': [{'artifact_id': a, 'title': titles.get(a), 'files': count[a], 'bytes': size[a]} for a in drop],
        'drop_files': sum(count[a] for a in drop),
        'drop_bytes': sum(size[a] for a in drop),
    }
    Path(args.report).parent.mkdir(parents=True, exist_ok=True)
    Path(args.report).write_text(json.dumps(report, ensure_ascii=True, indent=2), encoding='utf-8')
    print('\n清单已写入 %s' % args.report)

    if not args.apply:
        print('\n[dry-run] 未做任何删除。确认后加 --apply 执行。')
        return 0
    if not args.bucket or not args.endpoint:
        print('缺少 --bucket / --endpoint')
        return 1

    import boto3
    from botocore.config import Config
    client = boto3.client('s3', endpoint_url=args.endpoint,
                          aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
                          aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
                          region_name='auto', config=Config(signature_version='s3v4'))

    deleted = 0
    for artifact in drop:
        prefix = f'artifacts/{artifact}/'
        keys = []
        for page in client.get_paginator('list_objects_v2').paginate(Bucket=args.bucket, Prefix=prefix):
            keys.extend(item['Key'] for item in page.get('Contents', []))
        for index in range(0, len(keys), 1000):
            client.delete_objects(Bucket=args.bucket,
                                  Delete={'Objects': [{'Key': k} for k in keys[index:index + 1000]]})
        deleted += len(keys)
        print('  删除 %-26s %5d 对象' % (artifact, len(keys)), flush=True)
    print('\nR2 已删除 %d 个对象' % deleted)
    return 0


if __name__ == '__main__':
    sys.exit(main())

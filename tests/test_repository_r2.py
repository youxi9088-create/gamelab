"""对真实 R2 + D1 验证 R2Repository 的产物发布链路。

需要：CLOUDFLARE_ACCOUNT_ID / D1_DATABASE_ID / CLOUDFLARE_API_TOKEN /
R2_BUCKET / R2_ENDPOINT / R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY。
用临时 artifact_id，结束后清理 R2 对象与 D1 登记。

用法：
    R2_BUCKET=... R2_ENDPOINT=... D1_DATABASE_ID=... \
    <venv-python> tests/test_repository_r2.py
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import tempfile
import uuid
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(ROOT))

CHECKS = []


def check(name, condition, detail=''):
    CHECKS.append((name, bool(condition), detail))
    print(('  PASS  ' if condition else '  FAIL  ') + name + ((' — ' + detail) if detail else ''))


def main():
    required = ('CLOUDFLARE_ACCOUNT_ID', 'D1_DATABASE_ID', 'CLOUDFLARE_API_TOKEN',
                'R2_BUCKET', 'R2_ENDPOINT', 'R2_ACCESS_KEY_ID', 'R2_SECRET_ACCESS_KEY')
    missing = [name for name in required if not os.environ.get(name)]
    if missing:
        print('缺少环境变量: %s' % ', '.join(missing))
        return 1

    from controlplane.repository_r2 import R2Repository
    from controlplane.store_d1 import D1Store

    d1 = D1Store()
    root = Path(tempfile.mkdtemp())
    cache = root / 'artifacts'
    repo = R2Repository(root, cache, d1_store=d1)

    artifact_id = 'artifact-selftest-' + uuid.uuid4().hex[:10]
    files = {
        'index.html': '<!doctype html><title>selftest</title><p>hello</p>',
        'assets/a.js': 'console.log(1)',
        'assets/deep/b.css': 'body{margin:0}',
    }

    print('artifact_id:', artifact_id)
    info = repo.save_artifact(artifact_id, files, 'index.html')
    check('save_artifact 返回结构', set(info) >= {'size', 'sha256', 'files', 'entry'},
          json.dumps(info, ensure_ascii=True))
    check('文件清单完整', sorted(info['files']) == sorted(files), str(sorted(info['files'])))

    # R2 侧核对
    client = repo.client()
    prefix = f'artifacts/{artifact_id}/'
    listed = {}
    for page in client.get_paginator('list_objects_v2').paginate(Bucket=repo.bucket, Prefix=prefix):
        for item in page.get('Contents', []):
            listed[item['Key'][len(prefix):]] = item['Size']
    check('R2 对象数', len(listed) == 3, str(sorted(listed)))
    check('R2 字节数一致', sum(listed.values()) == info['size'],
          'R2 %d vs info %d' % (sum(listed.values()), info['size']))

    remote = client.get_object(Bucket=repo.bucket, Key=prefix + 'assets/deep/b.css')['Body'].read()
    check('R2 内容一致', remote == b'body{margin:0}', repr(remote)[:40])

    head = client.head_object(Bucket=repo.bucket, Key=prefix + 'index.html')
    check('R2 Metadata 带 sha256', head.get('Metadata', {}).get('sha256') ==
          hashlib.sha256(files['index.html'].encode()).hexdigest())

    # D1 登记核对
    rows = d1._select('SELECT path,object_key,sha256,bytes FROM artifact_files WHERE artifact_id = ?',
                      [artifact_id])
    check('D1 登记行数', len(rows) == 3, str(len(rows)))
    by_path = {r[0]: r for r in rows}
    check('D1 object_key 与 Worker 契约一致',
          by_path.get('assets/deep/b.css', (None, None))[1] == prefix + 'assets/deep/b.css',
          str(by_path.get('assets/deep/b.css')))
    check('D1 sha256 正确',
          by_path.get('index.html', (None, None, None))[2] ==
          hashlib.sha256(files['index.html'].encode()).hexdigest())

    # 回拉：清掉本地缓存后能从 R2 拉回
    import shutil
    shutil.rmtree(cache / artifact_id)
    pulled = repo.ensure_local(artifact_id)
    check('ensure_local 回拉文件数', pulled == 3, str(pulled))
    check('回拉内容一致', (cache / artifact_id / 'assets' / 'deep' / 'b.css').read_bytes() == b'body{margin:0}')

    # 清理
    for key in list(listed):
        client.delete_object(Bucket=repo.bucket, Key=prefix + key)
    d1._post({'sql': 'DELETE FROM artifact_files WHERE artifact_id = ?', 'params': [artifact_id]})
    left = client.get_paginator('list_objects_v2').paginate(Bucket=repo.bucket, Prefix=prefix)
    remaining = sum(len(p.get('Contents', [])) for p in left)
    check('清理干净', remaining == 0, '残留 %d' % remaining)

    passed = sum(1 for _, ok, _ in CHECKS if ok)
    print('\n%d/%d 通过' % (passed, len(CHECKS)))
    print(json.dumps({'checks': len(CHECKS), 'passed': passed, 'ok': passed == len(CHECKS),
                      'artifact_id': artifact_id}, ensure_ascii=True, sort_keys=True))
    return 0 if passed == len(CHECKS) else 1


if __name__ == '__main__':
    sys.exit(main())

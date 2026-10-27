"""把不可变产物同步到 R2 并登记 D1，供云端公网试玩读取。

变体 B（平台留本地、云做门面）的产物侧适配：
- git 源码库必须留在本地（git 无法跑在对象存储上），因此 `record()` 不变。
- `save_artifact()` 先按原逻辑写入本地缓存（git 归档与本地试玩仍需要），
  再把每个文件推到 R2 的 `artifacts/<artifact_id>/<path>`，并登记进 D1
  `artifact_files`——云端 Worker 正是按这张表提供私有播放。
- 本地缓存缺失但 R2 已有该产物时（换机器/清缓存），`ensure_local()` 可回拉。

只在环境变量 R2_ARTIFACTS=1 时启用；未启用时行为与原生 Repository 完全一致。
"""
from __future__ import annotations

import hashlib
import os
from pathlib import Path

from .repository import Repository

OBJECT_NAMESPACE = 'artifacts'


class R2Repository(Repository):
    """Repository 的子类：产物额外发布到 R2。"""

    def __init__(self, root, artifacts, bucket=None, endpoint=None,
                 access_key=None, secret_key=None, account_id=None, d1_store=None):
        super().__init__(root, artifacts)
        self.bucket = bucket or os.environ.get('R2_BUCKET')
        self.endpoint = endpoint or os.environ.get('R2_ENDPOINT')
        self.access_key = access_key or os.environ.get('R2_ACCESS_KEY_ID')
        self.secret_key = secret_key or os.environ.get('R2_SECRET_ACCESS_KEY')
        self.account_id = account_id or os.environ.get('CLOUDFLARE_ACCOUNT_ID')
        self.d1_store = d1_store
        self.enabled = os.environ.get('R2_ARTIFACTS') == '1'
        if self.enabled:
            missing = [name for name, value in
                       (('R2_BUCKET', self.bucket), ('R2_ENDPOINT', self.endpoint),
                        ('R2_ACCESS_KEY_ID', self.access_key), ('R2_SECRET_ACCESS_KEY', self.secret_key))
                       if not value]
            if missing:
                raise RuntimeError('R2_ARTIFACTS=1 但缺少配置: %s' % ', '.join(missing))

    # ---- R2 客户端（惰性导入，未启用时不依赖 boto3） ----

    def client(self):
        import boto3
        from botocore.config import Config
        return boto3.client('s3', endpoint_url=self.endpoint,
                            aws_access_key_id=self.access_key,
                            aws_secret_access_key=self.secret_key,
                            region_name='auto', config=Config(signature_version='s3v4'))

    # ---- 产物发布 ----

    def save_artifact(self, artifact_id, files, entry):
        info = super().save_artifact(artifact_id, files, entry)
        if self.enabled:
            self.publish(artifact_id)
        return info

    def publish(self, artifact_id):
        """把本地缓存里的产物目录推到 R2 并登记 D1。返回 (文件数, 字节数)。"""
        source = Path(self.artifacts) / artifact_id
        if not source.is_dir():
            raise RuntimeError('产物缓存不存在: %s' % source)
        client = self.client()
        rows, total, count = [], 0, 0
        for path in sorted(p for p in source.rglob('*') if p.is_file()):
            relative = path.relative_to(source).as_posix()
            content = path.read_bytes()
            digest = hashlib.sha256(content).hexdigest()
            object_key = f'{OBJECT_NAMESPACE}/{artifact_id}/{relative}'
            client.put_object(Bucket=self.bucket, Key=object_key, Body=content,
                              Metadata={'sha256': digest})
            rows.append((artifact_id, relative, object_key, digest, len(content)))
            total += len(content)
            count += 1
        if rows and self.d1_store is not None:
            self.d1_store._batch([
                ('INSERT OR REPLACE INTO artifact_files(artifact_id,path,object_key,sha256,bytes) '
                 'VALUES (?,?,?,?,?)', list(row)) for row in rows])
        return count, total

    def ensure_local(self, artifact_id):
        """R2 上有而本地缓存缺失时回拉，供 git 归档使用。返回下载文件数。"""
        source = Path(self.artifacts) / artifact_id
        if source.is_dir():
            return 0
        client = self.client()
        paginator = client.get_paginator('list_objects_v2')
        prefix = f'{OBJECT_NAMESPACE}/{artifact_id}/'
        count = 0
        for page in paginator.paginate(Bucket=self.bucket, Prefix=prefix):
            for item in page.get('Contents', []):
                relative = item['Key'][len(prefix):]
                if not relative:
                    continue
                target = source / relative
                target.parent.mkdir(parents=True, exist_ok=True)
                body = client.get_object(Bucket=self.bucket, Key=item['Key'])['Body'].read()
                target.write_bytes(body)
                count += 1
        return count


def build_repository(root, artifacts, d1_store=None):
    """按 R2_ARTIFACTS 决定实现；未启用时返回原生 Repository。"""
    if os.environ.get('R2_ARTIFACTS') == '1':
        return R2Repository(root, artifacts, d1_store=d1_store)
    return Repository(root, artifacts)

"""把已登记产物上传到 R2，支持两种通道。

s3  ：用 R2 API 令牌经 S3 兼容端点直传，快，需要 R2_ACCESS_KEY_ID/SECRET。
rest：用现有 Cloudflare API 令牌经 api.cloudflare.com 上传，无需新凭证，但受限流。

本机出网只允许 api.cloudflare.com 与 *.r2.cloudflarestorage.com，workers.dev 被拦截，
因此不走 Worker 的 /api/executor 上传端点。两者都写入 sha256 元数据，与 Worker 契约一致。
"""
import argparse
import hashlib
import json
import os
import sys
import threading
import time
import urllib.error
import urllib.parse
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

API_ROOT = 'https://api.cloudflare.com/client/v4'
DEFAULT_CONCURRENCY = 8
REST_RATE = 3.5  # 请求/秒，保守低于 1200 次/5 分钟
RETRY_STATUS = {408, 429, 500, 502, 503, 504}
MULTIPART_THRESHOLD = 64 * 1024 * 1024


class UploadError(RuntimeError):
    """只携带可回显的信息，不含令牌或本地绝对路径。"""


class RateLimiter:
    def __init__(self, rate):
        self.interval = 1.0 / rate if rate > 0 else 0
        self.lock = threading.Lock()
        self.next_at = 0.0

    def wait(self):
        with self.lock:
            now = time.monotonic()
            if self.next_at > now:
                time.sleep(self.next_at - now)
            self.next_at = max(now, self.next_at) + self.interval


def sha256_file(path):
    digest = hashlib.sha256()
    with open(path, 'rb') as stream:
        for chunk in iter(lambda: stream.read(1 << 20), b''):
            digest.update(chunk)
    return digest.hexdigest()


class RestBackend:
    def __init__(self, account, bucket, token, limiter):
        self.account, self.bucket, self.token, self.limiter = account, bucket, token, limiter

    def url(self, key):
        quoted = urllib.parse.quote(key, safe='/')
        return f'{API_ROOT}/accounts/{self.account}/r2/buckets/{self.bucket}/objects/{quoted}'

    def _request(self, method, key, body=None, timeout=120):
        request = urllib.request.Request(self.url(key), data=body, method=method)
        request.add_header('Authorization', 'Bearer ' + self.token)
        if body is not None:
            request.add_header('Content-Type', 'application/octet-stream')
        try:
            with urllib.request.urlopen(request, timeout=timeout) as response:
                return response.status
        except urllib.error.HTTPError as error:
            return error.code

    def exists(self, key):
        self.limiter.wait()
        return self._request('HEAD', key, timeout=60) == 200

    def put(self, key, path, sha256):
        with open(path, 'rb') as stream:
            body = stream.read()
        for attempt in range(3):
            self.limiter.wait()
            status = self._request('PUT', key, body=body)
            if 200 <= status < 300:
                return
            if status in RETRY_STATUS and attempt < 2:
                time.sleep(2 ** attempt)
                continue
            raise UploadError(f'上传失败 HTTP {status}')
        raise UploadError('上传未完成')


class S3Backend:
    def __init__(self, account, bucket):
        from boto3 import client
        from botocore.config import Config
        key_id = os.environ.get('R2_ACCESS_KEY_ID')
        secret = os.environ.get('R2_SECRET_ACCESS_KEY')
        if not key_id or not secret:
            raise UploadError('缺少 R2_ACCESS_KEY_ID / R2_SECRET_ACCESS_KEY 环境变量')
        self.bucket = bucket
        self.s3 = client('s3', endpoint_url=f'https://{account}.r2.cloudflarestorage.com',
                         aws_access_key_id=key_id, aws_secret_access_key=secret, region_name='auto',
                         config=Config(signature_version='s3v4', retries={'max_attempts': 3, 'mode': 'standard'}))
        from boto3.s3.transfer import TransferConfig
        self.transfer = TransferConfig(multipart_threshold=MULTIPART_THRESHOLD, max_concurrency=4)

    def exists(self, key):
        try:
            self.s3.head_object(Bucket=self.bucket, Key=key)
            return True
        except Exception:
            return False

    def put(self, key, path, sha256):
        with open(path, 'rb') as stream:
            self.s3.upload_fileobj(stream, self.bucket, key, ExtraArgs={'Metadata': {'sha256': sha256}},
                                   Config=self.transfer)


def upload_one(entry, backend, verify):
    key = entry['object_key']
    path = Path(entry['source_path'])
    if not path.is_file():
        raise UploadError(f'清单文件缺失：{entry["artifact_id"]}/{entry["path"]}')
    if verify:
        actual = sha256_file(path)
        if actual != entry['sha256']:
            raise UploadError(f'校验和与清单不一致：{entry["artifact_id"]}/{entry["path"]}')
    if backend.exists(key):
        return entry['bytes'], True
    backend.put(key, path, entry['sha256'])
    return entry['bytes'], False


def main(argv=None):
    parser = argparse.ArgumentParser(description='上传已登记产物到 R2')
    parser.add_argument('--manifest', required=True)
    parser.add_argument('--account', required=True)
    parser.add_argument('--bucket', required=True)
    parser.add_argument('--mode', choices=('auto', 's3', 'rest'), default='auto')
    parser.add_argument('--token-env', default='CLOUDFLARE_API_TOKEN')
    parser.add_argument('--concurrency', type=int, default=DEFAULT_CONCURRENCY)
    parser.add_argument('--rate', type=float, default=REST_RATE)
    parser.add_argument('--verify', action='store_true', help='上传前重算 sha256 与清单比对')
    parser.add_argument('--limit', type=int, default=0, help='只处理前 N 个文件，用于试跑')
    args = parser.parse_args(argv)

    files = (json.loads(Path(args.manifest).read_text('utf-8')).get('files') or [])
    if args.limit:
        files = files[: args.limit]
    if not files:
        print('清单中没有待上传文件')
        return 1

    mode = args.mode
    if mode == 'auto':
        mode = 's3' if os.environ.get('R2_ACCESS_KEY_ID') and os.environ.get('R2_SECRET_ACCESS_KEY') else 'rest'
    if mode == 's3':
        backend = S3Backend(args.account, args.bucket)
    else:
        token = os.environ.get(args.token_env)
        if not token:
            print(f'环境变量 {args.token_env} 未提供令牌', file=sys.stderr)
            return 1
        backend = RestBackend(args.account, args.bucket, token, RateLimiter(args.rate))
    print(f'上传通道：{mode}', flush=True)

    uploaded = skipped = total_bytes = 0
    failures = []
    started = time.time()
    with ThreadPoolExecutor(max_workers=args.concurrency) as pool:
        futures = {pool.submit(upload_one, entry, backend, args.verify): entry for entry in files}
        for index, future in enumerate(as_completed(futures), 1):
            try:
                size, was_skipped = future.result()
                if was_skipped:
                    skipped += 1
                else:
                    uploaded += 1
                total_bytes += size
            except UploadError as error:
                failures.append(str(error))
            except Exception as error:  # 网络等异常不回显令牌或路径
                failures.append(f'上传异常：{type(error).__name__}')
            if index % 50 == 0 or index == len(files):
                elapsed = time.time() - started
                rate = index / elapsed if elapsed else 0
                remaining = (len(files) - index) / rate if rate else 0
                print(f'{index}/{len(files)} 上传={uploaded} 跳过={skipped} 失败={len(failures)} '
                      f'{rate:.1f} 个/秒 剩余约 {remaining / 60:.0f} 分钟', flush=True)

    print(json.dumps({'mode': mode, 'files': len(files), 'uploaded': uploaded, 'skipped': skipped,
                      'failed': len(failures), 'bytes': total_bytes,
                      'seconds': round(time.time() - started)}, ensure_ascii=True, indent=2))
    for message in failures[:20]:
        print(message, file=sys.stderr)
    return 1 if failures else 0


if __name__ == '__main__':
    sys.exit(main())

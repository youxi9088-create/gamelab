"""重新生成云端门户状态并上传到 R2。

每次往 D1 同步数据后都要跑一次，否则云端门户会一直展示上一次的快照。
流程：Node（走环境代理连 D1 REST）生成核心 JSON → boto3 上传到 R2 → HEAD 校验。
"""
import json
import subprocess
import sys
from pathlib import Path

import boto3
from botocore.client import Config

ROOT = Path(__file__).resolve().parent.parent
NODE = r'C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2-6/node.exe'
ACCOUNT = None
BUCKET = 'gamelab-migration-private'
KEY = 'portal/state-core.json'


def endpoint():
    import os
    return f"https://{os.environ['CLOUDFLARE_ACCOUNT_ID']}.r2.cloudflarestorage.com"


def main():
    import os
    target = ROOT / 'migration-private' / 'portal-state-core.json'
    target.parent.mkdir(exist_ok=True)

    result = subprocess.run(
        [NODE, str(ROOT / 'tools/build_portal_state_core.mjs'), str(target)],
        capture_output=True, text=True, encoding='utf-8', check=False,
        env={**os.environ, 'NODE_USE_ENV_PROXY': '1'})
    if result.returncode != 0:
        print('生成失败:', result.stderr[-2000:])
        return 1
    print('已生成:', result.stdout.strip())

    client = boto3.client('s3', endpoint_url=endpoint(),
                          aws_access_key_id=os.environ['R2_ACCESS_KEY_ID'],
                          aws_secret_access_key=os.environ['R2_SECRET_ACCESS_KEY'],
                          config=Config(signature_version='s3v4'), region_name='auto')
    data = target.read_bytes()
    client.put_object(Bucket=BUCKET, Key=KEY, Body=data,
                      ContentType='application/json; charset=utf-8')
    head = client.head_object(Bucket=BUCKET, Key=KEY)
    print(json.dumps({'uploaded': KEY, 'bytes': head['ContentLength'],
                      'generated_at': json.loads(data)['state_generated_at']}, ensure_ascii=False))
    return 0


if __name__ == '__main__':
    sys.exit(main())

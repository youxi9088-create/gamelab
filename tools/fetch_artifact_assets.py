"""把本地运行包里缺失的资源从原站补齐。

背景：Cocos 分包资源（`assets/<bundle>/import/<xx>/<uuid>.<crc>.json`）的文件名带
构建期校验后缀，无法从 config 的 uuid 列表推导，只能"观测到 404 再回源补"。
离线验证只走到开局场景，后面关卡/主界面的资源请求没被覆盖，试玩时才暴露。

用法：
  python tools/fetch_artifact_assets.py <artifact-dir> <origin-base>
        [--path assets/home/import/02/02138c176.62212.json ...]
  例：python tools/fetch_artifact_assets.py data/artifacts/artifact-xxx \
        https://static.17yoo.cn/gamebox/80004 --scan

--scan  扫描各分包 index.js/config 里引用的 import 文件，缺失的一并补。
"""
import argparse
import json
import re
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

IMPORT_REF = re.compile(r'import/[0-9a-f]{2}/[0-9a-f]+\.\d+\.json')
UA = ('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
      '(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36')


def fetch(base, rel, tries=3):
    url = base.rstrip('/') + '/' + rel.lstrip('/')
    for attempt in range(tries):
        try:
            request = urllib.request.Request(url, headers={'User-Agent': UA})
            with urllib.request.urlopen(request, timeout=60) as response:
                return response.read()
        except urllib.error.HTTPError as error:
            if error.code == 404:
                return None
        except (urllib.error.URLError, OSError):
            pass
        time.sleep(1.5 * (attempt + 1))
    return None


def scan_missing(root):
    """逐个分包扫描引用到的 import 文件，返回相对包根目录的缺失清单。"""
    missing = []
    for bundle in sorted(p for p in (root / 'assets').iterdir() if p.is_dir()):
        for candidate in list(bundle.glob('index.js')) + list(bundle.glob('config*.json')):
            try:
                text = candidate.read_text('utf-8', errors='ignore')
            except OSError:
                continue
            for ref in IMPORT_REF.findall(text):
                rel = f'assets/{bundle.name}/{ref}'
                if not (root / rel).exists() and rel not in missing:
                    missing.append(rel)
    return missing


def missing_from_runtime(report):
    """从 evidence/runtime.json 的 missing 清单取相对路径（都是 '/assets/...' 形式）。"""
    try:
        payload = json.loads(Path(report).read_text('utf-8'))
    except (OSError, ValueError):
        return []
    return [p if p.startswith('/') else '/' + p for p in (payload.get('missing') or []) if p]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('artifact')
    parser.add_argument('origin')
    parser.add_argument('--path', action='append', default=[], help='显式指定缺失的相对路径，可重复')
    parser.add_argument('--scan', action='store_true', help='扫描分包引用并补齐缺失')
    parser.add_argument('--from-runtime', help='直接读 evidence/runtime.json 的 missing 清单')
    args = parser.parse_args()

    root = Path(args.artifact)
    if not root.is_dir():
        sys.exit('找不到运行包目录：' + str(root))

    targets = list(args.path)
    if args.from_runtime:
        targets += missing_from_runtime(args.from_runtime)
    if args.scan:
        targets += scan_missing(root)
    targets = list(dict.fromkeys(targets))
    if not targets:
        print('没有需要补齐的资源'); return

    ok, failed = [], []
    for raw in targets:
        # runtime.json 的缺失路径带前导 '/'，直接 join 会变成绝对路径写到盘根，
        # 而不是运行包里——必须去掉前导分隔符再拼。
        rel = raw.lstrip('/')
        destination = root / rel
        if not str(destination.resolve()).startswith(str(root.resolve())):
            print('路径越界，跳过：' + raw); continue
        if destination.exists():
            print('已存在，跳过：' + rel); continue
        payload = fetch(args.origin, rel)
        if payload is None:
            failed.append(rel); print('原站也没有：' + rel); continue
        destination.parent.mkdir(parents=True, exist_ok=True)
        destination.write_bytes(payload)
        ok.append(rel)
        print(f'已补齐 {rel}（{len(payload)} 字节）')
    print(f'\n共补齐 {len(ok)} 个，原站缺失 {len(failed)} 个')
    for rel in failed:
        print('  ' + rel)


if __name__ == '__main__':
    main()

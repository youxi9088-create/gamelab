"""云端看板与本地平台实现的一致性校验。

为什么需要它：cloudflare/portal.mjs 里的 game_totals / overview 是 controlplane
同名的 JS 移植。靠"看起来对"没有说服力，所以拿同一份迁移库分别跑两边再逐字段比对。
任何一处口径漂移（排序方向、区间并集、report 裁剪）都会在这里暴露。
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
PRIVATE = ROOT / 'migration-private'
NODE = r'C:/Users/Administrator/.workbuddy/binaries/node/versions/22.22.2-6/node.exe'
PYTHON = sys.executable

COMPARE_KEYS = ['games_count', 'calls', 'unknown_calls', 'timing_complete', 'timing_measured',
                'median_seconds', 'weekly_accepted', 'previous_week_accepted', 'weekly_published',
                'token_coverage', 'engines', 'engine_game_counts', 'models', 'failure_reasons',
                'production', 'production_evidence']


def close(x, y):
    if isinstance(x, (int, float)) and isinstance(y, (int, float)):
        return abs(x - y) <= 1e-6
    return x == y


def main():
    local = json.loads(subprocess.run(
        [PYTHON, str(ROOT / 'tools/crosscheck_dashboard.py')],
        capture_output=True, text=True, check=True, encoding='utf-8').stdout)
    cloud = json.loads(subprocess.run(
        [NODE, str(ROOT / 'cloudflare/tests/dump-dashboard.mjs')],
        capture_output=True, text=True, check=True, encoding='utf-8').stdout)

    failures = []
    for key in COMPARE_KEYS:
        if not close(local.get(key), cloud.get(key)):
            failures.append(f'{key}: 本地={local.get(key)!r} 云端={cloud.get(key)!r}')

    local_rows = {r[0]: r for r in local['rows']}
    cloud_rows = {r[0]: r for r in cloud['rows']}
    if local_rows.keys() != cloud_rows.keys():
        failures.append(f'游戏集合不同: 缺={set(local_rows) - set(cloud_rows)} 多={set(cloud_rows) - set(local_rows)}')
    for cid in sorted(set(local_rows) & set(cloud_rows)):
        for index, (a, b) in enumerate(zip(local_rows[cid], cloud_rows[cid])):
            if not close(a, b):
                failures.append(f'{cid} 字段#{index}: 本地={a!r} 云端={b!r}')

    print(f'游戏 {len(cloud_rows)} 款 · 调用 {cloud.get("calls")} 次 · 引擎 {len(cloud.get("engines", []))} 类')
    for line in failures:
        print('  FAIL ', line)
    ok = not failures
    print(f'\n{"一致" if ok else "存在漂移"}：{len(failures)} 处差异')
    print(json.dumps({'ok': ok, 'failures': failures, 'games': len(cloud_rows)}, ensure_ascii=False))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())

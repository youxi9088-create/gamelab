"""公网验收：真实登录 Cloudflare 站点，确认游戏明细面板的数据已经到位。

本地跑通不算验证——用户要看的是公网浏览器。这里用与浏览器一致的请求序列
（登录拿会话 Cookie → 取 /api/state），断言 dashboard.js 消费的字段齐备。
"""
import http.cookiejar
import json
import sys
import urllib.error
import urllib.request
from pathlib import Path

BASE = 'https://gamelab-migration.youxi9088.workers.dev'
ROOT = Path(__file__).resolve().parent.parent
ACCOUNTS = json.loads((ROOT / 'migration-private/new-passwords.json').read_text(encoding='utf-8'))

REQUIRED = ['title', 'engine', 'route', 'job_id', 'status', 'stage', 'status_age_seconds', 'reason',
            'round', 'accepted', 'costs', 'unknown_cost_calls', 'retry_tokens', 'retry_unknown_calls',
            'supply_status', 'supply_reason', 'supply_error', 'supply_age_seconds', 'duration_seconds',
            'unpaired_events', 'known_token_fields', 'input_tokens', 'output_tokens',
            'input_known_calls', 'output_known_calls', 'unknown_usage_calls', 'cache_known_calls',
            'cached_input_tokens', 'cache_write_tokens', 'calls', 'candidate_id']
SUMMARY = ['weekly_accepted', 'previous_week_accepted', 'token_coverage', 'calls', 'unknown_calls',
           'timing_complete', 'timing_measured', 'games_count', 'median_seconds', 'first_pass_note']


def main():
    jar = http.cookiejar.CookieJar()
    opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

    username, password = 'preview-admin', ACCOUNTS['preview-admin']
    request = urllib.request.Request(
        f'{BASE}/api/auth/login', method='POST',
        data=json.dumps({'username': username, 'password': password}).encode('utf-8'),
        headers={'Content-Type': 'application/json', 'Origin': BASE})
    try:
        with opener.open(request, timeout=90) as response:
            print(f'登录 {response.status} · 账号 {username}')
    except urllib.error.HTTPError as error:
        print('登录失败', error.status, error.read().decode('utf-8', 'replace')[:300])
        return 1
    if not any(cookie.name == 'replica_session' for cookie in jar):
        print('未拿到会话 Cookie')
        return 1

    with opener.open(f'{BASE}/api/state', timeout=120) as response:
        payload = json.loads(response.read().decode('utf-8'))
    print(f'/api/state {response.status} · {response.headers.get("Content-Length") or "?"} 字节')

    failures = []
    dash = payload.get('dashboard_operations')
    if not isinstance(dash, dict) or not dash.get('games'):
        print('FAIL dashboard_operations 缺失或为空 —— 前端会一直停在"正在获取游戏明细…"')
        return 1
    missing = [key for key in REQUIRED if key not in dash['games'][0]]
    if missing:
        failures.append(f'游戏行缺字段: {missing}')
    absent = [key for key in SUMMARY if key not in dash]
    if absent:
        failures.append(f'汇总缺字段: {absent}')
    if not dash.get('engines') or not dash.get('models'):
        failures.append('引擎或模型分组为空')

    print(f"游戏 {dash['games_count']} 款 · 调用 {dash['calls']} 次 · "
          f"引擎 {len(dash['engines'])} 类 · 模型 {len(dash['models'])} 个 · "
          f"计时闭合 {dash['timing_complete']}/{dash['timing_measured']} · "
          f"中位耗时 {dash.get('median_seconds')} 秒")
    print('示例:', json.dumps({k: dash['games'][0][k] for k in
                              ('title', 'engine', 'status', 'duration_seconds', 'calls', 'known_token_fields')},
                             ensure_ascii=False))
    for line in failures:
        print('FAIL', line)
    ok = not failures
    print('\n' + ('通过：公网门户已能提供游戏明细数据' if ok else '未通过'))
    return 0 if ok else 1


if __name__ == '__main__':
    sys.exit(main())

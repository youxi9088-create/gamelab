"""把 .env 里的 AI 配置写进 data/services.json，让平台立即可用。

为什么需要这一步：平台不读 .env。`ai_config()` 的取值顺序是
data/services.json 的 ai 段 → 环境变量 REPLICA_AI_*。services.json 是文件、
每次调用都重读，所以改完立刻生效，不必重启服务（重启反而更麻烦）。

两个文件都在 .gitignore 里（.env / data/），密钥不会进 Git。

用法：python tools/sync_ai_config.py [--check]
      --check 只验证连通性并列出可用模型，不写配置。
"""
import json
import os
import pathlib
import re
import sys
import urllib.error
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parents[1]
ENV_FILE = ROOT / '.env'
SERVICES = ROOT / 'data' / 'services.json'
NO_PROXY = {'http': '', 'https': ''}


def read_env():
    values = {}
    if not ENV_FILE.exists():
        return values
    for line in ENV_FILE.read_text('utf-8').splitlines():
        line = line.strip()
        if not line or line.startswith('#') or '=' not in line:
            continue
        key, _, value = line.partition('=')
        values[key.strip()] = value.strip().strip('"').strip("'")
    return values


def models(base_url, api_key):
    request = urllib.request.Request(base_url.rstrip('/') + '/models',
                                     headers={'Authorization': f'Bearer {api_key}'})
    with urllib.request.urlopen(request, timeout=30) as response:
        return [item['id'] for item in json.loads(response.read()).get('data', [])]


def main():
    env = {**os.environ, **read_env()}
    base_url = env.get('REPLICA_AI_BASE_URL', '').strip()
    api_key = env.get('REPLICA_AI_API_KEY', '').strip()
    model = env.get('REPLICA_AI_MODEL', '').strip()
    if not base_url or not api_key:
        print('缺少 REPLICA_AI_BASE_URL 或 REPLICA_AI_API_KEY（在 .env 里填）')
        return 1
    print(f'端点: {base_url}')
    try:
        available = models(base_url, api_key)
    except urllib.error.HTTPError as error:
        print(f'连通失败 HTTP {error.status}: {error.read().decode("utf-8", "replace")[:300]}')
        return 1
    except Exception as error:  # noqa: BLE001 - 网络异常种类多，统一回报
        print(f'连通失败: {type(error).__name__}: {error}')
        return 1
    print('可用模型:', ', '.join(available) or '（列表为空）')
    if not model:
        # 优先选带 k2 / 大上下文的模型，其次取列表里最后一个（通常最新）
        preferred = [m for m in available if re.search(r'k2|k1', m, re.I)]
        model = (preferred or available or [''])[-1]
        print(f'未指定模型，自动选用: {model}')
    if model not in available:
        print(f'警告: 指定的 {model} 不在可用列表里')

    if '--check' in sys.argv:
        print('（--check 模式，未写入）')
        return 0
    data = json.loads(SERVICES.read_text('utf-8')) if SERVICES.exists() else {}
    data['ai'] = {'backend': 'api', 'base_url': base_url, 'api_key': api_key,
                  'model': model, 'wire_api': 'chat_completions'}
    SERVICES.parent.mkdir(exist_ok=True)
    SERVICES.write_text(json.dumps(data, ensure_ascii=False, indent=1), 'utf-8')
    print(f'已写入 {SERVICES} → model={model}（密钥不打印）')
    return 0


if __name__ == '__main__':
    sys.exit(main())

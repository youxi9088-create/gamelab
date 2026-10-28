"""Named AI connections; credentials never cross connection profiles."""
from urllib.parse import urlsplit

DEFAULTS = {
    'local_codex': dict(backend='api', base_url='http://127.0.0.1:8877/v1', model='local-codex', wire_api='chat_completions'),
    'cloud_codex': dict(backend='codex_api', base_url='https://ai.botclaw.top/v1', model='gpt-6-sol', wire_api='responses'),
    'codex_account': dict(backend='codex_account', account_email='', model='gpt-6-sol', wire_api='responses'),
    'openai': dict(backend='api', base_url='https://api.openai.com/v1', model='gpt-6-sol', wire_api='responses'),
    'compatible': dict(backend='api', base_url='https://ai.botclaw.top/v1', model='gpt-6-sol', wire_api='responses'),
}
LABELS = {'codex_account': 'Codex 账号（云服务器）', 'cloud_codex': '云服务器 Codex CLI', 'local_codex': '本地 Codex（独立账号）', 'openai': 'OpenAI 官方 API', 'compatible': 'OpenAI 兼容 API',
          'server_codex': '服务器 Codex（旧配置）', 'legacy_auto': 'API 优先、服务器 Codex 备用（旧配置）'}


def connection_id(config):
    if config.get('connection') in LABELS:
        return config['connection']
    if config.get('backend') == 'codex':
        return 'server_codex'
    if config.get('backend', 'auto') == 'auto':
        return 'legacy_auto'
    if config.get('model') == 'local-codex':
        return 'local_codex'
    return 'openai' if config.get('base_url', '').rstrip('/') == DEFAULTS['openai']['base_url'] else 'compatible'


def profiles(data, current):
    result = {k: dict(v) for k, v in data.get('ai_profiles', {}).items() if k in LABELS and isinstance(v, dict)}
    if current:
        result[connection_id(current)] = dict(current)
    return result


def public_config(config):
    headers = config.get('http_headers') or {}
    return dict(base_url=config.get('base_url', ''), model=config.get('model', ''), account_email=config.get('account_email', ''),
                wire_api=config.get('wire_api', 'chat_completions'), has_key=bool(config.get('api_key')),
                has_actor_authorization=bool(headers.get('x-openai-actor-authorization')))


def credential_scope(url):
    p = urlsplit(url)
    return (p.scheme, p.hostname, p.port, p.path.rstrip('/'))

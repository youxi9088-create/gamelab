"""Dedicated server-side ChatGPT login, separate from desktop credentials."""
import base64
import hashlib
import json
import os
import re
from pathlib import Path
from .ai_provider import AIProviderError


def normalize_email(value):
    email = str(value).strip().lower()
    if len(email) > 254 or not re.fullmatch(r'[a-z0-9._+\-]+@[a-z0-9.\-]+\.[a-z]{2,}', email):
        raise ValueError('请填写有效的 Codex 账号邮箱')
    return email


def account_home(email):
    email = normalize_email(email)
    root = os.environ.get('GAMELAB_SHARED_ROOT')
    if not root:
        raise AIProviderError('Codex 账号服务需要配置云服务器共享目录')
    return Path(root) / 'config' / 'codex-accounts' / hashlib.sha256(email.encode()).hexdigest()[:24]


def require_account(email):
    home = account_home(email)
    try:
        auth = json.loads((home / 'auth.json').read_text('utf-8'))
        token = auth['tokens']['id_token']
        payload = token.split('.')[1]
        claims = json.loads(base64.urlsafe_b64decode(payload + '=' * (-len(payload) % 4)))
        actual = claims.get('email') or (claims.get('https://api.openai.com/profile') or {}).get('email')
        if normalize_email(actual) != normalize_email(email):
            raise ValueError('account mismatch')
        if not auth['tokens'].get('refresh_token'):
            raise ValueError('missing login')
    except (OSError, ValueError, KeyError, TypeError, IndexError):
        raise AIProviderError('Codex 账号尚未授权或登录邮箱不匹配，请完成该账号的服务器登录') from None
    # This reads the cached identity only; the CLI validates/refreshes the token
    # with OpenAI. Only an actual successful inference means connected.
    return home

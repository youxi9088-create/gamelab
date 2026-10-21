"""Read-only catalog dimensions, shared across all import/conversion paths."""
import re
from .source_routing import source_kind


def facets(candidate, aliases=None):
    aliases = aliases or {}
    raw = str(candidate.get('category') or '').strip()
    parts = [p.strip() for p in re.split(r'[/／,，|·]', raw) if p.strip()]
    platforms = {'微信小游戏', 'web游戏', 'web', 'cocos', 'cocos creator'}
    categories = list(dict.fromkeys(aliases.get(p.lower(), p) for p in parts
                                    if p.lower() not in platforms)) or ['未分类']
    kind = source_kind(candidate.get('url', ''), candidate.get('observations'))
    engines = []
    if kind == 'wechat' or '微信小游戏' in parts:
        engines.append('微信小游戏')
    elif kind == 'web':
        engines.append('Web 游戏')
    if re.search(r'\bcocos\b', str(candidate.get('engine') or ''), re.I):
        engines.append('Cocos')
    return {'categories': categories, 'engines': engines or ['待识别']}

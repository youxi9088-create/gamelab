"""Read-only catalog dimensions, shared across all import/conversion paths."""
import re
from .source_routing import source_kind


def effective_engine(candidate, versions):
    """Use version evidence for missing engine labels; never rewrite stored history."""
    current = str(candidate.get('engine') or '').strip()
    if current and current.lower() not in ('待分析', '待识别', '未识别', 'unknown'):
        return current
    names = {'discovered-web-cocos2': 'Cocos 2',
             'discovered-web-ruffle': 'Ruffle / Flash'}
    matching = sorted((v for v in versions if v.get('candidate_id') == candidate.get('id')),
                      key=lambda v: v.get('created_at', ''), reverse=True)
    for version in matching:
        report = version.get('report') or {}
        if not isinstance(report, dict):
            continue
        engine = report.get('engine') or names.get(report.get('recovery_kind'))
        if isinstance(engine, str) and engine.strip() and engine.lower() not in ('待分析', '待识别', '未识别', 'unknown'):
            return engine.strip()[:120]
    return current or '未识别'


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

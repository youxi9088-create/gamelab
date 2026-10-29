"""Read-only catalog dimensions, shared across all import/conversion paths."""
import re
from .source_routing import source_kind


def effective_engine(candidate, versions, acquisition=None):
    """Use version evidence for missing engine labels; never rewrite stored history.

    ``acquisition`` maps candidate id -> engine label detected while the original
    build was fetched. It only fills candidates no converted version has spoken
    for yet, so a successful conversion always outranks the earlier guess.
    """
    current = str(candidate.get('engine') or '').strip()
    if current and current.lower() not in ('待分析', '待识别', '未识别', 'unknown'):
        return current
    names = {'discovered-web-cocos2': 'Cocos 2',
             'discovered-web-three': 'Three.js',
             'discovered-web-defold': 'Defold',
             'discovered-web-browser': '通用 Web 运行包',
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
    evidence = (acquisition or {}).get(candidate.get('id'))
    if isinstance(evidence, str) and evidence.strip():
        return evidence.strip()[:120]
    return current or '未识别'


def facets(candidate, aliases=None):
    aliases = aliases or {}
    raw = str(candidate.get('category') or '').strip()
    parts = [p.strip() for p in re.split(r'[/／,，|·]', raw) if p.strip()]
    platforms = {'微信小游戏', 'web游戏', 'web', 'cocos', 'cocos creator'}
    categories = list(dict.fromkeys(aliases.get(p.lower(), p) for p in parts
                                    if p.lower() not in platforms)) or ['未分类']
    # Cocos wins over the platform bucket: a Cocos game is not also a generic
    # Web game. Every flavour (cocos, cocos2, Cocos Creator, cocos2d-x) lands in
    # the single "Cocos" bucket so the catalogue does not split one engine three
    # ways. Substring, not word-boundary: "cocos2d-x" has no boundary after "cocos".
    if 'cocos' in str(candidate.get('engine') or '').lower():
        return {'categories': categories, 'engines': ['Cocos']}
    kind = source_kind(candidate.get('url', ''), candidate.get('observations'))
    engines = []
    if kind == 'wechat' or '微信小游戏' in parts:
        engines.append('微信小游戏')
    elif kind == 'web':
        engines.append('Web 游戏')
    return {'categories': categories, 'engines': engines or ['待识别']}

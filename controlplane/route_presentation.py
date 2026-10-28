"""Readable production line for one task.

The stored ``route`` field only records the *outcome* axis (A recovered /
B reconstructed / local continuation) and is written when a version reaches
review, so every queued task shows ``route=None`` and the UI collapsed them
all into one placeholder.  Operators need the production line before that:
网页采集 · 本地运行包 / AI 复刻 / REA 反编译 / 原版整理 ...

This module derives the line from the strongest available evidence and never
mutates stored jobs.  Continuations inherit the line of their base version,
because a revision round does not switch production line.
"""
from .source_routing import source_kind

_WEB_PREFIX = 'discovered-web-'

_ENGINES = {'discovered-web-cocos2': 'Cocos 2',
            'discovered-web-three': 'Three.js',
            'discovered-web-defold': 'Defold',
            'discovered-web-browser': '通用 Web 运行包',
            'discovered-web-browser-dom': '通用 Web 运行包',
            'discovered-web-ruffle': 'Ruffle / Flash'}

_AI = ('AI 复刻', 'yellow', '未取得原版可运行产物，由 AI 依据采集证据重写玩法（B 路）。')

# label, tone, detail
_KINDS = {
    'provided_source': ('原版源码整理', 'green',
                        '已提供原版源码：整理依赖并打包为可运行产物，保留原版实现，不重写玩法。'),
    'provided-static-source-normalized': ('REA 静态整理', 'green',
                                          'REA 静态分析后归一整理源码，保留原版实现，未改动玩法。'),
    'bundle-preserved': ('原包保留', 'green',
                         '保留原运行包结构与依赖清单，仅做本地运行适配。'),
    'wxapkg-service': ('小程序包转换', 'green',
                       '微信小游戏 wxapkg 原包经转换服务产出，保留原版资源。'),
    'external-converter': ('外部转换服务', 'green',
                           '由已配置的外部转换服务产出原包转换结果。'),
    'rea-embedded-web': ('网页内嵌还原', 'green',
                         'REA 定位页面内嵌的游戏 HTML 与配置后还原运行，保留原版资源。'),
    'configured-web-snapshot': ('网页快照适配', 'green',
                                '按已配置 Web 档案的快照适配运行。'),
}

_MODES = {
    'original-client-local-rules': ('原客户端 · 本地规则重建', 'green',
                                    '取自微信缓存的原客户端代码与原资源，只把联网规则改为本地规则；'
                                    '不是 AI 玩法重写，也不是原服务端还原。'),
}

_ACQUISITIONS = {
    'wechat-cache': ('微信缓存原包提取', 'green',
                     '从本机微信缓存提取原包代码与资源后本地化运行。'),
}

# Older rounds predate recovery_kind; their report type still names the line.
_TYPES = {
    'recovered-release-web-adaptation': ('REA 反编译 · Web 适配', 'green',
                                         'REA 还原发行版运行包后做浏览器适配，保留原版代码与资源。'),
}

_REA_ADAPTATION = ('REA 反编译 · Web 适配', 'green',
                   'REA 还原原包后做浏览器适配，保留原版代码与资源。')

_UNKNOWN = ('待分流', 'gray', '尚未取得来源或产出证据，产线待定。')


def _from_kind(kind):
    """Map a stored recovery_kind to a line; None when the kind is unknown."""
    kind = str(kind or '').strip()
    if not kind:
        return None
    if kind.startswith(_WEB_PREFIX):
        engine = _ENGINES.get(kind) or kind[len(_WEB_PREFIX):]
        return ('网页采集 · 本地运行包', 'green',
                '采集原站 %s 资源并落地为本地运行包；保留原版资源，不做 AI 玩法重写。' % engine)
    return _KINDS.get(kind)


def _from_report(report):
    """Strongest signal first; reports of different rounds carry different keys."""
    report = report if isinstance(report, dict) else {}
    found = _from_kind(report.get('recovery_kind'))
    if found:
        return found
    found = _MODES.get(report.get('reconstruction_mode'))
    if found:
        return found
    found = _TYPES.get(report.get('type'))
    if found:
        return found
    if isinstance(report.get('rea'), dict) and isinstance(report.get('recovery'), dict):
        return _REA_ADAPTATION
    if report.get('source_recovery'):
        return ('原包恢复 · Web 适配', 'green',
                '恢复原包编译后脚本与资源，再做浏览器适配；不是 AI 玩法重写。')
    if report.get('resource_provenance'):
        # 原资源 + 重写逻辑：资源来自原站，玩法由 AI 重写，不能算原版产物。
        return ('AI 复刻 · 沿用原资源', 'yellow',
                '沿用原站美术与场景资源，运行与玩法逻辑由 AI 重写（B 路）。')
    acquisition = report.get('source_acquisition')
    if isinstance(acquisition, dict):
        return _ACQUISITIONS.get(acquisition.get('kind'))
    return None


def _from_version_chain(versions, base_id, hops=8):
    """A continuation keeps the line of the version it revises."""
    by_id = {v.get('id'): v for v in (versions or ()) if v.get('id')}
    seen = set()
    current = base_id
    while current and current not in seen and hops > 0:
        seen.add(current)
        hops -= 1
        version = by_id.get(current)
        if not version:
            return None
        found = _from_report(version.get('report'))
        if found:
            return found
        if version.get('route') == 'B':
            return _AI
        current = version.get('base_version_id')
    return None


def _planned(job, candidate):
    """No round evidence yet: infer the line the task was dispatched for."""
    candidate = candidate or {}
    inp = job.get('input') if isinstance(job.get('input'), dict) else {}
    url = candidate.get('url') or inp.get('url') or ''
    observations = candidate.get('observations') or inp.get('observations') or {}
    kind = source_kind(url, observations)
    stage = job.get('stage')
    if kind == 'wechat':
        return ('REA 反编译', 'gray',
                '微信小游戏来源：先采集原包并做 REA 反编译与依赖闭合；取不到原版可运行产物才转 AI 复刻。')
    if stage == 'reconstruct':
        return _AI
    if stage == 'packaging':
        return ('运行包整理', 'green', '整理本地运行包：资源闭合、入口与宿主适配。')
    if kind == 'web' or job.get('web_only'):
        return ('网页采集 · 本地运行包', 'green',
                '按 Web 来源策略采集原站资源并落地为本地运行包；引擎待检测，不预设 AI 重写。')
    if stage == 'rea':
        return ('REA 分析', 'gray',
                '来源未识别：先采集并做 REA 静态分析，再决定原版整理或 AI 复刻。')
    return _UNKNOWN


def route(job, candidate=None, versions=()):
    """Return the production line of a task as display-ready fields."""
    job = job or {}
    versions = list(versions or ())
    evidence = _from_report(job.get('report'))
    if not evidence:
        evidence = _from_version_chain(versions, job.get('base_version_id'))
    if not evidence:
        for version in sorted((v for v in versions if v.get('job_id') == job.get('id')),
                              key=lambda v: v.get('created_at', ''), reverse=True):
            evidence = _from_report(version.get('report'))
            if evidence:
                break
            if version.get('route') == 'B':
                evidence = _AI
                break
    if not evidence:
        # Older rounds of the same game already proved the line even when this
        # task carries no report of its own.
        for version in sorted((v for v in versions
                               if job.get('candidate_id') and v.get('candidate_id') == job['candidate_id']),
                              key=lambda v: v.get('created_at', ''), reverse=True):
            evidence = _from_report(version.get('report'))
            if evidence:
                break
    basis = 'evidence'
    if not evidence and job.get('route') == 'B':
        evidence = _AI
    if not evidence:
        evidence = _planned(job, candidate)
        basis = 'inferred'
    label, tone, detail = evidence
    return {'route_label': label, 'route_tone': tone, 'route_detail': detail, 'route_basis': basis}

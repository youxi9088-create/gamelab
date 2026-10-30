"""Read-only catalog dimensions, shared across all import/conversion paths."""
import re
from .source_routing import source_kind


def engine_family(value):
    value=str(value or '').lower()
    for marker,name in [('cocos','Cocos'),('unity','Unity'),('laya','LayaAir'),('three','Three.js'),('defold','Defold'),('phaser','Phaser'),('egret','Egret'),('godot','Godot'),('flash','Flash'),('ruffle','Flash'),('canvas','原生 Canvas'),('pixi','PixiJS')]:
        if marker in value:return name
    return '待识别'


def source_engine(candidate, versions, acquisition=None):
    """Original-build evidence is independent of the converted runtime."""
    observed=(acquisition or {}).get(candidate.get('id'))
    if engine_family(observed)!='待识别':return {'name':'Flash（SWF）' if engine_family(observed)=='Flash' else observed,'family':engine_family(observed),'evidence':'原始构建采集记录'}
    registered=candidate.get('source_engine')
    registered=registered.get('name') if isinstance(registered,dict) else registered
    registered=registered or candidate.get('engine')
    if engine_family(registered)!='待识别':return {'name':registered,'family':engine_family(registered),'evidence':'来源资料登记；未由转换目标反推'}
    names={'discovered-web-cocos2':'Cocos 2','discovered-web-three':'Three.js','discovered-web-defold':'Defold','discovered-web-ruffle':'Flash（SWF）'}
    for version in sorted((v for v in versions if v.get('candidate_id')==candidate.get('id')),key=lambda v:(v.get('created_at',''),v.get('id','')),reverse=True):
        name=names.get((version.get('report') or {}).get('recovery_kind'))
        if name:return {'name':name,'family':engine_family(name),'evidence':'原包恢复契约：'+version.get('id','')}
    return {'name':'待识别','family':'待识别','evidence':'尚无原引擎证据；Web/微信是平台，不是引擎'}


def web_delivery(version=None):
    result={'target':'离线 Web 游戏','format':'Web','status':'not_generated','label':'尚未生成','scope':'通过本地静态服务器运行；不等同于双击HTML。'}
    if not version:return result
    result.update(version_id=version.get('id'),status='unverified',label='离线可玩待验证')
    report=version.get('report') or {};runtime=report.get('runtime_smoke') or {}
    if runtime.get('passed') is False:return {**result,'status':'failed','label':'运行验证未通过'}
    # Only the offline verifier's deployment evidence plus actual gameplay can certify a local loop.
    if (runtime.get('passed') is True and runtime.get('environment')=='deployment' and not runtime.get('diagnostic_only')
            and 'blocked_external' in runtime and not runtime.get('required_external') and not runtime.get('missing')
            and report.get('runtime_verified') is True and report.get('verification_stage') in ('gameplay','tutorial')
            and (report.get('foundation_checks',{}).get('gameplay') or {}).get('status')=='verified'):
        limited=bool(runtime.get('external'))
        result.update(status='verified_limited' if limited else 'verified',label='已验证离线流程（资源降级）' if limited else '已验证离线可玩',scope='仅覆盖该版本已实测流程；未覆盖内容及资源限制见说明书，人工验收独立。')
    return result


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
    platforms = {'微信小游戏', 'web游戏', 'web 游戏', 'html5', 'web', 'cocos', 'cocos creator', 'three.js', 'unity', 'layaair', 'defold', 'flash'}
    categories = list(dict.fromkeys(aliases.get(p.lower(), p) for p in parts
                                    if p.lower() not in platforms)) or ['未分类']
    source=candidate.get('source_engine') or {}
    family=source.get('family') if isinstance(source,dict) else engine_family(source)
    return {'categories':categories,'engines':[family or engine_family(candidate.get('engine'))]}

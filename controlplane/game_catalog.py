"""Game facts for readers and AI discovery; operational reports stay separate."""
import csv
import io
import json
import re
import shutil
from pathlib import Path

from .source_routing import observations_of

FIELDS = {
    'category': '玩法类型', 'dimension': '画面维度', 'perspective': '视角与布局',
    'core_gameplay': '核心玩法', 'core_experience': '核心体验',
    'controls': '操作方式', 'game_loop': '游戏流程', 'content': '内容规模',
    'progression': '奖励与成长', 'save': '存档方式',
    'rules': '目标、规则与结算数值', 'systems': '玩法系统与相互作用',
    'ui_flow': '界面流程与反馈', 'level_design': '场景、关卡与难度设计',
    'verification': '已验证流程与未覆盖范围', 'evidence': '事实依据与定位',
}

PROFILE_INSTRUCTIONS = '''game_profile 必须是详细中文游戏规格，所有文字字段为字符串：category、dimension（2D/3D/2.5D/混合）、perspective、core_gameplay、core_experience、controls、game_loop、content、progression、save、rules、systems、ui_flow、level_design、verification、evidence。不可只用一句宣传语概括。controls按“按键/动作 → 作用 → 必要触发条件”逐行写，每条不超过60字；区分实机验证与仅源码确认。不要放函数名、变量名、坐标、失败过程或修复建议，未确认的键位不编造；game_loop按开始、操作、结果、继续说明；rules写目标、成功/失败、计分公式及已查证阈值；systems分解对象、状态、触发及系统交互；ui_flow写各界面信息和按钮转移；content区分固定数量和程序生成；save写保存内容、触发、恢复及不保存项；verification区分实机验证、仅源码确认、未验证；evidence给出源码文件/函数及本轮证据位置。未知数值明确未确认，不能编造。可用换行和编号。不要把恢复故障日志当作玩法说明。'''


def normalize(value):
    if not isinstance(value, dict):
        raise ValueError('game_profile 必须是对象')
    result = {}
    for key in FIELDS:
        item = value.get(key, '')
        if not isinstance(item, str) or len(item) > 6000:
            raise ValueError('游戏档案字段无效：'+key)
        result[key] = item.strip()
    pictures=value.get('illustrations',[])
    if not isinstance(pictures,list) or len(pictures)>16:raise ValueError('规格配图最多16张')
    result['illustrations']=[]
    for picture in pictures:
        if not isinstance(picture,dict) or not re.fullmatch(r'screenshots/[A-Za-z0-9_-]+\.(?:png|jpg|webp)',str(picture.get('path',''))):raise ValueError('规格配图须来自版本截图')
        caption=picture.get('caption','')
        if not isinstance(caption,str) or not caption.strip() or len(caption)>2000:raise ValueError('配图须有事实说明')
        result['illustrations'].append({'path':picture['path'],'caption':caption.strip()})
    # Models sometimes append an explanation to the explicit enum. Accept only
    # an unambiguous enum followed by a complete parenthetical annotation.
    annotated = re.fullmatch(r'(2D|3D|2\.5D|混合)\s*(?:（[^（）]*）|\([^()]*\))', result['dimension'])
    if annotated:
        result['dimension'] = annotated.group(1)
    if result['dimension'] not in ('', '2D', '3D', '2.5D', '混合'):
        raise ValueError('画面维度须为 2D、3D、2.5D 或混合')
    return result


def profile(candidate, version):
    # Do not turn adaptation summaries, inferred categories or current candidate
    # specifications into facts about an immutable older game version.
    raw = version.get('game_profile') or version.get('report', {}).get('game_profile') or {}
    try:
        result = normalize(raw)
    except ValueError:
        result = normalize({})
    result['category'] = result['category'] or (version.get('report', {}).get('game_spec') or {}).get('category', '')
    spec=version.get('report',{}).get('game_spec') or {}
    # Only reuse explicit specification facts; do not infer mechanics from a title.
    for field,source in [('controls','controls'),('core_gameplay','mechanics'),('game_loop','states')]:
        if not result[field] and spec.get(source):result[field]='；'.join(spec[source])
    if not result['illustrations']:
        runtime=version.get('report',{}).get('runtime_smoke') or {}
        captured=set(runtime.get('captured_screenshots',[]))
        steps=[s for s in runtime.get('steps',[]) if isinstance(s,dict) and s.get('screenshot') in captured and re.fullmatch(r'screenshots/[A-Za-z0-9_-]+\.(?:png|jpg|webp)',s.get('screenshot',''))]
        chosen=sorted(set(round(i*(len(steps)-1)/min(7,len(steps)-1)) for i in range(min(8,len(steps))))) if len(steps)>1 else ([0] if steps else [])
        result['illustrations']=[{'path':steps[i]['screenshot'],'caption':f"实际操作记录 {i+1}。画面文字："+str(steps[i].get('text') or '无可提取文字；仅记录实际画面，不据此推断通关。')[:600]} for i in chosen]
        if not result['illustrations']:
            result['illustrations']=[{'path':p,'caption':('本轮启动画面' if p.endswith('startup.png') else '本轮最终观察画面')+'；仅证明已记录画面，验证范围见正文。'} for p in ('screenshots/startup.png','screenshots/current.png') if p in captured]
    return result


def document(title, facts, image_prefix=''):
    parts = ['# '+title+' 游戏规格说明书']
    for key, label in FIELDS.items():
        parts.extend(['## '+label, facts.get(key) or '未登记'])
    if facts.get('illustrations'):
        parts.append('## 实际运行图解')
        for i,picture in enumerate(facts['illustrations'],1):
            parts.extend([f"![实机图 {i}]({image_prefix}{picture['path']})",f"图 {i}：{picture['caption']}"])
    return '\n\n'.join(parts)+'\n'


def write_delivery(target, candidate, version):
    facts = profile(candidate, version)
    target = Path(target)
    target.mkdir(parents=True, exist_ok=True)
    (target/'game-profile.json').write_text(json.dumps(facts, ensure_ascii=False, indent=2), 'utf-8')
    (target/'GAME_SPECIFICATION.md').write_text(document(candidate['title'], facts), 'utf-8')
    return facts


def _hidden(candidate):
    return bool(observations_of(candidate).get('catalog_hidden'))


def prepare_submission(body, runs):
    """Generate version-bound documentation before the worker submits an artifact."""
    report=body.setdefault('report', {})
    facts=profile({}, {'report':report})
    report['game_profile']=facts
    text=document(body.get('title') or '交付游戏',facts)
    if body.get('local_run'):
        name=body['local_run']
        if not isinstance(name,str) or not re.fullmatch(r'[0-9a-f-]{36}',name):raise ValueError('无效运行目录')
        target=Path(runs)/name/'converted'
        if not target.resolve().is_relative_to(Path(runs).resolve()):raise ValueError('运行目录越界')
        (target/'GAME_SPECIFICATION.md').write_text(text,'utf-8')
        (target/'game-profile.json').write_text(json.dumps(facts,ensure_ascii=False,indent=2),'utf-8')
    else:
        field='changes' if 'changes' in body else 'files'
        body.setdefault(field,{})['GAME_SPECIFICATION.md']=text
        body[field]['game-profile.json']=json.dumps(facts,ensure_ascii=False,indent=2)
    return body


def index(candidates, versions):
    candidates = {c['id']: c for c in candidates if not _hidden(c)}
    latest = {}
    for v in sorted(versions, key=lambda v: (v.get('created_at', ''), v['id']), reverse=True):
        if v['candidate_id'] in candidates:
            latest.setdefault(v['candidate_id'], v)
    rows = []
    for cid, v in latest.items():
        c = candidates[cid]
        facts = profile(c, v)
        from .catalog_facets import source_engine, web_delivery
        original=c.get('source_engine') or source_engine(c,versions)
        delivery=web_delivery(v)
        rows.append(dict(game_id=cid, version_id=v['id'], title=c['title'],
            original_engine=original['name'],delivery_format=delivery['target'],offline_status=delivery['label'],
            version_status=v['status'], **facts,
            profile_status='complete' if all(facts[k] for k in FIELDS) else 'incomplete',
            missing_fields=[k for k in FIELDS if not facts[k]],
            source_directory=v.get('source_directory', ''),
            preview_url=v.get('preview_url', ''),
            specification=f"catalog/versions/{v['id']}/GAME_SPECIFICATION.md"))
    return dict(schema_version=1, games=sorted(rows, key=lambda r: r['game_id']),
        note='One latest version per game, including drafts and review versions. Check version_status and profile_status before selection. Facts are supplied metadata, not inferred from screenshots. Missing fields are unknown.')


def export(root, candidates, versions):
    """Explicit export; historical artifacts and their approval states are untouched."""
    root = Path(root)
    result = index(candidates, versions)
    by_version = {v['id']: v for v in versions}
    by_candidate = {c['id']: c for c in candidates}
    for row in result['games']:
        write_delivery(root/'catalog/versions'/row['version_id'],
                       by_candidate[row['game_id']], by_version[row['version_id']])
        source=(root/by_version[row['version_id']].get('source_directory','')).resolve()
        if source.is_relative_to(root.resolve()):
            for picture in row.get('illustrations',[]):
                original=source/picture['path']
                if original.is_file() and not original.is_symlink():
                    dest=root/'catalog/versions'/row['version_id']/picture['path']
                    dest.parent.mkdir(parents=True,exist_ok=True);shutil.copy2(original,dest)
        # Catalog documents are opened directly in the desktop Markdown viewer,
        # which needs absolute local image paths. Runtime/export packages keep
        # their portable relative references through write_delivery().
        folder=root/'catalog/versions'/row['version_id']
        (folder/'GAME_SPECIFICATION.md').write_text(
            document(by_candidate[row['game_id']]['title'],row,folder.resolve().as_posix()+'/'),'utf-8')
    folder = root/'catalog'
    folder.mkdir(parents=True, exist_ok=True)
    # Files are generated snapshots, not a second source of truth.
    data = json.dumps(result, ensure_ascii=False, indent=2)
    temp = folder/'index.json.tmp'
    temp.write_text(data, 'utf-8')
    temp.replace(folder/'index.json')
    stream = io.StringIO(newline='')
    fields = ['game_id','version_id','title','version_status','original_engine','delivery_format','offline_status',*FIELDS,
              'profile_status','specification']
    writer = csv.DictWriter(stream, fieldnames=fields, extrasaction='ignore')
    writer.writeheader()
    for row in result['games']:
        # Prevent spreadsheet formula execution in this human-oriented export.
        writer.writerow({k: "'"+v if isinstance(v,str) and v.startswith(('=','+','-','@','\t','\r')) else v
                         for k,v in row.items()})
    temp = folder/'index.csv.tmp'
    temp.write_text(stream.getvalue(), 'utf-8-sig')
    temp.replace(folder/'index.csv')
    return result

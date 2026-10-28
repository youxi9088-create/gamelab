"""Game facts for readers and AI discovery; operational reports stay separate."""
import csv
import io
import json
import re
from pathlib import Path

from .source_routing import observations_of

FIELDS = {
    'category': '玩法类型', 'dimension': '画面维度', 'perspective': '视角与布局',
    'core_gameplay': '核心玩法', 'core_experience': '核心体验',
    'controls': '操作方式', 'game_loop': '游戏流程', 'content': '内容规模',
    'progression': '奖励与成长', 'save': '存档方式',
}


def normalize(value):
    if not isinstance(value, dict):
        raise ValueError('game_profile 必须是对象')
    result = {}
    for key in FIELDS:
        item = value.get(key, '')
        if not isinstance(item, str) or len(item) > 6000:
            raise ValueError('游戏档案字段无效：'+key)
        result[key] = item.strip()
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
    return result


def document(title, facts):
    parts = ['# '+title+' 游戏规格说明书']
    for key, label in FIELDS.items():
        parts.extend(['## '+label, facts.get(key) or '未登记'])
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
        rows.append(dict(game_id=cid, version_id=v['id'], title=c['title'],
            version_status=v['status'], **facts,
            profile_status='complete' if all(facts.values()) else 'incomplete',
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
    folder = root/'catalog'
    folder.mkdir(parents=True, exist_ok=True)
    # Files are generated snapshots, not a second source of truth.
    data = json.dumps(result, ensure_ascii=False, indent=2)
    temp = folder/'index.json.tmp'
    temp.write_text(data, 'utf-8')
    temp.replace(folder/'index.json')
    stream = io.StringIO(newline='')
    fields = ['game_id','version_id','title','version_status',*FIELDS,
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

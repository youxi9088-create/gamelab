"""用本地 controlplane 真实实现算一遍 dashboard_operations，与云端 portal 输出对账。

目的不是"跑通"，而是证明 cloudflare/portal.mjs 的移植与 controlplane 同构：
同一份 sqlite，本地 Python 与云端 JS 必须给出相同的统计口径。
"""
import json
import sqlite3
import sys
from pathlib import Path

ROOT = Path(r'F:/youxi/door')
sys.path.insert(0, str(ROOT))
from controlplane.usage import game_totals  # noqa: E402
from controlplane.dashboard_operations import overview  # noqa: E402
from controlplane.catalog_facets import effective_engine  # noqa: E402

DB = Path(r'F:/youxi/door-cloudflare-migration/migration-private/platform.migration.sqlite3')

KINDS = ['candidates', 'versions', 'jobs', 'events', 'ai_usage', 'supply']


def load():
    conn = sqlite3.connect(f'file:{DB.as_posix()}?mode=ro', uri=True)
    out = {}
    for kind in KINDS:
        # 必须与 controlplane/store.py:51 的 store.all 完全一致（rowid DESC），
        # 否则 created_at 相同的事件配会对不上，对账结果不可信。
        out[kind] = [json.loads(row[0]) for row in conn.execute(
            'SELECT data FROM records WHERE kind = ? ORDER BY rowid DESC', (kind,))]
    conn.close()
    return out


def main():
    data = load()
    for candidate in data['candidates']:
        candidate['engine'] = effective_engine(candidate, data['versions'])
    state = {
        'candidates': data['candidates'], 'versions': data['versions'], 'jobs': data['jobs'],
        'events': data['events'], 'supply': data['supply'],
    }
    state['game_conversion_stats'] = game_totals(
        state['candidates'], state['jobs'], state['events'], data['ai_usage'])
    result = overview(state, data['ai_usage'])
    print(json.dumps({
        'games_count': result['games_count'],
        'calls': result['calls'],
        'unknown_calls': result['unknown_calls'],
        'timing_complete': result['timing_complete'],
        'timing_measured': result['timing_measured'],
        'median_seconds': result['median_seconds'],
        'weekly_accepted': result['weekly_accepted'],
        'previous_week_accepted': result['previous_week_accepted'],
        'weekly_published': result['weekly_published'],
        'token_coverage': result['token_coverage'],
        'engines': sorted(e['name'] for e in result['engines']),
        'engine_game_counts': sorted((e['name'], e['games']) for e in result['engines']),
        'models': sorted(m['name'] for m in result['models']),
        'failure_reasons': sorted((f['code'], f['count']) for f in result['failure_reasons']),
        'rows': sorted((
            r['candidate_id'], r['title'], r['engine'], r['status'], r['stage'],
            r['duration_seconds'], r['calls'], r['input_tokens'], r['output_tokens'],
            r['known_token_fields'], r['unpaired_events'], r['accepted'], r['supply_status'],
        ) for r in result['games']),
    }, ensure_ascii=False, indent=1))


if __name__ == '__main__':
    main()

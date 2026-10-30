"""Build cloud view fields with the same pure calculators as the local platform."""
import json
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from controlplane.usage import aggregate, operations, game_totals
from controlplane.dashboard_operations import overview
from controlplane.catalog_facets import source_engine, web_delivery
from controlplane.game_catalog import index

value = json.load(sys.stdin)
state, inputs = value['state'], value['inputs']
events, usage = inputs['events'], inputs['usage']
visible = {c['id'] for c in state['candidates'] if not c.get('observations', {}).get('catalog_hidden')}
usage = [u for u in usage if u.get('candidate_id') in visible]
for c in state['candidates']:
    c['source_engine'] = source_engine(c, state['versions'])
    c['engine'] = c['source_engine']['name']
for version in state['versions']:
    version['web_delivery'] = web_delivery(version)
state['game_catalog'] = index(state['candidates'], state['versions'])
state['game_conversion_stats'] = game_totals(state['candidates'], state['jobs'], events, usage)
state['usage'] = {p: aggregate(usage, p) for p in ('day', 'week', 'month')}
state['operation_stats'] = {p: operations(events, state['jobs'], p) for p in ('day', 'week', 'month')}
state['dashboard_operations'] = overview({**state, 'supply': inputs['supply']}, usage)
json.dump(state, sys.stdout, ensure_ascii=True)

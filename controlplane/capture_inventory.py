"""Read-only historical inventory for cumulative dashboard counters only."""
import json,re
from pathlib import Path
from urllib.parse import urlsplit,urlunsplit

DEFAULT_FILE=Path(__file__).resolve().parents[1]/'data/dashboard-capture-inventory.json'

def game_key(url, fallback):
    try:
        p=urlsplit(url or '')
        if p.scheme not in ('http','https') or not p.hostname:return 'local:'+fallback
        if p.hostname.lower().removeprefix('www.')=='astrocade.com':
            m=re.search(r'/games/[^/]+/([0-9A-HJKMNP-TV-Z]{26})(?:/)?$',p.path,re.I)
            if m:return 'astrocade:'+m.group(1).upper()
        return urlunsplit((p.scheme.lower(),p.netloc.lower(),p.path.rstrip('/'),p.query,''))
    except ValueError:return 'local:'+fallback

def cumulative(state, converted, supplied, inventory=None, *, template_ids=(), templated_candidates=()):
    if inventory is None:
        try:inventory=json.loads(DEFAULT_FILE.read_text('utf-8-sig')) if DEFAULT_FILE.exists() else {'schema_version':1,'games':[]}
        except (OSError,ValueError):return {'captured_games':None,'supplied_games':None,'downstream_templates':None,'capture_inventory_status':'unreadable'}
    if inventory.get('schema_version')!=1 or not isinstance(inventory.get('games'),list):
        return {'captured_games':None,'supplied_games':None,'downstream_templates':None,'capture_inventory_status':'invalid'}
    capture=set();delivery=set();templated=set()
    for g in inventory['games']:
        if not isinstance(g,dict) or not isinstance(g.get('key'),str) or not g['key']:
            return {'captured_games':None,'supplied_games':None,'downstream_templates':None,'capture_inventory_status':'invalid'}
        if g.get('captured') is True:capture.add(g['key'])
        if g.get('supplied') is True:delivery.add(g['key'])
        if g.get('templated') is True:templated.add(g['key'])
    candidates={c['id']:c for c in state.get('candidates',[])}
    def platform_keys(ids):
        return {game_key(candidates.get(cid,{}).get('canonical_url') or candidates.get(cid,{}).get('url'),cid) for cid in ids}
    platform=platform_keys(converted);platform_supplied=platform_keys(supplied)
    platform_templated=platform_keys(templated_candidates)
    return {'captured_games':len(platform|capture),'supplied_games':len(platform_supplied|delivery),
            'downstream_templates':len(set(template_ids))+len(templated-platform_templated),
            'capture_inventory_status':'ready','capture_inventory_breakdown':{
                'platform_converted':len(platform),'historical_captured':len(capture),'capture_overlap':len(platform&capture),
                'platform_supplied':len(platform_supplied),'historical_supplied':len(delivery),'supply_overlap':len(platform_supplied&delivery),
                'platform_templates':len(set(template_ids)),'historical_templates':len(templated),'template_overlap_games':len(platform_templated&templated),
                'source_records':inventory.get('source_records',len(capture)),'repository':inventory.get('repository'),'commit':inventory.get('commit')}}

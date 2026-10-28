"""Select applicable steps without rewriting or discarding execution history."""
import json
from pathlib import Path
RULES=json.loads((Path(__file__).resolve().parents[1]/'web/workflow-display.json').read_text('utf-8'))
ORIGINAL={'web-profile','discovered-web','embedded-lib','wxapkg-v1','provided-source','external'}
def mode(job):
    route=(job.get('conversion_plan') or {}).get('route')
    return 'revision' if job.get('continuation') else 'original' if route in ORIGINAL else 'ai' if route=='ai' else 'unknown'
def visible(job,nodes,current):
    kind=mode(job)
    plan=RULES['plans']['revision' if kind=='revision' else 'initial' if kind!='unknown' else 'unknown']
    terminal=job.get('status') in ('review','completed','superseded','cancelled','stopped')
    result=[]
    for node in nodes:
        recorded=any((r.get('round') or 1)==job.get('round',1) for r in node['records'])
        milestone=node['key'] in ('delivery','review','publish') and node['status'] in ('succeeded','waiting_input','draft_saved')
        if recorded or milestone or node['key']==current or (not terminal and node['key'] in plan):result.append(node)
    return result

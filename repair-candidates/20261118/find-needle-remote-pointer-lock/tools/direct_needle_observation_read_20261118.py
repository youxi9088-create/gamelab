from pathlib import Path
import json,datetime
s=Path('D:/GameLab/temp/direct-needle-remote-observation-20261118');e=s/'observation'
events=[json.loads(x)for x in (e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()] if(e/'browser-events.jsonl').exists()else[]
requests=[json.loads(x)for x in (e/'requests.jsonl').read_text(encoding='utf8').splitlines()] if(e/'requests.jsonl').exists()else[]
print(json.dumps({'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'events':len(events),'requests':len(requests),'errors':[x for x in events if x['type']in ['error','unhandledrejection','securitypolicyviolation','resource_buffer_full']],'lifecycle':[x for x in events if x['type']not in ['resource','console']][-35:],'http_errors':[x for x in events if x['type']=='resource'and(x.get('responseStatus')or 0)>=400],'external_resources':[x for x in events if x['type']=='resource'and not x['url'].startswith(('http://127.0.0.1:57588/','blob:','data:'))],'ledger':json.loads((s/'continued-ledger.json').read_text(encoding='utf8'))},ensure_ascii=False))

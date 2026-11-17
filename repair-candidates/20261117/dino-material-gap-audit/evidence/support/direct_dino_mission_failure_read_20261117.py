from pathlib import Path
import json
b=Path(__file__).parent;r=b/'direct-games/job-c8efbf50be33';p=r/'work/evidence/direct-repair/network-after-repair.json';x=json.loads(p.read_text(encoding='utf8'));events=x['events']
failures=[];urls={}
for e in events:
 q=e.get('params',{});rid=q.get('requestId')
 if e.get('method')=='Network.requestWillBeSent':urls[rid]=q.get('request',{}).get('url')
 if e.get('method')=='Network.responseReceived'and q.get('response',{}).get('status',0)>=400:
  v=q['response'];failures.append({'url':v.get('url')or urls.get(rid),'status':v['status'],'mimeType':v.get('mimeType'),'requestId':rid})
print(json.dumps({'root_files':[v.name for v in(r/'work').iterdir()],'network_keys':list(x),'failures':failures},ensure_ascii=False,indent=2))
(r/'mission-failure-paths-20261117.json').write_bytes(json.dumps({'source':str(p),'failures':failures},ensure_ascii=False,indent=2).encode())

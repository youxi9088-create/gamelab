from pathlib import Path
import json,hashlib,datetime,sys,collections,urllib.parse
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3');e=stage/'validation-additional-20261117'
events=[json.loads(s)for s in(e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()if s]
requests=[json.loads(s)for s in(e/'requests.jsonl').read_text(encoding='utf8').splitlines()if s]
diagnostic=[json.loads(s)for s in(e/'diagnostic-events.jsonl').read_text(encoding='utf8').splitlines()if s]
manifest=json.loads((stage/'MANIFEST.json').read_text(encoding='utf8'))
for n,h in manifest.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
resources=[v for v in events if v['type']=='resource'];issues=[v for v in events if v['type']not in ['resource','observer_started']]
root=Path('D:/GameLab/app');sys.path.insert(0,str(root));from controlplane.service import Service
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:j=svc.get(db,'jobs','job-ca75d464d2d7')
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files_verified':len(manifest),'candidate_files_verified':45,'event_count':len(events),'resources':len(resources),'sequence_contiguous':[v['seq']for v in events]==list(range(1,len(events)+1)),'issues':issues,'response_statuses':dict(collections.Counter(str(v.get('responseStatus'))for v in resources)),'external_requests':[v for v in resources if urllib.parse.urlsplit(v['url']).netloc!='127.0.0.1:57586'],'events':events,'requests':requests,'diagnostic_events':diagnostic,'server':json.loads((e/'server-ready.json').read_text()),'job':{k:j.get(k)for k in ['id','status','version_id','round','manual_paused']},'runtime_verified':False,'ready_review':False,'remaining':0}
(e/'runtime-observation-after-thirteen.json').write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps({k:v for k,v in out.items() if k not in ['events','requests','diagnostic_events']},ensure_ascii=False))

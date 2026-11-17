from pathlib import Path
import json,sys,hashlib,datetime,collections,urllib.parse
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v4');e=stage/'validation-v4-20261117'
for n,h in json.loads((stage/'MANIFEST.json').read_text(encoding='utf8')).items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
ledger=json.loads((stage/'ui-ledger-native-v4-20261117.json').read_text(encoding='utf8'));assert ledger['additional_steps_used']==5 and ledger['remaining']==0 and all(x['status']=='attempted'for x in ledger['steps'])
events=[json.loads(s)for s in(e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()if s];sessions=[]
for row in events:
 if row['type']=='observer_started':sessions.append([])
 assert sessions;sessions[-1].append(row)
resources=[x for x in events if x['type']=='resource'];issues=[x for x in events if x['type']not in ['resource','observer_started']]
root=Path('D:/GameLab/app');sys.path.insert(0,str(root));from controlplane.service import Service
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:j=svc.get(db,'jobs','job-ca75d464d2d7')
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'files_verified':61,'candidate_files_verified':47,'event_count':len(events),'sessions':[{'events':len(s),'sequence_contiguous':[x['seq']for x in s]==list(range(1,len(s)+1))}for s in sessions],'resources':len(resources),'response_statuses':dict(collections.Counter(str(x.get('responseStatus'))for x in resources)),'issues':issues,'external_requests':[x for x in resources if urllib.parse.urlsplit(x['url']).netloc!='127.0.0.1:57587'],'job':{k:j.get(k)for k in ['id','status','version_id','round','manual_paused']},'events':events,'runtime_verified':False,'ready_review':False,'cumulative_steps_used':18,'v4_steps_used':5,'remaining':0}
p=e/'runtime-observation-after-v4-five.json';assert not p.exists();p.write_bytes(json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps(out,ensure_ascii=False))

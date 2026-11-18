from pathlib import Path
import json,datetime,sys
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');p=e/'ui-ledger.json';raw=p.read_bytes();d=json.loads(raw)
assert d['used']==1 and d['remaining']==4 and len(d['steps'])==1 and d['steps'][0]['status']=='observed_failed'
backup=e/'ui-ledger-before-v3-step2.json'
if backup.exists():assert backup.read_bytes()==raw
else:write_bytes(backup,raw)
receipt=json.loads(Path('D:/GameLab/temp/direct-smash-runtime-uri-v3-20261118/receipt.json').read_bytes());ready=json.loads((e/'observation-v3/server-ready.json').read_bytes());assert 'runtime-uri-v3'in ready['root']and ready['port']==57602
d.update(revision='runtime-uri-v3-20261118',candidate_manifest_sha256=receipt['candidate_manifest_sha256'],used=2,remaining=3)
d['steps'].append({'number':2,'operation':'smash-runtime-uri-v3-navigation-20261118','status':'reserved','reserved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'action':'Navigate normal52 Chrome UI to repaired original native candidate and observe catalog/assets loading','outcome':None})
write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode());print(json.dumps({'reserved':True,'ui_steps_used':2,'ui_steps_remaining':3,'ledger':d}))

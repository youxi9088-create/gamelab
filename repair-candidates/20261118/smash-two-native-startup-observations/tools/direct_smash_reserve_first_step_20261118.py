from pathlib import Path
import json,datetime,sys
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118')
p=e/'ui-ledger.json';d=json.loads(p.read_bytes());op='smash-startup-settings-v2-first-navigation-20261118'
if d['steps']:
    assert d['used']==1 and d['steps'][-1]['operation']==op and d['steps'][-1]['status']=='reserved'
    print(json.dumps({'reserved':True,'already_reserved':True,'ledger':d}));raise SystemExit(0)
assert d['used']==0 and d['remaining']==5 and d['max_steps']==5
receipt=json.loads(Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118/receipt.json').read_bytes())
assert receipt['complete']and d['candidate_manifest_sha256']==receipt['candidate_manifest_sha256']
ready=json.loads((e/'server-ready.json').read_bytes());assert ready['port']==57602 and 'startup-settings-v2' in ready['root']
d['used']=1;d['remaining']=4;d['steps'].append({'number':1,'operation':op,'status':'reserved','reserved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'action':'Navigate normal52 Chrome UI to http://127.0.0.1:57602/index.html and observe original native startup','outcome':None})
write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode());print(json.dumps({'reserved':True,'already_reserved':False,'ledger':d}))

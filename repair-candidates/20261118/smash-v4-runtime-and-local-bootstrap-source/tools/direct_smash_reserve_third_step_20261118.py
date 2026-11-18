from pathlib import Path
import json,datetime,sys
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');p=e/'ui-ledger.json';raw=p.read_bytes();d=json.loads(raw)
assert d['used']==2 and d['remaining']==3 and len(d['steps'])==2 and d['steps'][-1]['status']=='observed_partial'
backup=e/'ui-ledger-before-v4-step3.json';assert not backup.exists();write_bytes(backup,raw)
receipt=json.loads(Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118/receipt.json').read_bytes());ready=json.loads((e/'observation-v4/server-ready.json').read_bytes());assert 'telemetry-consumers-v4' in ready['root']and ready['port']==57602
d.update(revision='telemetry-consumers-v4-20261118',candidate_manifest_sha256=receipt['candidate_manifest_sha256'],used=3,remaining=2)
d['steps'].append({'number':3,'operation':'smash-telemetry-consumers-v4-navigation-20261118','status':'reserved','reserved_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'action':'Navigate normal52 Chrome UI once to v4 original native candidate; passively observe startup and actual telemetry consumers','outcome':None})
write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode());print(json.dumps({'reserved':True,'ui_steps_used':3,'ui_steps_remaining':2}))

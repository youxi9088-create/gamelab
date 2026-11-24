from pathlib import Path
import json,datetime,sys
sys.path.insert(0,'D:/GameLab/app')
from controlplane.atomic_files import write_bytes
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118')
p=e/'ui-ledger.json';raw=p.read_bytes();d=json.loads(raw)
assert (d['used'],d['remaining'])==(4,1)
assert d['steps'][-1]['operation']=='smash-auth-consumers-v13r2-navigation-20261118'
requests=[json.loads(x) for x in (e/'observation-v13r2/requests.jsonl').read_text().splitlines() if x.strip()]
nav=[x for x in requests if x.get('path')=='/index.html'];assert len(nav)==2
backup=e/'ui-ledger-before-navigation-reconcile-20261124.json';assert not backup.exists();write_bytes(backup,raw)
d['steps'][-1].update(status='observed_partial',player_inputs=1,actual_navigation_at=nav[0]['at'],outcome='Actual HTTP navigation observed. Subsequent delayed UI observation exposed another navigation; both count. Core gameplay unverified.')
d['steps'].append({'number':5,'operation':'smash-auth-consumers-v13r2-second-navigation-20261124','status':'observed_partial','actual_navigation_at':nav[1]['at'],'player_inputs':1,'action':'Second actual Chrome page navigation confirmed by original HTTP receipt; preserve even though UI snapshot was delayed','outcome':'Original startup and catalogs loaded; blue loading screen observed. Await passive bounded observation only; no further player inputs authorized.'})
d.update(used=5,remaining=0,game_started=True,game_tab_closed=False)
write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode())
print(json.dumps({'reconciled':True,'actual_navigations':nav,'ui_steps_used':5,'ui_steps_remaining':0,'gameplay_verified':False}))

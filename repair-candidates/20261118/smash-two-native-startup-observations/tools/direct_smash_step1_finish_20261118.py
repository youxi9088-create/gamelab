from pathlib import Path
import json,sys,datetime,hashlib,subprocess
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118')
p=e/'ui-ledger.json';d=json.loads(p.read_bytes());assert d['used']==1 and d['remaining']==4 and len(d['steps'])==1
events=[json.loads(x)for x in(e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()if x.strip()]
messages=[' '.join(x.get('args',[]))for x in events if x.get('type')=='console']
assert any('Invalid path in TextDataProvider' in x and './assets/smash-original-webgl-bundles' in x for x in messages)
requests=[json.loads(x)for x in(e/'requests.jsonl').read_text(encoding='utf8').splitlines()if x.strip()]
assert all(any(x['path']==path for x in requests)for path in ['/index.html','/Build/original.wasm','/StreamingAssets/aa/settings.json','/StreamingAssets/aa/catalog.json','/StreamingAssets/aa/catalog.hash'])
step=d['steps'][0]
assert step['status']in['reserved','observed_failed']
step.update(status='observed_failed',observed_until=datetime.datetime.now(datetime.timezone.utc).isoformat(),outcome='Actual52 Chrome original WASM+framework+desktop data and3 startup settings/catalog/hash loaded; blueSmash splash. Original native TextDataProvider rejected relative gameplay catalog path before any catalog HTTP request. Firebase auth/analytics/database, Unity analytics andByteBrew external requests CSP-blocked; SDK not retired. Game tab closed by normalCtrl+W after observation; no core gameplay.',player_inputs=1)
d.update(game_started=True,game_tab_closed=True);write_bytes(p,json.dumps(d,ensure_ascii=False,indent=2).encode())
seq=[x['seq']for x in events if isinstance(x.get('seq'),int)]
summary={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'ui_steps_used':1,'ui_steps_remaining':4,'game_executed':True,'ready_review':False,'splash_observed':True,'game_tab_closed':True,'events':len(events),'sequence_unique':len(seq)==len(set(seq)),'sequence_set_complete':sorted(seq)==list(range(1,max(seq)+1))if seq else False,'initial_catalog_actual_requests_verified':True,'relative_catalog_path_runtime_rejected':True,'runtime_gameplay_catalog_requested':any('17.09.42' in x['path']for x in requests),'sdk_retired':False,'candidate_unchanged':True}
write_bytes(e/'step1-outcome.json',json.dumps(summary,indent=2).encode())
ps=r'''$ErrorActionPreference='Stop'
$name='GameLabDirectSmashNativeObserve20261118'
$task=Get-ScheduledTask -TaskName $name
$actions=@($task.Actions)
if($actions.Count -ne 1 -or $actions[0].Arguments -notlike '*direct-smash-startup-settings-v2-20261118*native-observation-v2*57602*'){throw 'Task identity differs'}
if($task.State -eq 'Running'){Stop-ScheduledTask -TaskName $name}
@{task=$name;state=[string](Get-ScheduledTask -TaskName $name).State;pid_exists=[bool](Get-Process -Id 38476 -ErrorAction SilentlyContinue);port_listeners=@(Get-NetTCPConnection -LocalPort 57602 -State Listen -ErrorAction SilentlyContinue).Count}|ConvertTo-Json -Compress
'''
res=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=20);assert res.returncode==0,res.stderr
summary['owned_observer_cleanup']=json.loads(res.stdout);write_bytes(e/'step1-outcome.json',json.dumps(summary,indent=2).encode());print(json.dumps(summary))

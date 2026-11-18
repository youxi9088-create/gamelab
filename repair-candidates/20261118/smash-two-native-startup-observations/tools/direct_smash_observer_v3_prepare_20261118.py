from pathlib import Path
import json,hashlib,zipfile
b=Path(__file__).parent
source=(b/'direct_smash_observation_server_startup_v2_20261118.py').read_text(encoding='utf8')
source=source.replace("direct-smash-startup-settings-v2-20261118/candidate","direct-smash-runtime-uri-v3-20261118/candidate")
source=source.replace("assert evidence==Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118').resolve()","assert evidence==Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118/observation-v3').resolve()")
source=source.replace("(evidence/'ui-ledger.json')","(evidence.parent/'ui-ledger.json')")
compile(source,'passive-v3-server','exec')
main=r'''from pathlib import Path
import json,hashlib,sys,zipfile,subprocess,time,urllib.request,datetime,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
s=Path('D:/GameLab/temp/direct-smash-runtime-uri-v3-20261118');parent=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');e=parent/'observation-v3'
ledger_raw=(parent/'ui-ledger.json').read_bytes();d=json.loads(ledger_raw);assert d['used']==1 and d['remaining']==4 and d['steps'][0]['status']=='observed_failed'
receipt=json.loads((s/'receipt.json').read_bytes());assert receipt['complete']and receipt['candidate_files']==205
manifest=json.loads((s/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in manifest.items():assert hashlib.sha256((s/'candidate'/n).read_bytes()).hexdigest()==h,n
with zipfile.ZipFile(sys.argv[0])as z:
    raw_manifest=z.read('MANIFEST.json');m=json.loads(raw_manifest);stage=s/'native-observation-v3';stage.mkdir(exist_ok=True)
    for n,h in m.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=stage/n
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(stage/'MANIFEST.json',raw_manifest)
assert not(e/'server-ready.json').exists(),'Inspect existing v3 observation; do not relaunch.'
ps=r"""$ErrorActionPreference='Stop'
if(Get-NetTCPConnection -LocalPort 57602 -State Listen -ErrorAction SilentlyContinue){throw 'Port occupied; inspect'}
if((Get-ScheduledTask -TaskName 'GameLabDirectSmashNativeObserve20261118').State -eq 'Running'){throw 'Old task still running'}
$name='GameLabDirectSmashNativeObserveV320261118'
if(Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue){throw 'Existing v3 task; inspect'}
$action=New-ScheduledTaskAction -Execute 'D:\GameLab\runtime\python\python.exe' -Argument '-X utf8 D:\GameLab\temp\direct-smash-runtime-uri-v3-20261118\native-observation-v3\observation_server.py D:\GameLab\temp\direct-smash-runtime-uri-v3-20261118\candidate D:\GameLab\temp\direct-smash-resources-localized-v1-20261118\validation-resources-v1-20261118\observation-v3 57602' -WorkingDirectory 'D:\GameLab\temp\direct-smash-runtime-uri-v3-20261118'
$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
$settings=New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Minutes 12) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $name -Action $action -Principal $principal -Settings $settings|Out-Null
Start-ScheduledTask -TaskName $name
@{name=$name;state=[string](Get-ScheduledTask -TaskName $name).State;last_task_result=(Get-ScheduledTaskInfo -TaskName $name).LastTaskResult}|ConvertTo-Json -Compress
"""
res=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=30);assert res.returncode==0,res.stderr
for _ in range(50):
    if(e/'server-ready.json').exists():break
    time.sleep(.2)
ready=json.loads((e/'server-ready.json').read_bytes());assert Path(ready['root'])==s/'candidate'and ready['port']==57602
op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
with op.open(ready['url'],timeout=3)as response:assert response.status==200 and b'Game not started' in response.read()
assert(parent/'ui-ledger.json').read_bytes()==ledger_raw
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
out=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),complete=True,stage=str(stage),manifest_sha256=hashlib.sha256(raw_manifest).hexdigest(),server=ready,task=json.loads(res.stdout),diagnostic_http=200,candidate_manifest_sha256=receipt['candidate_manifest_sha256'],candidate_files_verified=205,game_executed=False,ready_review=False,job_unchanged=True,manual_pause_preserved=True,ui_steps_used=1,ui_steps_remaining=4);write_bytes(e/'launch-receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''
compile(main,'passive-observation-v3-launch','exec');files={'observation_server.py':source.encode()};target=b/'direct_smash_observer_v3_20261118.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(v).hexdigest()for n,v in files.items()},sort_keys=True,indent=2))
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(target),'game_executed':False}))

"""A new observer revision after verified terminal file-not-found, no game replay."""
from pathlib import Path
import json,hashlib,sys,subprocess,time,urllib.request,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
s=Path('D:/GameLab/temp/direct-drift-last-action-20261118')
manifest=json.loads((s/'MANIFEST.json').read_text(encoding='utf8'))
for n,h in manifest.items():assert hashlib.sha256((s/n).read_bytes()).hexdigest()==h,n
ledger=json.loads((s/'continued-ledger.json').read_text(encoding='utf8'));assert ledger['used']==4 and ledger['remaining']==1 and not ledger['steps']
code=r"""$ErrorActionPreference='Stop'
$old=Get-ScheduledTask -TaskName 'GameLabDirectDriftLastActionObserve20261118'
$info=Get-ScheduledTaskInfo -TaskName $old.TaskName
if($old.State -eq 'Running' -or $info.LastTaskResult -ne 2147942402){throw 'Original failure changed: inspect'}
if(Get-NetTCPConnection -LocalPort 57589 -State Listen -ErrorAction SilentlyContinue){throw 'Port occupied'}
$owned=@(Get-CimInstance Win32_Process -Filter "Name = 'python.exe'"|Where-Object {$_.CommandLine -like '*direct-drift-last-action-20261118*observer*'})
if($owned.Count){throw 'Existing Python observer: inspect'}
@{terminal_file_not_found=$true;last_task_result=$info.LastTaskResult;state=[string]$old.State;owned_python=$owned.Count}|ConvertTo-Json -Compress
"""
res=subprocess.run(['powershell.exe','-NoProfile','-Command',code],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=20);assert res.returncode==0,res.stderr
assert not(s/'observation/server-ready.json').exists()
original=(s/'observer.py').read_text(encoding='utf8')
begin=original.index("for(const name of ['warn','error'])")
end=original.index("addEventListener('error'",begin)
updated=original[:begin]+original[end:]
assert "worker-src 'self' blob:;"in updated
compile(updated,'passive-observer-v2','exec')
p=s/'observer-pathfix-v2.py';raw=updated.encode()
if p.exists():assert p.read_bytes()==raw
else:write_bytes(p,raw)
e=s/'observation-pathfix-v2';e.mkdir(exist_ok=True)
paths={'@@PYTHON@@':str(r.parent/'runtime/python/python.exe'),'@@SCRIPT@@':str(p),'@@CANDIDATE@@':str(s/'candidate'),'@@EVIDENCE@@':str(e),'@@DIRECTORY@@':str(s)}
for v in paths.values():assert "'"not in v and not any(ord(c)<32 for c in v)
ps=r"""$ErrorActionPreference='Stop'
$name='GameLabDirectDriftLastActionObserveV220261118'
if(Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue){throw 'Existing v2: inspect original receipt'}
$action=New-ScheduledTaskAction -Execute '@@PYTHON@@' -Argument '-X utf8 @@SCRIPT@@ @@CANDIDATE@@ @@EVIDENCE@@' -WorkingDirectory '@@DIRECTORY@@'
$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
$settings=New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 1) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $name -Action $action -Principal $principal -Settings $settings|Out-Null
Start-ScheduledTask -TaskName $name
"""
for k,v in paths.items():ps=ps.replace(k,v)
assert '@@'not in ps
res2=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=25);assert res2.returncode==0,res2.stderr
ready=e/'server-ready.json'
for _ in range(50):
 if ready.exists():break
 time.sleep(.2)
assert ready.exists(),'Inspect original v2 task and process, no blind retry'
state=json.loads(ready.read_text(encoding='utf8'));assert state['port']==57589 and Path(state['root'])==s/'candidate'
op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
with op.open(state['url'],timeout=3)as response:assert response.status==200 and b'Game not started.'in response.read()
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'original_terminal':json.loads(res.stdout),'original_task_preserved':True,'task_name':'GameLabDirectDriftLastActionObserveV220261118','server':state,'observer_sha256':hashlib.sha256(raw).hexdigest(),'candidate_files_verified':44,'original_support_files_verified':len(manifest),'used':4,'remaining':1,'game_started':False,'changes':'Correct generated task paths; passive observation only, no console replacement. Original candidate bytes, task and budget unchanged.'}
write_bytes(s/'observer-pathfix-v2-receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

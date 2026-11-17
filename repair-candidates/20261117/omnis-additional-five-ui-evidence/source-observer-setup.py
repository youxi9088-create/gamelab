from pathlib import Path
import json,hashlib,subprocess,urllib.request,time
stage=Path('D:/GameLab/temp/direct-omnis-local-20261116-v1');evidence=stage/'validation-extra-resumed-20261117';evidence.mkdir(exist_ok=True)
auth=json.loads((stage/'extra-authorization-20261117.json').read_text(encoding='utf8'));assert auth['max_steps']==10 and auth['steps_used']==5 and auth['remaining']==5
manifest=json.loads((stage/'converted/MANIFEST.json').read_text(encoding='utf8'))
for n,h in manifest.items():assert hashlib.sha256((stage/'converted'/n).read_bytes()).hexdigest()==h
old=json.loads((stage/'validation/server-ready.json').read_text(encoding='utf8'));assert old['port']==57584
source=(stage/'observation_server.py').read_text(encoding='utf8');needle="ThreadingHTTPServer(('127.0.0.1',0),Handler)";assert needle in source
source=source.replace(needle,"ThreadingHTTPServer(('127.0.0.1',57584),Handler)")
p=stage/'observation_server_extra_resumed_20261117.py'
if p.exists():assert p.read_text(encoding='utf8')==source
else:p.write_text(source,encoding='utf8')
name='GameLabDirectOmnisExtraResumedObserve20261117';ready=evidence/'server-ready.json';op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
def current():
 try:
  state=json.loads(ready.read_text(encoding='utf8'))
  assert state['port']==57584
  with op.open(state['url'],timeout=2) as response:assert response.status==200 and b'Game not started' in response.read()
  return state
 except (OSError,ValueError,AssertionError):return None
state=current()
if state is None:
 code=r'''$ErrorActionPreference='Stop'
$name='GameLabDirectOmnisExtraResumedObserve20261117'
if(Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue){throw 'Existing extra observer task: inspect its receipt and process instead of starting again'}
if(Get-NetTCPConnection -LocalPort 57584 -State Listen -ErrorAction SilentlyContinue){throw 'Original observation port is occupied; inspect exact listener before action'}
$action=New-ScheduledTaskAction -Execute 'D:\GameLab\runtime\python\python.exe' -Argument '-X utf8 D:\GameLab\temp\direct-omnis-local-20261116-v1\observation_server_extra_resumed_20261117.py D:\GameLab\temp\direct-omnis-local-20261116-v1\converted D:\GameLab\temp\direct-omnis-local-20261116-v1\validation-extra-resumed-20261117' -WorkingDirectory 'D:\GameLab\temp\direct-omnis-local-20261116-v1'
$principal=New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount
$settings=New-ScheduledTaskSettingsSet -ExecutionTimeLimit (New-TimeSpan -Hours 2) -MultipleInstances IgnoreNew -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $name -Action $action -Principal $principal -Settings $settings | Out-Null
Start-ScheduledTask -TaskName $name
'''
  # No browser/game launch; only serve the exact same candidate and origin.
 result=subprocess.run(['powershell.exe','-NoProfile','-Command',code],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=30);assert result.returncode==0,result.stderr
 for _ in range(40):
  state=current()
  if state:break
  time.sleep(.2)
 assert state is not None,'Inspect original task/process; do not restart blindly'
out={'complete':True,'server':state,'task_name':name,'same_original_origin':True,'files_verified':len(manifest),'game_started':False,'used':5,'remaining':5}
(evidence/'observer-receipt.json').write_text(json.dumps(out,indent=2),encoding='utf8');print(json.dumps(out))

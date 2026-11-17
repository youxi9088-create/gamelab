"""Close only this owned observer and export its complete evidence, without replay."""
from pathlib import Path
import json,subprocess,hashlib,datetime,base64,zipfile,io,sys
s=Path('D:/GameLab/temp/direct-needle-remote-observation-20261118');e=s/'observation'
state=json.loads((e/'server-ready.json').read_text(encoding='utf8'));assert state['pid']==10512 and state['port']==57588
ledger=json.loads((s/'continued-ledger.json').read_text(encoding='utf8'));assert ledger['ui_steps_used']==5 and ledger['remaining']==0 and all(x['status']=='attempted'for x in ledger['steps'])
code=r'''$ErrorActionPreference='Stop'
$owned=Get-CimInstance Win32_Process -Filter 'ProcessId=10512'
if($owned){if($owned.CommandLine -notlike '*direct-needle-remote-observation-20261118*observer.py*'){throw 'PID identity mismatch'};Stop-ScheduledTask -TaskName 'GameLabDirectNeedleRemoteObserve20261118';Start-Sleep -Milliseconds 300}
$live=Get-CimInstance Win32_Process -Filter 'ProcessId=10512'
if($live -and $live.CommandLine -like '*direct-needle-remote-observation-20261118*observer.py*'){throw 'Owned observer still live'}
'''
res=subprocess.run(['powershell.exe','-NoProfile','-Command',code],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=20);assert res.returncode==0,res.stderr
events=[json.loads(x)for x in (e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()]
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'owned_observer_live':False,'pid':state['pid'],'port':state['port'],'used':5,'remaining':0,'native_pointer_lock_observed':any(x['type']=='pointerlockchange'and x.get('locked')for x in events),'events':len(events),'errors':[x for x in events if x['type']in ['error','unhandledrejection','securitypolicyviolation','resource_buffer_full']],'http_errors':[x for x in events if x['type']=='resource'and(x.get('responseStatus')or 0)>=400],'admitted':False,'runtime_verified':False,'reason':'Native PLAY and pointer lock on remote52 verified. Seven native audio 404 and observation CSP worker error preserved. Acquisition/settlement/earned save unverified; no steps remain.'}
(s/'closure-receipt.json').write_text(json.dumps(out,ensure_ascii=False,indent=2),encoding='utf8')
buf=io.BytesIO();members={str(p.relative_to(s)).replace('\\','/'):p.read_bytes()for p in s.rglob('*')if p.is_file()}
with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED)as z:
 for n,raw in members.items():z.writestr(n,raw)
 z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(raw).hexdigest()for n,raw in members.items()},indent=2))
raw=buf.getvalue();print(json.dumps({'receipt':out,'zip_sha256':hashlib.sha256(raw).hexdigest(),'files':len(members),'zip_base64':base64.b64encode(raw).decode()}))

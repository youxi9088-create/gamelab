"""Stop only the verified owned observer, export proof, do not run game again."""
from pathlib import Path
import json,subprocess,hashlib,datetime,zipfile,io,base64
s=Path('D:/GameLab/temp/direct-drift-last-action-20261118');e=s/'observation-pathfix-v2'
state=json.loads((e/'server-ready.json').read_text(encoding='utf8'));assert state['pid']==22072 and state['port']==57589
ledger=json.loads((s/'continued-ledger.json').read_text(encoding='utf8'));assert ledger['used']==5 and ledger['remaining']==0 and ledger['steps'][-1]['status']=='attempted'
ps=r"""$ErrorActionPreference='Stop'
$owned=Get-CimInstance Win32_Process -Filter 'ProcessId=22072'
if($owned){
 if($owned.Name -ne 'python.exe' -or $owned.CommandLine -notlike '*direct-drift-last-action-20261118*observer-pathfix-v2.py*'){throw 'PID identity mismatch'}
 Stop-ScheduledTask -TaskName 'GameLabDirectDriftLastActionObserveV220261118'
 Start-Sleep -Milliseconds 300
}
$live=Get-CimInstance Win32_Process -Filter 'ProcessId=22072'
if($live -and $live.CommandLine -like '*direct-drift-last-action-20261118*observer-pathfix-v2.py*'){throw 'Owned process still live'}
"""
res=subprocess.run(['powershell.exe','-NoProfile','-Command',ps],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=20);assert res.returncode==0,res.stderr
events=[json.loads(x)for x in(e/'browser-events.jsonl').read_text(encoding='utf8').splitlines()]
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'owned_observer_live':False,'pid':22072,'port':57589,'used':5,'remaining':0,'events':len(events),'pagehide_observed':any(x['type']=='pagehide'for x in events),'runtime_verified':False,'network_observation_complete_for_game':False,'admitted':False,'reason':'Native remote52 Chrome reaches about:blank after loading original candidate page. Only6 events and early pagehide; no native menu/core loop. Not an IAB/CDP-only observation failure. Triggering source still unidentified.'}
(s/'closure-receipt.json').write_text(json.dumps(out,indent=2),encoding='utf8')
members={}
for p in e.iterdir():
 if p.is_file():members['observation/'+p.name]=p.read_bytes()
for n in ['continued-ledger.json','prior-four-status.json','observer-pathfix-v2.py','observer-pathfix-v2-receipt.json','closure-receipt.json']:members[n]=(s/n).read_bytes()
buf=io.BytesIO()
with zipfile.ZipFile(buf,'w',zipfile.ZIP_DEFLATED)as z:
 for n,raw in members.items():z.writestr(n,raw)
 z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(raw).hexdigest()for n,raw in members.items()},indent=2))
raw=buf.getvalue();print(json.dumps({'receipt':out,'files':len(members),'zip_sha256':hashlib.sha256(raw).hexdigest(),'zip_base64':base64.b64encode(raw).decode()}))

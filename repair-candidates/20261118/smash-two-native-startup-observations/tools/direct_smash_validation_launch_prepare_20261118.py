from pathlib import Path
import json,hashlib,zipfile
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a'
files={'observation_server.py':(b/'direct_smash_observation_server_startup_v2_20261118.py').read_bytes(),'initial-ledger.json':(r/'validation-resources-v1-20261118/ui-ledger.json').read_bytes()}
main='''from pathlib import Path
import sys,json,zipfile,hashlib,subprocess,os,time,socket,urllib.request,datetime,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
candidate=Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118/candidate');stage=candidate.parent
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');e.mkdir(exist_ok=True)
receipt=json.loads((stage/'receipt.json').read_bytes());raw=(stage/'CANDIDATE_MANIFEST.json').read_bytes();assert hashlib.sha256(raw).hexdigest()==receipt['candidate_manifest_sha256']
for n,h in json.loads(raw).items():assert hashlib.sha256((candidate/n).read_bytes()).hexdigest()==h,n
with zipfile.ZipFile(sys.argv[0])as z:
    transfer=z.read('MANIFEST.json')
    material=stage/'native-observation-v2';material.mkdir(exist_ok=True)
    for n,h in json.loads(transfer).items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=material/n
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(material/'MANIFEST.json',transfer)
    ledger_path=e/'ui-ledger.json'
    if not ledger_path.exists():
        ledger=json.loads(z.read('initial-ledger.json'));assert ledger['used']==0 and ledger['remaining']==5 and not ledger['steps']
        ledger.update(revision='startup-settings-v2-20261118',candidate_manifest_sha256=receipt['candidate_manifest_sha256'],desktop_observation='User confirmed52 unlocked; actual Windows desktop observed. No game input yet.')
        write_bytes(ledger_path,json.dumps(ledger,ensure_ascii=False,indent=2).encode())
    ledger=json.loads(ledger_path.read_bytes());assert ledger['used']==0 and ledger['remaining']==5 and not ledger['steps']
    assert not(e/'server-ready.json').exists(),'Inspect exact existing server state instead of relaunching.'
    sock=socket.socket();assert sock.connect_ex(('127.0.0.1',57602))!=0,'Port already in use; inspect instead of duplicate.';sock.close()
    stdout=(e/'server-stdout.txt').open('ab');stderr=(e/'server-stderr.txt').open('ab')
    startup=subprocess.STARTUPINFO();startup.dwFlags|=subprocess.STARTF_USESHOWWINDOW;startup.wShowWindow=0
    process=subprocess.Popen([sys.executable,str(material/'observation_server.py'),str(candidate),str(e),'57602'],stdin=subprocess.DEVNULL,stdout=stdout,stderr=stderr,startupinfo=startup,creationflags=subprocess.DETACHED_PROCESS|subprocess.CREATE_NEW_PROCESS_GROUP)
    stdout.close();stderr.close()
    for _ in range(40):
        assert process.poll()is None,'Observer exited; read stderr, do not restart blindly.'
        if(e/'server-ready.json').exists():break
        time.sleep(.25)
    ready=json.loads((e/'server-ready.json').read_bytes());assert ready['pid']==process.pid and Path(ready['root'])==candidate and ready['port']==57602
    op=urllib.request.build_opener(urllib.request.ProxyHandler({}))
    with op.open(ready['url'],timeout=5)as response:assert response.status==200 and b'Game not started' in response.read()
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(material),'manifest_sha256':hashlib.sha256(transfer).hexdigest(),'server_pid':process.pid,'server_live':process.poll()is None,'diagnostic_http':200,'candidate_root':str(candidate),'live_evidence_root':str(e),'candidate_files_verified':205,'game_executed':False,'ready_review':False,'job_unchanged':True,'manual_pause_preserved':True,'ui_steps_used':ledger['used'],'ui_steps_remaining':ledger['remaining'],'deadline_seconds':600};write_bytes(e/'launch-receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))
'''
compile(main,'isolated-passive-observer-launch','exec');target=b/'direct_smash_validation_launch_v2_20261118.pyz';assert not target.exists()
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',json.dumps({n:hashlib.sha256(raw).hexdigest()for n,raw in files.items()},sort_keys=True,indent=2))
    for n,raw in files.items():z.writestr(n,raw)
print(json.dumps({'prepared':str(target),'server_started':False,'game_executed':False}))

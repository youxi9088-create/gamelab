"""Read only the actual passive server evidence; never call the game endpoint."""
from pathlib import Path
import json,datetime,ctypes,collections,urllib.request
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118')
ready=json.loads((e/'server-ready.json').read_bytes())
kernel=ctypes.windll.kernel32;kernel.OpenProcess.restype=ctypes.c_void_p;kernel.CloseHandle.argtypes=[ctypes.c_void_p];kernel.GetExitCodeProcess.argtypes=[ctypes.c_void_p,ctypes.POINTER(ctypes.c_ulong)]
h=kernel.OpenProcess(0x1000,False,ready['pid']);alive=False
if h:
    code=ctypes.c_ulong();assert kernel.GetExitCodeProcess(h,ctypes.byref(code));alive=code.value==259;kernel.CloseHandle(h)
events=[]
if(e/'browser-events.jsonl').exists():
    for line in(e/'browser-events.jsonl').read_text(encoding='utf8').splitlines():
        if line.strip():events.append(json.loads(line))
requests=[]
if(e/'requests.jsonl').exists():requests=[json.loads(x)for x in(e/'requests.jsonl').read_text(encoding='utf8').splitlines()if x.strip()]
seq=[x['seq']for x in events if isinstance(x.get('seq'),int)]
errors=[x for x in events if x.get('type')in['error','unhandledrejection','securitypolicyviolation','resource_buffer_full']or x.get('type')=='console']
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'server_ready':ready,'server_live':alive,'ui_ledger':json.loads((e/'ui-ledger.json').read_bytes()),'event_count':len(events),'event_types':dict(collections.Counter(x.get('type')for x in events)),'event_sequence':{'first':seq[0]if seq else None,'last':seq[-1]if seq else None,'continuous':seq==list(range(1,len(seq)+1)),'unique':len(seq)==len(set(seq)),'set_complete':sorted(seq)==list(range(1,max(seq)+1))if seq else False},'resource_events':[x for x in events if x.get('type')=='resource'],'error_events':errors,'http_requests':requests,'stderr':(e/'server-stderr.txt').read_text(encoding='utf8',errors='replace')[-5000:]if(e/'server-stderr.txt').exists()else'', 'read_did_not_launch_game':True}
print(json.dumps(out,ensure_ascii=False))

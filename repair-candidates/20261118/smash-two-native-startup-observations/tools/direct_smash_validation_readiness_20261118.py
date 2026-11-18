"""Read candidate hashes, the real UI ledger and native resource availability on52."""
from pathlib import Path
import json,hashlib,ctypes,datetime,sys
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:j=svc.get(db,'jobs','job-3db06205247a')
s=Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118');receipt=json.loads((s/'receipt.json').read_bytes());assert receipt['complete']and receipt['job_unchanged']and not receipt['game_executed']
raw=(s/'CANDIDATE_MANIFEST.json').read_bytes();assert hashlib.sha256(raw).hexdigest()==receipt['candidate_manifest_sha256'];manifest=json.loads(raw)
for n,h in manifest.items():assert hashlib.sha256((s/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118')
ledger=json.loads((e/'ui-ledger.json').read_bytes())if(e/'ui-ledger.json').exists()else None
class Memory(ctypes.Structure):
    _fields_=[('dwLength',ctypes.c_ulong),('dwMemoryLoad',ctypes.c_ulong)]+[(n,ctypes.c_ulonglong)for n in ['ullTotalPhys','ullAvailPhys','ullTotalPageFile','ullAvailPageFile','ullTotalVirtual','ullAvailVirtual','ullAvailExtendedVirtual']]
m=Memory();m.dwLength=ctypes.sizeof(m);assert ctypes.windll.kernel32.GlobalMemoryStatusEx(ctypes.byref(m))
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'read_only':True,'candidate_files_verified':len(manifest),'candidate_manifest_sha256':receipt['candidate_manifest_sha256'],'job':{k:j.get(k)for k in ['id','status','round','version_id','manual_paused']},'live_ui_ledger':ledger,'server_ready':json.loads((e/'server-ready.json').read_bytes())if(e/'server-ready.json').exists()else None,'physical_total':m.ullTotalPhys,'physical_available':m.ullAvailPhys,'physical_used_percent':m.dwMemoryLoad,'game_executed':False}
print(json.dumps(out))

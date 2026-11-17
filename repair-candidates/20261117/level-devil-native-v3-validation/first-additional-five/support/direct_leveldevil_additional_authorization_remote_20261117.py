from pathlib import Path
import sys,json,hashlib,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.store import ACTOR
from controlplane.atomic_files import write_bytes
stage=Path('D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3');raw=b'{\r\n  "at": "2026-11-17T12:13:05.530752+00:00",\r\n  "job_id": "job-ca75d464d2d7",\r\n  "revision": "work-native-retirement-20261117-v3",\r\n  "candidate_transfer_manifest_sha256": "88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08",\r\n  "question_id": "call_gkZRy3lYXlVRC4SM8XDEmTiB",\r\n  "user_answer": "\xe4\xbb\x85\xe6\xad\xa4\xe4\xbf\xae\xe8\xae\xa2\xe9\xa2\x9d\xe5\xa4\x96\xe6\x9c\x80\xe5\xa4\x9a5\xe6\xad\xa5",\r\n  "original_steps_used": 5,\r\n  "additional_max_steps": 5,\r\n  "additional_steps_used": 0,\r\n  "additional_steps_remaining": 5,\r\n  "max_steps": 10,\r\n  "steps_used": 5,\r\n  "remaining": 5,\r\n  "additional_steps": [],\r\n  "scope": "Only this new Level Devil native-retirement revision on52; no budget reset or permission for another game/manual pause/status gate. Game has not started.",\r\n  "runtime_verified": false,\r\n  "admitted": false\r\n}';assert hashlib.sha256(raw).hexdigest()=='f84c71c9c4e9c183dcbe3f3bccb0647672475acc49dd1eb4719f14e8336ed089'
candidate=json.loads((stage/'receipt.json').read_text(encoding='utf8'));assert candidate['complete']and candidate['manifest_sha256']==json.loads(raw)['candidate_transfer_manifest_sha256']and not candidate['ready_review']
manifest=json.loads((stage/'MANIFEST.json').read_text(encoding='utf8'))
for n,h in manifest.items():assert hashlib.sha256((stage/n).read_bytes()).hexdigest()==h,n
p=stage/'additional-validation-authorization-20261117.json'
if p.exists():assert p.read_bytes()==raw
else:write_bytes(p,raw)
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766');ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-ca75d464d2d7'));assert before['version_id']=='v-1f8b04b1ee19'and not before.get('manual_paused')and before['status']=='failed'
svc.mutate('/api/jobs/job-ca75d464d2d7/work-log',{'message':'用户仅授权Level Devil此次work-native-retirement-20261117-v3修订额外最多5步，原5步保留，累计总上限10、当前已用5/剩5。授权绑定候选清单88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08和实际源文件，准备52原生实机；尚未开始，不提供其他游戏/人工暂停/入库门禁权限，不启动模型。'},None,idem='direct-leveldevil-extra-five-20261117-v3')
with svc.store.read()as db:assert svc.get(db,'jobs','job-ca75d464d2d7')==before
out={'complete':True,'ledger_sha256':'f84c71c9c4e9c183dcbe3f3bccb0647672475acc49dd1eb4719f14e8336ed089','candidate_files_verified':45,'max_steps':10,'steps_used':5,'remaining':5,'question_id':'call_gkZRy3lYXlVRC4SM8XDEmTiB','tasks_unchanged':True,'game_started':False}
write_bytes(stage/'additional-authorization-receipt-20261117.json',json.dumps(out).encode());print(json.dumps(out))

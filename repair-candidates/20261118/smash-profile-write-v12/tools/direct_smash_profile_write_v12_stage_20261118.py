"""Rebuild the exact profile-upload consumer retirement on52, without running game code."""
from pathlib import Path
import json,hashlib,zipfile,sys,copy,types,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r))
from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda v:hashlib.sha256(v).hexdigest();svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
base=Path('D:/GameLab/temp/direct-smash-local-transport-v11-20261118');stage=Path('D:/GameLab/temp/direct-smash-profile-write-v12-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    linker=types.ModuleType('smash_profile_native_linker_20261118');exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'static-own-linker','exec'),linker.__dict__);sys.modules[linker.__name__]=linker
    code={};exec(compile(z.read('tools/smash_profile_write_consumer_v12_20261118.py'),'own-upload-consumer-retirement','exec'),code)
    contract=json.loads(z.read('source-proof/native-profile-write-consumer-contract.json'));native,proof=code['assemble']((base/'candidate/Build/original.wasm').read_bytes(),contract);assert proof==recipe['native_change_proof']
    stage.mkdir(exist_ok=True)
    def publish(n,raw):
        p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw,n
        else:write_bytes(p,raw)
    for n in manifest:publish(n,z.read(n))
    for n,h in recipe['candidate_manifest'].items():
        raw=z.read('overlay/'+n)if'overlay/'+n in manifest else native if n=='Build/original.wasm'else(base/'candidate'/n).read_bytes()
        assert sha(raw)==h,n;publish('candidate/'+n,raw)
    candidate_raw=json.dumps(recipe['candidate_manifest'],sort_keys=True,indent=2).encode();publish('CANDIDATE_MANIFEST.json',candidate_raw);publish('MANIFEST.json',manifest_raw)
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==218
for n in['index.html','local-profile.js','local-gamedata.js','local-gamedata-plan.json','local-transport.js','StreamingAssets/aa/ftue-v4.original.json']:assert(stage/'candidate'/n).read_bytes()==(base/'candidate'/n).read_bytes(),n
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash v12退役原生档案保存消费者的两处Firebase上传调用：1756原更新数据、Nexus字段规范化、音量/FPS设置、保护字段/时间戳、原反射差异104586、序列化基线及原UnityEvent<bool>全部保持，仅全量1679/增量6414两条调用改为消费原已求值8参数（含f32超时）。Firebase提供者和成功/失败回调没有换桩，没有伪造上传成功；原事件本就在排队后、远端成功前触发，时序保持。真实本地档案仍由既有v7适配按实际快照、校验/CAS、5秒和pagehide保存。3类自编mixed-signature隔离验证了无上传/全量/增量分支的全部参数副作用、本地更新、基线与事件计数不变；完整原Wasm仅静态exit0。相对v11只改1756，其余138267体保持，原type/import/export/table/global/data保持；218文件SHA复核。未实机，台账3/5剩2；并非全SDK/玩法通过，不接续/入库或计待验收。'},None,idem='direct-smash-profile-upload-consumers-v12-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':218,'files_verified':len(manifest),'previous_function_bodies_preserved':138267,'changed_previous_functions':[1756],'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'fixture_only_checks':3,'profile_write_upload_consumers_retired':True,'original_profile_local_work_and_notification_preserved':True,'profile_write_runtime_verified':False,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

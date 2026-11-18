"""Rebuild the isolated original-local-transport candidate on52; no launch or acceptance."""
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
base=Path('D:/GameLab/temp/direct-smash-local-game-data-v10-20261118');stage=Path('D:/GameLab/temp/direct-smash-local-transport-v11-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    linker=types.ModuleType('smash_profile_native_linker_20261118');exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'own-static-linker','exec'),linker.__dict__);sys.modules[linker.__name__]=linker
    code={};exec(compile(z.read('tools/smash_local_transport_native_link_v11_20261118.py'),'own-static-transport-linker','exec'),code)
    native,proof=code['assemble']((base/'candidate/Build/original.wasm').read_bytes(),z.read('support/own-native-bridge.wasm'));assert proof==recipe['native_link_proof']
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
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==217
for n in['local-profile.js','local-gamedata.js','local-gamedata-plan.json','StreamingAssets/aa/ftue-v4.original.json']:assert(stage/'candidate'/n).read_bytes()==(base/'candidate'/n).read_bytes(),n
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash v11接入原客户端真实Photon离线模式：仅在原核心服务、真实本地档案和原内容事务完整就绪后，把实际local:UUID绑定实际本地Player.UserId，调用原ConnectUsingSettings(AppSettings,true)；原函数建立真实本地传输角色/回调，不造认证对象或服务器响应。退役连接管理器Awake的Firebase身份消费者，Update仅在实际OfflineMode为真后进入，5处直接联网State读取改用原支持离线的NetworkClientState，实际本地大厅15/本地房间9不换常量；原UI/数据/房间/玩家/AI检查与提供者保留。自编所有者90秒有界等待，原连接拒绝/失败只尝试一次并显式报错；已有联网连接/别的玩家身份不接管。12类自编隔离通过，完整Wasm仅静态exit0，相对v10只改105269/105271，其余138264函数体保持，新增2函数/2导出；217文件逐SHA。未运行v11/接续/入库，台账仍3/5剩2；实际菜单、房间、赛车/AI、比赛和持久化尚未通过，不计待验收。'},None,idem='direct-smash-original-local-transport-v11-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':217,'files_verified':len(manifest),'previous_function_bodies_preserved':138264,'changed_previous_functions':[105269,105271],'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'fixture_only_checks':12,'local_transport_implemented':True,'local_transport_runtime_verified':False,'original_mode_aware_getter_and_offline_room_lifecycle_preserved':True,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

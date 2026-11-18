"""Stage isolated genuine local-user completion, not task acceptance or game execution."""
from pathlib import Path
import json,hashlib,zipfile,sys,copy,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda v:hashlib.sha256(v).hexdigest();svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
base=Path('D:/GameLab/temp/direct-smash-local-profile-v6r2-20261118');native_base=Path('D:/GameLab/temp/direct-smash-local-settings-v5-20261118');stage=Path('D:/GameLab/temp/direct-smash-local-user-v7-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    code={};exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'own-user-transaction-linker','exec'),code)
    linked,proof=code['link']((native_base/'candidate/Build/original.wasm').read_bytes(),z.read('support/own-native-bridge.wasm'),recipe['native_link_proof']['original_native_targets']);assert proof==recipe['native_link_proof']
    old=(base/'candidate/Build/original.wasm').read_bytes();old_bodies=code['bodies'](old,code['sections'](old));new_bodies=code['bodies'](linked,code['sections'](linked));assert len(old_bodies)==138249 and new_bodies[:len(old_bodies)]==old_bodies and len(new_bodies)==len(old_bodies)+1
    retirement=recipe['startup_consumer_retirement'];old_auth=(base/'candidate/scripts/auth.js').read_bytes();new_auth=z.read('overlay/scripts/auth.js');assert sha(old_auth)==retirement['auth_before_sha256']and sha(new_auth)==retirement['auth_after_sha256']and old_auth==new_auth+retirement['removed_auth_load_registration'].encode()
    stage.mkdir(exist_ok=True)
    def publish(n,raw):
        p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw,n
        else:write_bytes(p,raw)
    for n,h in manifest.items():publish(n,z.read(n))
    for n,h in recipe['candidate_manifest'].items():
        if 'overlay/'+n in manifest:raw=z.read('overlay/'+n)
        elif n=='Build/original.wasm':raw=linked
        else:raw=(base/'candidate'/n).read_bytes()
        assert sha(raw)==h,n;publish('candidate/'+n,raw)
    candidate_raw=json.dumps(recipe['candidate_manifest'],sort_keys=True,indent=2).encode();publish('CANDIDATE_MANIFEST.json',candidate_raw);publish('MANIFEST.json',manifest_raw)
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==209
assert(stage/'candidate/Build/original.framework.js').read_bytes()==(base/'candidate/Build/original.framework.js').read_bytes()
assert recipe['fixture_only_checks']==17 and not recipe['authentication_permission_flags_written']and not recipe['startup_consumer_retirement']['provider_functions_replaced']
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash本地用户事务v7独立候选已同步52：本地信封写入/读回、原生双类型恢复、身份核对及归一快照再次保存都实际成功后，才调用原UserService数据就绪设置并发出原UnityEvent<bool>数据变化事件；不是Firebase认证成功，原平台认证/权限旗标不写。17项自编隔离检查验证失败不完成、身份错误不完成、事件幂等及邻近字段保持。原v6r2全部138249函数体逐SHA不变，只追加1本地事务函数/导出。auth.js只移除页面load自动登录注册，HTML退役平台认证监听与Unity加载后的令牌请求两个启动消费者，原提供者函数不换成功桩，其他SDK/云端消费者仍存在。完整Wasm静态校验exit0，209文件52逐SHA；未运行v7、未观察/接续/入库，仍3/5剩2。其他初始化数据、离线房间/玩家/AI及玩法未完成，原任务/版本/暂停/历史保持，不计待验收。'},None,idem='direct-smash-real-local-user-v7-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'files_verified':len(manifest),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':209,'previous_function_bodies_preserved':138249,'own_new_completion_functions':1,'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'isolated_own_fixture_checks':17,'game_executed':False,'ready_review':False,'local_user_completion_integrated':True,'local_user_completion_runtime_verified':False,'authentication_permission_flags_written':False,'startup_auth_consumers_retired':3,'all_sdk_retired':False,'local_room_player_ai_integrated':False,'job_unchanged':True,'manual_pause_preserved':True,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

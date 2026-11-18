"""SHA-rebuild the isolated auth-consumer retirement candidate on52; never launch it."""
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
base=Path('D:/GameLab/temp/direct-smash-profile-write-v12-20261118');stage=Path('D:/GameLab/temp/direct-smash-auth-consumers-v13r2-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    for name in['smash_profile_native_linker_20261118','smash_profile_write_consumer_v12_20261118']:
        module=types.ModuleType(name);exec(compile(z.read('tools/'+name+'.py'),'own-static-source-utility','exec'),module.__dict__);sys.modules[name]=module
    code={};exec(compile(z.read('tools/smash_auth_consumers_v13_20261118.py'),'own-auth-consumer-retirement','exec'),code)
    contract=json.loads(z.read('source-proof/native-auth-consumer-retirement-contract-v13.json'));native,proof=code['assemble']((base/'candidate/Build/original.wasm').read_bytes(),contract);assert proof==recipe['native_change_proof']
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
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==219
for n in['local-profile.js','local-gamedata.js','local-gamedata-plan.json','local-transport.js','scripts/auth.js','StreamingAssets/aa/ftue-v4.original.json']:assert(stage/'candidate'/n).read_bytes()==(base/'candidate'/n).read_bytes(),n
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash v13r2退役剩余认证启动/恢复消费者：FirebaseAuthService.Awake101109保留原metadata及Singleton<FirebaseAuthService>.Awake4707完整初始化，停止其后缓存Firebase UID读取/云端身份配置；OnApplicationPause101103/OnApplicationFocus101102各只退役一条26068认证恢复call并消费原两参数，保留原焦点/时间记录。原26068会调用2736清空User80并读取两份云档，不能让已持久化本地档案再被旧云恢复覆盖。未写Auth UID、账号/权限旗标或认证成功回调；Firebase及本地核心提供者字节保持。HTML只移除实际CrazyGames.SDK.init().then加载统计消费者，Firebase initializeApp及未审计消费者继续如实保留，不宣称全SDK完成。3类自编隔离核对singleton仍一次、pause/focus本地记录保持、不请求云恢复；完整Wasm静态0。相对v12只改101102/101103/101109，其余138265体保持，无新增函数/导出/数据；219文件SHA。未实机/接续/入库，原任务/暂停及3/5剩2保持，不计待验收。'},None,idem='direct-smash-auth-startup-resume-consumers-v13r2-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':219,'files_verified':len(manifest),'previous_function_bodies_preserved':138265,'changed_previous_functions':[101102,101103,101109],'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'fixture_only_checks':3,'auth_consumers_retired':True,'original_base_singleton_initialization_preserved':True,'auth_consumers_runtime_verified':False,'all_sdk_retired':False,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

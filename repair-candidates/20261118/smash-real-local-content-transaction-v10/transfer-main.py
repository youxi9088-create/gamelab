"""SHA-rebuild one isolated local-content candidate on52, without running or accepting it."""
from pathlib import Path
import json,hashlib,zipfile,sys,copy,types,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda v:hashlib.sha256(v).hexdigest();svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
base=Path('D:/GameLab/temp/direct-smash-optional-services-v9r2-20261118');stage=Path('D:/GameLab/temp/direct-smash-local-game-data-v10-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    linker=types.ModuleType('smash_profile_native_linker_20261118');exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'static-own-linker','exec'),linker.__dict__);sys.modules[linker.__name__]=linker
    code={};exec(compile(z.read('tools/smash_local_game_data_native_link_v10_20261118.py'),'static-own-data-link','exec'),code)
    native,proof=code['assemble']((base/'candidate/Build/original.wasm').read_bytes(),z.read('support/own-native-bridge.wasm'));assert proof==recipe['native_link_proof']
    stage.mkdir(exist_ok=True)
    def publish(n,raw):
        p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw,n
        else:write_bytes(p,raw)
    for n in manifest:publish(n,z.read(n))
    for n,h in recipe['candidate_manifest'].items():
        raw=z.read('overlay/'+n)if 'overlay/'+n in manifest else native if n=='Build/original.wasm'else(base/'candidate'/n).read_bytes()
        assert sha(raw)==h,n;publish('candidate/'+n,raw)
    candidate_raw=json.dumps(recipe['candidate_manifest'],sort_keys=True,indent=2).encode();publish('CANDIDATE_MANIFEST.json',candidate_raw);publish('MANIFEST.json',manifest_raw)
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==215
assert(stage/'candidate/local-profile.js').read_bytes()==(base/'candidate/local-profile.js').read_bytes()
assert(stage/'candidate/StreamingAssets/aa/ftue-v4.original.json').read_bytes()==(base/'candidate/StreamingAssets/aa/ftue-v4.original.json').read_bytes()
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash v10真实本地内容事务候选同步52：读取原生七预设和实际1493物品/48分组，身份及来源校验、独立本地记录CAS写入/读回后，沿原Dictionary类型解析与17602/43610完整应用/事件接入；dayId明确来自真实本机UTC日历，不宣称服务端时间，不拦截Firebase响应/模拟SDK成功。只改8457请求消费者为本地排队，保留原ready/完整应用/错误检查；未取到的奖励/赛季/挑战等键不提供。10类自编隔离保护通过，完整Wasm静态验证0，相对v9r2仅8457变化，其余138254函数体保持，新增11函数/8导出。215文件逐SHA；未执行v10或接续/入库，仍3/5剩2。完整SDK、其它云端更新、菜单/房间/玩家/AI和玩法仍待验证，不计待验收。'},None,idem='direct-smash-real-local-content-v10-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':215,'files_verified':len(manifest),'previous_function_bodies_preserved':138254,'changed_previous_functions':[8457],'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'fixture_only_checks':10,'local_game_data_transaction_implemented':True,'local_game_data_transaction_runtime_verified':False,'original_ready_getter_and_typed_application_preserved':True,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

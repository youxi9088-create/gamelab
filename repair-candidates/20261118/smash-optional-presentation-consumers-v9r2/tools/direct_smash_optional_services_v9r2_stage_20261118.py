"""Reassemble an isolated optional-consumer retirement on 52, without running it."""
from pathlib import Path
import json,hashlib,sys,copy,zipfile,types,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda v:hashlib.sha256(v).hexdigest();svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
base=Path('D:/GameLab/temp/direct-smash-local-ftue-v8-20261118');stage=Path('D:/GameLab/temp/direct-smash-optional-services-v9r2-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    linker=types.ModuleType('smash_profile_native_linker_20261118');exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'own-static-linker','exec'),linker.__dict__);sys.modules[linker.__name__]=linker
    assembler={};exec(compile(z.read('tools/smash_optional_services_native_link_v9_20261118.py'),'own-static-assembler','exec'),assembler)
    native,proof=assembler['assemble']((base/'candidate/Build/original.wasm').read_bytes(),z.read('support/own-native-bridge.wasm'),json.loads(z.read('support/original-retirement-contract.json')));assert proof==recipe['native_link_proof']
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
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==212
assert(stage/'candidate/StreamingAssets/aa/ftue-v4.original.json').read_bytes()==(base/'candidate/StreamingAssets/aa/ftue-v4.original.json').read_bytes()
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash v9资讯/推广消费者退役候选同步52：根据78方法/76原函数体，将原loader中两个在线展示请求调用、对应展示依赖和三个实际面板Start一并退役；原服务/回调/数据ready/奖励/权限不伪造。仍要求真实设置、本地持久化用户、原Ftue解析及原GameData完整性/加载状态，5类自编检查覆盖256状态且不写服务数据字段。相对v8只有6个原消费者变化，其余138245函数体保持，新增4自编函数/3导出。212文件逐SHA，完整Wasm静态校验0；尚未运行、未扣步，仍3/5剩2。GameData/其它云端SDK/离线房间玩家AI和核心玩法未完成，不计待验收，任务/版本/暂停/历史保持。'},None,idem='direct-smash-optional-consumer-v9r2-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':212,'files_verified':len(manifest),'previous_function_bodies_preserved':138245,'changed_previous_functions':proof['changed_previous_functions'],'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'fixture_only_checks':5,'fixture_state_cases':256,'core_data_requirements_preserved':True,'optional_services_marked_ready':False,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

"""Stage one isolated typed local-profile candidate without game execution or queue mutation."""
from pathlib import Path
import json,hashlib,zipfile,sys,copy,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda v:hashlib.sha256(v).hexdigest();svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
base=Path('D:/GameLab/temp/direct-smash-local-settings-v5-20261118');stage=Path('D:/GameLab/temp/direct-smash-local-profile-v6r2-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    code={};exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'own-native-append-linker','exec'),code)
    linked,proof=code['link']((base/'candidate/Build/original.wasm').read_bytes(),z.read('support/own-native-bridge.wasm'),recipe['link_proof']['original_native_targets']);assert proof==recipe['link_proof']
    assert proof['original_defined_functions_unchanged']==138243 and len(proof['appended_function_indices'])==6
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
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==208
for n in['scripts/auth.js','Build/original.framework.js']:
    assert(stage/'candidate'/n).read_bytes()==(base/'candidate'/n).read_bytes()
assert recipe['fixture_only_checks']==14 and not recipe['user_service_ready_written']and not recipe['authenticated_provider_result_fabricated']
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash原生用户数据本地档案v6独立候选已同步52：原v5全部138243函数体逐SHA保持，仅追加6个自编Wasm桥及5导出；原JSON序列化/两类数据泛型解析/托管字符串调用实际ABI绑定，原UserService.ready/认证标志不写。独立浏览器档案保存两类原生JSON原文、local:UUID、版本与误损坏校验；写前冲突检查、上一代备份、写后核对，坏档/存储失败不重置，原PlayerPrefs/Unity存档不动。14项只用自编WAT/JS/数据的隔离验证和链接器ABI拒绝通过，原完整Wasm只静态校验，208文件52逐SHA。未运行v6、未启观察/接续/入库，仍3/5剩2。真实浏览器持久化/新错误提示未验收，用户服务最终生命周期、平台消费者退役及离线房间/玩家/AI尚未完成，原任务/版本/暂停/历史不变，不计待验收。'},None,idem='direct-smash-typed-local-profile-v6-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'files_verified':len(manifest),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':208,'original_function_bodies_preserved':138243,'own_appended_functions':6,'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'isolated_own_fixture_checks':14,'game_executed':False,'ready_review':False,'local_profile_storage_integrated':True,'local_profile_runtime_verified':False,'user_service_ready_written':False,'authenticated_provider_result_fabricated':False,'local_room_player_ai_integrated':False,'job_unchanged':True,'manual_pause_preserved':True,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

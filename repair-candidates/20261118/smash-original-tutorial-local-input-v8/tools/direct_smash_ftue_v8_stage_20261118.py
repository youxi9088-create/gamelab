"""Reassemble and SHA-check an isolated candidate on 52; never launch a game."""
from pathlib import Path
import json,hashlib,sys,copy,zipfile,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda v:hashlib.sha256(v).hexdigest();svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
stage=Path('D:/GameLab/temp/direct-smash-local-ftue-v8-20261118');base=Path('D:/GameLab/temp/direct-smash-local-user-v7-20261118')
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    for n,h in manifest.items():assert sha(z.read(n))==h,n
    # Import only supplied static assembly utilities, never the game module.
    import types
    linker=types.ModuleType('smash_profile_native_linker_20261118');exec(compile(z.read('tools/smash_profile_native_linker_20261118.py'),'own-static-linker','exec'),linker.__dict__);sys.modules[linker.__name__]=linker
    assembler={};exec(compile(z.read('tools/smash_ftue_native_link_v8_20261118.py'),'own-static-assembler','exec'),assembler)
    native,proof=assembler['assemble']((base/'candidate/Build/original.wasm').read_bytes(),z.read('support/own-native-bridge.wasm'));assert proof==recipe['native_link_proof']
    raw=z.read('overlay/StreamingAssets/aa/ftue-v4.original.json');assert sha(raw)==recipe['original_ftue_sha256']and len(raw)==4251 and len(json.loads(raw))==4
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
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==211
assert(stage/'candidate/local-profile.js').read_bytes()==(base/'candidate/local-profile.js').read_bytes()
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash v8原教程输入本地化已同步52独立候选：4251字节公开静态原JSON按SHA完整保留，4项是教程配置不是关卡。只替换原31571 URL消费者，新增1个路径函数，沿原Application.streamingAssetsPath/String.Ctor/Concat生成可迁移同源路径；v7其余138249函数体、metadata数据、原Ftue下载/类型解析/完成判断保持。不造空数组、认证或就绪回调。3项自编隔离检查与完整Wasm静态验证通过，211文件52重建逐SHA；未运行游戏、未扣步，仍3/5剩2。其余服务/云端/SDK、离线房间/玩家/AI及玩法尚未完成，不计待验收。'},None,idem='direct-smash-original-ftue-v8-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'candidate_manifest_sha256':sha(candidate_raw),'files_verified':len(manifest),'candidate_files':211,'previous_function_bodies_preserved':138249,'changed_original_consumer':31571,'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'fixture_only_checks':3,'original_ftue_sha256':recipe['original_ftue_sha256'],'original_ftue_bytes':4251,'tutorial_configurations':4,'native_ftue_runtime_verified':False,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2}
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

"""Reconstruct a portable URI repair from verified original52 bytes; no gameplay."""
from pathlib import Path
import json,hashlib,zipfile,sys,copy,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda raw:hashlib.sha256(raw).hexdigest()
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw)
assert ledger['used']==1 and ledger['remaining']==4 and ledger['steps'][0]['status']=='observed_failed'
base=Path('D:/GameLab/temp/direct-smash-startup-settings-v2-20261118');stage=Path('D:/GameLab/temp/direct-smash-runtime-uri-v3-20261118')
def leb(raw,p):
    v=shift=0
    while True:
        byte=raw[p];p+=1;v|=(byte&127)<<shift;shift+=7
        if not byte&128:return v,p
        assert shift<=35
def u(v):
    raw=bytearray()
    while True:
        x=v&127;v>>=7;raw.append(x|128 if v else x)
        if not v:return raw
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'))
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    stage.mkdir(exist_ok=True)
    def publish(name,raw):
        p=(stage/name).resolve();assert p.is_relative_to(stage.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw,name
        else:write_bytes(p,raw)
    for n,h in manifest.items():
        raw=z.read(n);assert sha(raw)==h,n;publish(n,raw)
    meta={x['target']:x for x in recipe['metadata_patches']};wp=recipe['wasm_patch'];preservation=json.loads(z.read('support/function-preservation.json'))
    for row in recipe['copies']:
        source=(base/'candidate'/row['source']).resolve();assert source.is_relative_to((base/'candidate').resolve());raw=source.read_bytes();assert sha(raw)==row['sha256'];name=row['target']
        if 'overlay/'+name in manifest:raw=z.read('overlay/'+name)
        elif name in meta:
            patch=meta[name];assert sha(raw)==patch['source_sha256'];p=patch['offset'];old=bytes.fromhex(patch['before_hex']);new=bytes.fromhex(patch['after_hex']);assert len(old)==len(new)==57 and raw[p:p+57]==old
            raw=raw[:p]+new+raw[p+57:];assert sha(raw)==patch['target_sha256']
        elif name=='Build/original.wasm':
            assert sha(raw)==wp['source_wasm_sha256'];sections=[];p=8;imports=None
            while p<len(raw):
                start=p;kind=raw[p];n,p=leb(raw,p+1);end=p+n;assert end<=len(raw);sections.append((kind,start,p,end));p=end
            import_sec=next(x for x in sections if x[0]==2);imports,_=leb(raw,import_sec[2])
            code=next(x for x in sections if x[0]==10);count,p=leb(raw,code[2]);payload=bytearray(u(count));changed_count=0
            assert count==len(preservation)==wp['defined_functions']
            for i in range(count):
                n,p=leb(raw,p);body=raw[p:p+n];p+=n;fn=imports+i;proof=preservation[i];assert proof['function_index']==fn and proof['before']==sha(body)
                if fn==35469:assert body.hex()==wp['original_body_hex'];body=bytes.fromhex(wp['after_body_hex']);changed_count+=1
                assert sha(body)==proof['after'];payload.extend(u(len(body)));payload.extend(body)
            assert p==code[3]and changed_count==1
            result=bytearray(raw[:8])
            for kind,start,p,end in sections:
                if kind==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
                else:result.extend(raw[start:end])
            raw=bytes(result);assert sha(raw)==wp['target_wasm_sha256']
        assert sha(raw)==recipe['candidate_manifest'][name],name;publish('candidate/'+name,raw)
    assert len([x for x in(stage/'candidate').rglob('*')if x.is_file()])==205
    for n,h in recipe['candidate_manifest'].items():assert sha((stage/'candidate'/n).read_bytes())==h,n
    ns={};exec(compile(z.read('tools/unity_hash128_spooky_v2_20261118.py'),'hash-only','exec'),ns)
    for catalog in recipe['catalogs']:
        p=stage/'candidate'/catalog['name'];doc=json.loads(p.read_bytes());assert ns['unity_hash128'](p.read_bytes())==p.with_suffix('.hash').read_text()==catalog['hash128'];assert doc['m_BuildResultHash']==catalog['m_BuildResultHash']
        local=[x for x in doc['m_InternalIds']if x.startswith(recipe['native_prefix_after'])];assert len(local)==83
        for name in local:assert(stage/'candidate/StreamingAssets/aa'/name.removeprefix(recipe['native_prefix_after'])).is_file()
    candidate_raw=json.dumps(recipe['candidate_manifest'],sort_keys=True,indent=2).encode();publish('CANDIDATE_MANIFEST.json',candidate_raw);publish('MANIFEST.json',manifest_raw)
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash真实第1步原生启动暴露Unity TextDataProvider拒绝相对目录路径；原WASM/框架/数据及3份启动配置已实际加载，不是游戏通过。依据原metadata/Wasm映射26827 ResolveInternalId及12681 CreateLocator源码，新独立v3将57字节资源前缀改原Addressables.RuntimePath属性，原35469 getter只追加调用原26827解析为绝对同源URI；其余138242函数体保持，完整Wasm静态校验通过（非实机）。162bundle保持，资源迁至StreamingAssets/aa，两目录各83地址同步用原运行时属性，.hash按新真实内容重算，校验/缓存键/原玩法不改。52新205文件候选逐SHA核对；未启动v3，仍沿实际1/5台账剩4步。Firebase/账号/ByteBrew/Unity遥测等实际外联已记证据，仍未退役，不造成功/就绪。原任务整行/历史/暂停保持，不安装/接续/入库或供货。'},None,idem='direct-smash-runtime-uri-v3-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),complete=True,stage=str(stage),manifest_sha256=sha(manifest_raw),files_verified=len(manifest),candidate_manifest_sha256=sha(candidate_raw),candidate_files=205,original_bundles_unchanged=162,changed_wasm_function=35469,unchanged_other_wasm_functions=wp['unchanged_other_function_bodies'],metadata_regions=2,original_runtime_property_resolution_used=True,static_wasm_validation_exit=wp['wasm_static_validation_exit'],game_executed=False,prior_revision_game_steps_used=1,ui_steps_used=1,ui_steps_remaining=4,ready_review=False,sdk_retired=False,job_unchanged=True,manual_pause_preserved=True)
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

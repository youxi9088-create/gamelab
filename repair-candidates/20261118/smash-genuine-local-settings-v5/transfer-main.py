"""Install an immutable isolated candidate only; do not execute, resume or promote a game."""
from pathlib import Path
import json,hashlib,zipfile,sys,copy,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda v:hashlib.sha256(v).hexdigest();svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2 and ledger['steps'][-1]['status']=='observed_partial'
base=Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118');stage=Path('D:/GameLab/temp/direct-smash-local-settings-v5-20261118')
def leb(v,p):
    n=shift=0
    while True:
        x=v[p];p+=1;n|=(x&127)<<shift;shift+=7
        if not x&128:return n,p
        assert shift<=35
def u(n):
    v=bytearray()
    while True:
        x=n&127;n>>=7;v.append(x|128 if n else x)
        if not n:return bytes(v)
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw);recipe=json.loads(z.read('support/assembly-recipe.json'));preservation=json.loads(z.read('support/function-preservation.json'));patch=recipe['wasm_patch']
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
    assert patch['function_index']==43424 and patch['retained_original_application_function']==26015 and not patch['direct_readiness_stores']and not patch['provider_callback_invocation']
    assert bytes.fromhex(patch['target_body_hex'])==b'\0\x20\0'+b'\x41\0'*3+b'\x10'+u(26015)+b'\x0b'
    stage.mkdir(exist_ok=True)
    def publish(n,raw):
        p=(stage/n).resolve();assert p.is_relative_to(stage.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw,n
        else:write_bytes(p,raw)
    for n,h in manifest.items():
        raw=z.read(n);assert sha(raw)==h,n;publish(n,raw)
    for n,h in recipe['candidate_manifest'].items():
        if 'overlay/'+n in manifest:raw=z.read('overlay/'+n)
        else:
            raw=(base/'candidate'/n).read_bytes()
            if n=='Build/original.wasm':
                assert sha(raw)==recipe['source_wasm_sha256'];sections=[];p=8
                while p<len(raw):
                    begin=p;kind=raw[p];size,p=leb(raw,p+1);end=p+size;assert end<=len(raw);sections.append((kind,begin,p,end));p=end
                imports,_=leb(raw,next(x for x in sections if x[0]==2)[2]);code=next(x for x in sections if x[0]==10);count,p=leb(raw,code[2]);payload=bytearray(u(count));modified=0;assert count==recipe['defined_functions']==len(preservation)
                for i in range(count):
                    size,p=leb(raw,p);body=raw[p:p+size];p+=size;fn=imports+i;proof=preservation[i];assert proof['function_index']==fn and sha(body)==proof['before']
                    if fn==43424:
                        assert body.hex()==patch['source_body_hex'];body=bytes.fromhex(patch['target_body_hex']);modified+=1
                    assert sha(body)==proof['after'];payload.extend(u(len(body)));payload.extend(body)
                assert p==code[3]and modified==1
                result=bytearray(raw[:8])
                for kind,begin,p,end in sections:
                    if kind==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
                    else:result.extend(raw[begin:end])
                raw=bytes(result);assert sha(raw)==recipe['target_wasm_sha256']
        assert sha(raw)==h,n;publish('candidate/'+n,raw)
    candidate_raw=json.dumps(recipe['candidate_manifest'],sort_keys=True,indent=2).encode();publish('CANDIDATE_MANIFEST.json',candidate_raw);publish('MANIFEST.json',manifest_raw)
assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==206
for n in ['index.html','scripts/auth.js','Build/original.framework.js']:
    assert(stage/'candidate'/n).read_bytes()==(base/'candidate'/n).read_bytes(),n
assert all(p['unchanged']for p in preservation if p['function_index']in[26015,43254])
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'Smash本地配置消费者v5独立候选已同步52：仅将原GameSettingsService.gbs43424的远端common/platform配置查询改为调用未改动的原gbx26015完整配置应用事务，采用原GameSettingsData构造43254内置默认值，原字段应用/剩余字段/事件及异常传播保持，不直接写ready、不伪造URL/下载/Firebase账号或成功回调。相对v4其他138242函数体逐SHA一致，完整Wasm静态校验exit0；原162bundle、框架、网页/认证代码不变。206文件逐SHA，未执行v5、未启动观察/转换/入库；仍3/5剩2。原用户持久化/离线房间/玩家/AI及其他SDK仍未完成，不计待验收，原任务/版本/暂停/历史保持。'},None,idem='direct-smash-genuine-local-settings-v5-20261118-'+sha(manifest_raw)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'complete':True,'stage':str(stage),'manifest_sha256':sha(manifest_raw),'files_verified':len(manifest),'candidate_manifest_sha256':sha(candidate_raw),'candidate_files':206,'changed_consumer':43424,'retained_original_settings_application':26015,'retained_original_settings_constructor':43254,'unchanged_other_function_bodies':len(preservation)-1,'static_wasm_validation_exit':recipe['static_wasm_validation_exit'],'game_executed':False,'ready_review':False,'local_settings_application_integrated':True,'local_settings_runtime_verified':False,'local_profile_persistence_integrated':False,'local_room_player_ai_integrated':False,'job_unchanged':True,'manual_pause_preserved':True,'ui_steps_used':3,'ui_steps_remaining':2};write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

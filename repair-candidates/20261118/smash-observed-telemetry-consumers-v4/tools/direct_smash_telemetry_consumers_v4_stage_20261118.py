"""Stage only specifically evidenced analytics-consumer retirement; no game or queue action."""
from pathlib import Path
import json,hashlib,zipfile,sys,copy,datetime
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
from controlplane.store import ACTOR
sha=lambda raw:hashlib.sha256(raw).hexdigest()
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766');jid='job-3db06205247a'
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs',jid))
assert before['status']=='blocked'and not before.get('version_id')and not before.get('manual_paused')
parent=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(parent/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==2 and ledger['remaining']==3 and ledger['steps'][-1]['status']=='observed_partial'
base=Path('D:/GameLab/temp/direct-smash-runtime-uri-v3-20261118');stage=Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118')
def leb(raw,p):
    v=shift=0
    while True:
        x=raw[p];p+=1;v|=(x&127)<<shift;shift+=7
        if not x&128:return v,p
        assert shift<=35
def u(v):
    raw=bytearray()
    while True:
        x=v&127;v>>=7;raw.append(x|128 if v else x)
        if not v:return raw
with zipfile.ZipFile(sys.argv[0])as z:
    raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest);recipe=json.loads(z.read('support/assembly-recipe.json'));preservation=json.loads(z.read('support/function-preservation.json'))
    assert json.loads((base/'CANDIDATE_MANIFEST.json').read_bytes())==recipe['base_candidate_manifest']
    for n,h in recipe['base_candidate_manifest'].items():assert sha((base/'candidate'/n).read_bytes())==h,n
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
                    start=p;kind=raw[p];size,p=leb(raw,p+1);end=p+size;assert end<=len(raw);sections.append((kind,start,p,end));p=end
                imports,_=leb(raw,next(x for x in sections if x[0]==2)[2]);code=next(x for x in sections if x[0]==10);count,p=leb(raw,code[2]);payload=bytearray(u(count));modified=0
                assert count==recipe['defined_functions']==len(preservation)
                patch=recipe['wasm_patch'];pattern=bytes.fromhex(patch['removed_sequence_hex'])
                for i in range(count):
                    size,p=leb(raw,p);body=raw[p:p+size];p+=size;fn=imports+i;proof=preservation[i];assert proof['function_index']==fn and sha(body)==proof['before']
                    if fn==patch['function_index']:
                        assert body.hex()==patch['source_body_hex']and body.count(pattern)==1
                        at=patch['body_offset'];assert body[at:at+len(pattern)]==pattern;body=body[:at]+body[at+len(pattern):];assert body.hex()==patch['target_body_hex'];modified+=1
                    assert sha(body)==proof['after'];payload.extend(u(len(body)));payload.extend(body)
                assert p==code[3]and modified==1
                result=bytearray(raw[:8])
                for kind,start,p,end in sections:
                    if kind==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
                    else:result.extend(raw[start:end])
                raw=bytes(result);assert sha(raw)==recipe['target_wasm_sha256']
        assert sha(raw)==h,n;publish('candidate/'+n,raw)
    assert len([p for p in(stage/'candidate').rglob('*')if p.is_file()])==205
    html=(stage/'candidate/index.html').read_text(encoding='utf8')
    assert 'analytics = firebase.analytics();'not in html and 'firebaseSetScreen("loading_start");'not in html and 'firebaseLogEvent("loading_page_start");'not in html
    assert 'firebase-analytics-compat.js'not in html and 'firebase.initializeApp(firebaseConfig);'in html
    assert 'let enableFirebaseAnalytics=!1;'in(stage/'candidate/scripts/constants.js').read_text(encoding='utf8')
    assert(stage/'candidate/scripts/auth.js').read_bytes()==(base/'candidate/scripts/auth.js').read_bytes()
    assert(stage/'candidate/Build/original.framework.js').read_bytes()==(base/'candidate/Build/original.framework.js').read_bytes()
    candidate_raw=json.dumps(recipe['candidate_manifest'],sort_keys=True,indent=2).encode();publish('CANDIDATE_MANIFEST.json',candidate_raw);publish('MANIFEST.json',raw_manifest)
ACTOR.set({'id':'codex-direct-repair','username':'Codex逐款直接修复','role':'admin'})
svc.mutate('/api/jobs/'+jid+'/work-log',{'message':'依据Smash第2步真实失败栈准备v4独立源码候选：只移除原Preloader.Start106283内对ByteBrew初始化26516的单次消费者调用及参数，不替换提供者/游戏方法或伪造ready/成功/账号。相对v3其余138242函数体SHA保持，v3目录URI修复保留，完整Wasm静态校验exit0。网页移除Firebase Analytics模块装载、无条件analytics初始化/gtag配置/启动跟踪消费者，并将原跟踪开关false；原Firebase认证/数据库主逻辑、框架与162bundle保持，Unity原生遥测及其他SDK尚未退役。真实52独立stage205文件逐SHA，无v4游戏执行/观察任务/新增玩家操作，台账仍2/5剩3。尚未完成本地配置/角色/房间/AI初始化，不计待验收，原任务/历史/暂停保持。'},None,idem='direct-smash-telemetry-consumers-v4-20261118-'+sha(raw_manifest)[:12])
with svc.store.read()as db:assert svc.get(db,'jobs',jid)==before
assert(parent/'ui-ledger.json').read_bytes()==ledger_raw
out=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),complete=True,stage=str(stage),manifest_sha256=sha(raw_manifest),files_verified=len(manifest),candidate_manifest_sha256=sha(candidate_raw),candidate_files=205,changed_native_function=106283,removed_native_consumer_target=26516,unchanged_other_function_bodies=138242,static_wasm_validation_exit=0,original_firebase_authentication_preserved=True,framework_unchanged=True,original_bundle_count=162,all_sdk_retired=False,game_executed=False,ready_review=False,ui_steps_used=2,ui_steps_remaining=3,job_unchanged=True,manual_pause_preserved=True)
write_bytes(stage/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

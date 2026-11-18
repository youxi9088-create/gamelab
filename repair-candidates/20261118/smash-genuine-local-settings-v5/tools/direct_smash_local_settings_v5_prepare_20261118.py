"""Replace the configuration request consumer with the game's genuine default-application transaction."""
from pathlib import Path
import json,hashlib,zipfile,datetime,subprocess,sys,contextlib,io
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'local-settings-v5-support-20261118'
if out.exists():assert not any(out.iterdir()),'Preserve an already populated immutable candidate.'
else:out.mkdir()
sha=lambda v:hashlib.sha256(v).hexdigest()
# Read existing local immutable bytes only; this prefix defines a v3 material reader.
src=(b/'direct_smash_telemetry_consumers_v4_prepare_20261118.py').read_text(encoding='utf8').split('runtime=json.loads')[0].replace(';assert not out.exists();out.mkdir()','')
ns={'__file__':str(b/'direct_smash_telemetry_consumers_v4_prepare_20261118.py')}
with contextlib.redirect_stdout(io.StringIO()):exec(compile(src,'read-immutable-material-bytes-only','exec'),ns)
v4=r/'telemetry-consumers-v4-support-20261118';recipe4=json.loads((v4/'support/assembly-recipe.json').read_bytes());base_manifest=recipe4['candidate_manifest']
def base(n):
    p=v4/'overlay'/n
    if p.exists():v=p.read_bytes()
    elif n=='Build/original.wasm':v=(v4/'telemetry-call-removal-static-validation-only.wasm').read_bytes()
    else:v=ns['base'](n)
    assert sha(v)==base_manifest[n],n
    return v
contract_raw=(r/'analysis-20261118/local-profile-constructors/original-local-bootstrap-contract-v2.json').read_bytes();contract=json.loads(contract_raw)
assert contract['exact_generic_settings_contract_verified']and not contract['game_executed']
source=json.loads((r/'analysis-20261118/complex-bootstrap-c-source/original-complex-c-source.json').read_bytes())
gbx=next(x for x in source['original_c_source_snippets']if x['function_index']==26015);assert gbx['source_bytes']==503769
assert 'w2c_smash__static__analysis_f43254(instance, var_i0, var_i1);'in gbx['source']
services=json.loads((r/'analysis-20261118/data-services-v2/service-original-source-proof.json').read_bytes());consumer=next(x for x in services['original_source_snippets']if x['function_index']==43424)
assert 'GameSettingsService_gbt_43423(a, a);'in consumer['source']and 'GameSettingsService_gbu_43422(a, a);'in consumer['source']
ctor_raw=(r/'analysis-20261118/settings-default-constructor-source/original-settings-constant-source.json').read_bytes();ctor=json.loads(ctor_raw);assert ctor['original_body_hashes'][0]['function_index']==43254
def leb(v,p):
    value=shift=0
    while True:
        x=v[p];p+=1;value|=(x&127)<<shift;shift+=7
        if not x&128:return value,p
        assert shift<=35
def u(n):
    v=bytearray()
    while True:
        x=n&127;n>>=7;v.append(x|128 if n else x)
        if not n:return bytes(v)
raw=base('Build/original.wasm');sections=[];p=8
while p<len(raw):
    begin=p;kind=raw[p];n,p=leb(raw,p+1);end=p+n;assert end<=len(raw);sections.append((kind,begin,p,end));p=end
imports,_=leb(raw,next(x for x in sections if x[0]==2)[2]);code=next(x for x in sections if x[0]==10);count,p=leb(raw,code[2]);payload=bytearray(u(count));preservation=[];patch=None
target_body=b'\0\x20\0'+b'\x41\0'*3+b'\x10'+u(26015)+b'\x0b'
original_proof=next(x for x in services['mapping']['original_body_proofs']if x['function_index']==43424)
for i in range(count):
    n,p=leb(raw,p);body=raw[p:p+n];p+=n;fn=imports+i;changed=body
    if fn==43424:
        assert sha(body)==original_proof['body_sha256'];changed=target_body
        patch=dict(function_index=fn,source_body_hex=body.hex(),target_body_hex=changed.hex(),source_body_sha256=sha(body),target_body_sha256=sha(changed),original_consumer='GameSettingsService.gbs',retired_request_consumers=[43423,43422],retained_original_application_function=26015,retained_original_default_constructor=43254,implementation='GameSettingsService.gbx(this, null, null, nullMethodInfo); original method constructs/merges its own dictionary, allocates original GameSettingsData, applies original shipped defaults to GameConstants and raises its original event; native failures propagate unchanged.',direct_readiness_stores=False,provider_callback_invocation=False,firebase_uid_synthesized=False)
    preservation.append({'function_index':fn,'before':sha(body),'after':sha(changed),'unchanged':body==changed});payload.extend(u(len(changed)));payload.extend(changed)
assert p==code[3]and patch and sum(not x['unchanged']for x in preservation)==1
result=bytearray(raw[:8])
for kind,begin,p,end in sections:
    if kind==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
    else:result.extend(raw[begin:end])
wasm=bytes(result);wp=out/'local-settings-default-application-static-validation-only.wasm';wp.write_bytes(wasm)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=55);assert res.returncode==0,res.stderr
assert next(x for x in preservation if x['function_index']==26015)['unchanged']and next(x for x in preservation if x['function_index']==43254)['unchanged']
candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(wasm)
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'))
profile['specification_v51']['sections']['system_design']=section_markdown('system_design','v5将配置请求消费者替换为原GameSettingsService.gbx(this,null,null)完整应用事务，使用原GameSettingsData构造与原字段/事件，不直接设置ready，不伪造远端配置URL/下载/Firebase成功。原默认值不等于线上实时配置。相对v4只改原消费者43424，应用26015、构造43254及其他138242函数体保留。配置适配尚未52运行，原账号、用户存档、房间/AI及其他SDK仍待处理。')
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','此前52第3步v4证实目录加载/两类遥测消费者退役，仍停蓝色加载页并报真实Firebase匿名认证失败。v5仅静态校验，未执行，不能继承成玩法通过。累计3/5剩2，暂无新增待验收。')
readme='''# Smash Karts 本地配置消费者适配（v5，未交付）

原消费者gbs43424为common/platform分别发起Firebase配置URL查询。新消费者直接调用未改动的原gbx26015完整应用事务，两个覆盖Dictionary<string,object>输入均null。原方法自己创建空字典，调用未改动的GameSettingsData构造43254，应用原内置默认字段到GameConstants、完成余下字段并发出原事件。没有伪造远端下载、回调或账号，没有单独写ready，也没有吞掉原应用方法的异常。

这是明确采用原构建内置默认配置的本地转换设计，不宣称获得原服务器实时配置。完整Wasm只静态校验，不在开发机执行原游戏。相对v4仅改变请求消费者43424，其他138242函数体逐SHA一致；URI与遥测修复保留。原162资源bundle、游戏配置应用逻辑、角色/关卡/奖励/经济数值字节未改。

尚未完成：Firebase主认证/数据库消费者退役，真实本地存档和用户生命周期、离线房间/玩家/AI、Unity遥测及其他SDK、推广UI、核心玩法与刷新存档实测。当前v5未运行，不是待验收，不重置3/5步账本。后续具备完整启动因果修复后再用剩余2步。
'''
files={'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（本地默认配置消费者适配未复验）',profile).encode(),'overlay/LOCAL_SETTINGS_ADAPTATION.md':readme.encode()}
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),base_stage='D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118',base_git_commit='357d8a2e0f7ca9df108c5bdb4394bb9497bd094f',base_candidate_manifest=base_manifest,candidate_manifest=candidate,wasm_patch=patch,source_wasm_sha256=sha(raw),target_wasm_sha256=sha(wasm),defined_functions=count,unchanged_other_function_bodies=count-1,static_wasm_validation_exit=res.returncode,game_executed=False,ready_review=False,ui_steps_used=3,ui_steps_remaining=2,all_sdk_retired=False,core_gameplay_verified=False,local_settings_application_integrated=True,local_settings_application_runtime_verified=False,local_profile_persistence_integrated=False,local_room_player_ai_integrated=False)
files['support/assembly-recipe.json']=json.dumps(proof,ensure_ascii=False,indent=2).encode();files['support/function-preservation.json']=json.dumps(preservation,separators=(',',':')).encode();files['support/original-settings-consumer.json']=json.dumps(consumer,ensure_ascii=False,indent=2).encode();files['support/original-default-constructor.json']=ctor_raw;files['support/original-local-data-contract.json']=contract_raw;files['support/original-full-settings-application.json']=json.dumps(gbx,ensure_ascii=False,indent=2).encode()
files['support/local-consumer.wat']=b'(func (param $this i32) (param $methodInfo i32)\n  local.get $this\n  i32.const 0\n  i32.const 0\n  i32.const 0\n  call 26015)\n'
for n in ['direct_smash_local_settings_v5_prepare_20261118.py','direct_smash_local_settings_v5_stage_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
target=b/'direct_smash_local_settings_v5_20261118.pyz';assert not target.exists();main=(b/'direct_smash_local_settings_v5_stage_20261118.py').read_bytes();compile(main,'stage-genuine-local-settings-consumer-only','exec')
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'packet':str(target),'files':len(files),'candidate_files':len(candidate),'static_wasm_validation_exit':res.returncode,'changed_consumer':43424,'retained_application':26015,'game_executed':False,'ui_steps_used':3,'ui_steps_remaining':2}))

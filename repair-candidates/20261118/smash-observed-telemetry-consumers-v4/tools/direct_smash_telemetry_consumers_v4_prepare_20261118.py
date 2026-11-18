"""Retire observed analytics startup consumers, without faking a provider or game readiness."""
from pathlib import Path
import json,hashlib,zipfile,subprocess,datetime,sys,copy,re,contextlib,io
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'telemetry-consumers-v4-support-20261118';assert not out.exists();out.mkdir()
sha=lambda raw:hashlib.sha256(raw).hexdigest()
v3=r/'runtime-uri-v3-support-20261118';v2=r/'startup-settings-v2-support-20261118';v1=r/'work-resource-localization-v1-markupfix-20261118';recipe3=json.loads((v3/'support/assembly-recipe.json').read_bytes());base_manifest=recipe3['candidate_manifest'];reverse={x['target']:x['source']for x in recipe3['copies']}
def base(name):
    p=v3/'overlay'/name
    if p.exists():raw=p.read_bytes()
    elif name=='Build/original.wasm':raw=(v3/'native-uri-resolver-full-validation-only.wasm').read_bytes()
    else:
        n=reverse[name];p=v2/'overlay'/n
        if not p.exists():p=v1/n
        raw=p.read_bytes()
        for patch in recipe3['metadata_patches']:
            if patch['target']==name:
                at=patch['offset'];assert raw[at:at+57].hex()==patch['before_hex'];raw=raw[:at]+bytes.fromhex(patch['after_hex'])+raw[at+57:]
    assert sha(raw)==base_manifest[name],name;return raw
runtime=json.loads((b/'direct-smash-step2-final-observation-20261118.json').read_bytes());assert any('initializeByteBrew'in str(x.get('args'))for x in runtime['error_events'])
source_proof=json.loads((r/'analysis-20261118/actual-telemetry-startup/original-settings-constant-source.json').read_bytes())
preloader=json.loads((r/'analysis-20261117/original-flow-source-excerpts.json').read_bytes());preloader_source=next(x['decompiled_source']for x in preloader['snippets']if x['method']=='Preloader_Start');assert 'f_wema(0);'in preloader_source
assert 'f_qzmb(a, a)'in next(x['source']for x in source_proof['original_source_snippets']if x['function_index']==26516)
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
        if not v:return bytes(raw)
raw=base('Build/original.wasm');sections=[];p=8
while p<len(raw):
    begin=p;kind=raw[p];n,p=leb(raw,p+1);end=p+n;assert end<=len(raw);sections.append((kind,begin,p,end));p=end
imports,_=leb(raw,next(x for x in sections if x[0]==2)[2]);code=next(x for x in sections if x[0]==10);count,p=leb(raw,code[2]);payload=bytearray(u(count));preservation=[];patch=None
pattern=b'\x41\0\x10'+u(26516)
for i in range(count):
    n,p=leb(raw,p);body=raw[p:p+n];p+=n;fn=imports+i;changed=body
    if fn==106283:
        assert body.count(pattern)==1
        at=body.index(pattern);changed=body[:at]+body[at+len(pattern):]
        patch=dict(function_index=fn,retired_call_target=26516,source_body_hex=body.hex(),target_body_hex=changed.hex(),removed_sequence_hex=pattern.hex(),body_offset=at,source_body_sha256=sha(body),target_body_sha256=sha(changed),source_decompiled_method='Preloader.Start',removal_scope='Remove one actual consumer call and its constant argument; do not replace SDK/provider bodies, write ready flags, synthesize account or success values.')
    preservation.append(dict(function_index=fn,before=sha(body),after=sha(changed),unchanged=body==changed));payload.extend(u(len(changed)));payload.extend(changed)
assert p==code[3]and patch and sum(not x['unchanged']for x in preservation)==1
result=bytearray(raw[:8])
for kind,begin,p,end in sections:
    if kind==10:result.append(10);result.extend(u(len(payload)));result.extend(payload)
    else:result.extend(raw[begin:end])
wasm=bytes(result);wp=out/'telemetry-call-removal-static-validation-only.wasm';wp.write_bytes(wasm)
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=55);assert res.returncode==0,res.stderr
html=base('index.html').decode();retired=[]
tag='<script src="_remote/264a53f91d65f5b4/firebase-analytics-compat.js"></script>'
# Preserve all unrelated original markup, config and real authentication consumers.
matches=list(re.finditer(r'<script\b[^>]*src="_remote/264a53f91d65f5b4/firebase-analytics-compat\.js"[^>]*>\s*</script>',html));assert len(matches)==1
m=matches[0];retired.append({'kind':'analytics_script_element','source':m[0]});html=html[:m.start()]+html[m.end():]
for text in ['analytics = firebase.analytics();',"gtag('config', 'G-1W23DRFHK9', {'cookie_flags': 'samesite=none;secure'});",'firebaseSetScreen("loading_start");','firebaseLogEvent("loading_page_start");']:
    assert html.count(text)==1,text;html=html.replace(text,'');retired.append({'kind':'actual_startup_consumer','source':text})
assert 'firebase.initializeApp(firebaseConfig);'in html and 'getValueTT' in base('scripts/auth.js').decode()
constants=base('scripts/constants.js').decode();assert constants.count('let enableFirebaseAnalytics=!0;')==1
constants=constants.replace('let enableFirebaseAnalytics=!0;','let enableFirebaseAnalytics=!1;')
files={'overlay/index.html':html.encode(),'overlay/scripts/constants.js':constants.encode()};candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(wasm)
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'));profile['specification_v51']['sections']['system_design']=section_markdown('system_design','v3原目录URI修复已在52第2步证实5份目录配置HTTP200；v4仅退役本次实际发现的ByteBrew预加载器初始化调用及Firebase Analytics网页启动入口，原跟踪开关关闭。未造SDK成功、就绪或账号，未改Firebase真实账号/数据库消费者。Unity原生遥测及全部SDK边界未退役，原本地配置、角色、房间/AI尚待实现；v4未实机运行，不计新增验证。')
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','累计2/5，原生WASM/数据/目录已真实加载，但仍在蓝色加载页，尚未进入菜单与核心对局；剩3步保留。v4只静态校验，不因为修订重置预算。')
files['overlay/game-profile.json']=json.dumps(profile,ensure_ascii=False,indent=2).encode();files['overlay/GAME_SPECIFICATION.md']=document('Smash Karts（实际遥测启动消费者退役未复验）',profile).encode()
files['overlay/README.md']=base('README.md')+('\n\n## v4 实际遥测启动消费者退役\n\n根据第2步真实栈，移除Preloader.Start106283中的单次ByteBrew初始化消费者调用（26516），没有替换提供者函数或伪造返回。原138243函数中相对v3仅此1函数改变，目录getter修复保留；完整Wasm静态校验通过，未执行原游戏。网页不再装载Firebase Analytics模块，移除无条件初始化及3个跟踪调用，原跟踪开关false。保留模块原字节作为历史/未激活材料，并非宣称所有SDK都退役。\n\nFirebase真实认证/数据库与Unity原生遥测仍存在；没有本地用户/房间/AI启动器，不会把普通数据源缺失变成假ready。v4没有启动、没有新增UI输入，原2/5剩3。\n').encode()
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
proof=dict(at=datetime.datetime.now(datetime.timezone.utc).isoformat(),base_stage='D:/GameLab/temp/direct-smash-runtime-uri-v3-20261118',base_git_commit='f596647778d9fd28584f89f9108198972e1ca86c',base_candidate_manifest=base_manifest,candidate_manifest=candidate,wasm_patch=patch,source_wasm_sha256=sha(raw),target_wasm_sha256=sha(wasm),defined_functions=count,unchanged_other_function_bodies=count-1,static_wasm_validation_exit=res.returncode,retired_html_consumers=retired,analytics_flag_change={'before':True,'after':False,'scope':'Original telemetry opt-out, not SDK/provider success'},game_executed=False,ready_review=False,all_sdk_retired=False,core_gameplay_verified=False,ui_steps_used=2,ui_steps_remaining=3,remaining=['ActualFirebase authentication/database consumers still original, require genuine local lifecycle before retirement','Unity native telemetry and other SDK consumers unretired','No original local room/player/AI bootstrap; no game completion claim'])
files['support/assembly-recipe.json']=json.dumps(proof,ensure_ascii=False,indent=2).encode();files['support/function-preservation.json']=json.dumps(preservation,separators=(',',':')).encode();files['support/original-telemetry-init-source.json']=(r/'analysis-20261118/actual-telemetry-startup/original-settings-constant-source.json').read_bytes();files['support/original-preloader-start.json']=json.dumps({'source':preloader_source,'game_executed':False},indent=2).encode();files['support/actual-runtime-observation.json']=(b/'direct-smash-step2-final-observation-20261118.json').read_bytes()
for n in ['direct_smash_telemetry_consumers_v4_prepare_20261118.py','direct_smash_telemetry_consumers_v4_stage_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
target=b/'direct_smash_telemetry_consumers_v4_20261118.pyz';assert not target.exists();main=(b/'direct_smash_telemetry_consumers_v4_stage_20261118.py').read_bytes();compile(main,'stage-actual-telemetry-consumers-only','exec')
with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',main);z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps(dict(packet=str(target),files=len(files),candidate_files=len(candidate),static_wasm_validation_exit=res.returncode,game_executed=False,ui_steps_used=2,ui_steps_remaining=3)))

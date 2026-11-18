"""Prepare source-proved auth consumer retirement, preserving real local identity and base lifecycle."""
from pathlib import Path
import json,hashlib,zipfile,datetime,contextlib,io,subprocess,sys,re
from smash_auth_consumers_v13_20261118 import assemble
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=r/'auth-consumers-v13r2-support-20261118';assert not out.exists()or not any(out.iterdir());out.mkdir(exist_ok=True);sha=lambda v:hashlib.sha256(v).hexdigest()
tests=json.loads((b/'smash-auth-consumer-fixture-result-v13-20261118.json').read_bytes());assert tests['passed']==3 and tests['own_fixture_only']and not tests['original_game_code_executed']and not tests['auth_or_permission_success_fabricated']
src=(b/'direct_smash_profile_write_v12_prepare_20261118.py').read_text(encoding='utf8');src=src[src.index('\nsrc=(b/')+1:src.index('\ncontract=json.loads')]
reader={'b':b,'r':r,'json':json,'sha':sha,'contextlib':contextlib,'io':io};exec(compile(src,'immutable-v11-reader-only','exec'),reader)
v12=r/'profile-write-v12-support-20261118';old_recipe=json.loads((v12/'support/assembly-recipe.json').read_bytes());base_manifest=old_recipe['candidate_manifest']
def base(n):
    p=v12/'overlay'/n
    if p.exists():raw=p.read_bytes()
    elif n=='Build/original.wasm':raw=(v12/'profile-upload-consumer-retirement-static-validation-only.wasm').read_bytes()
    else:raw=reader['base'](n)
    assert sha(raw)==base_manifest[n],n;return raw
contract=json.loads((a/'native-auth-consumer-retirement-contract-v13.json').read_bytes());native,proof=assemble(base('Build/original.wasm'),contract);assert proof['previous_function_bodies_total']==138268
wp=out/'auth-consumer-retirement-static-validation-only.wasm';wp.write_bytes(native)
assert native==(r/'auth-consumers-v13-support-20261118/auth-consumer-retirement-static-validation-only.wasm').read_bytes(), 'The JSON-LD syntax-check correction must not change native game bytes'
validation=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=60);assert validation.returncode==0,validation.stderr
html=base('index.html').decode();start=html.index('window.CrazyGames.SDK.init().then');end=html.index('// Initialize Firebase',start);retired=html[start:end]
expected='window.CrazyGames.SDK.init().then(() =>\n\t{\n\t\tcgEnvDisabled = window.CrazyGames.SDK.environment === "disabled";\n\t\tif (!cgEnvDisabled)\n\t\t{\n\t\t\twindow.CrazyGames.SDK.game.loadingStart();\n\n\t\t\t\n\t\t}\n\t});\n\n\t';assert retired==expected
html=html[:start]+html[end:];assert 'window.CrazyGames.SDK.init()'not in html and'firebase.initializeApp(firebaseConfig);'in html
scripts=[];json_data_blocks=0
for m in re.finditer(r'<script(?P<attrs>[^>]*)>(?P<body>[\s\S]*?)</script>',html):
    raw=m['body']
    if not raw.strip():continue
    if 'application/ld+json' in m['attrs'] or 'application/json' in m['attrs']:
        json.loads(raw);json_data_blocks+=1
    else:scripts.append(raw)
assert json_data_blocks==1
assert scripts
checks=[]
for i,s in enumerate(scripts):
    p=out/('syntax-only-inline-'+str(i)+'.js');p.write_text(s,encoding='utf8');res=subprocess.run(['node','--check',str(p)],capture_output=True,text=True,timeout=20);assert res.returncode==0,res.stderr;checks.append(res.returncode)
doc='''# 认证启动及恢复消费者退役 v13r2（未实机）

真实源码确认：FirebaseAuthService.Awake101109先调用原Singleton<FirebaseAuthService>.Awake4707初始化，再读取浏览器Firebase缓存UID并调用26074配置云身份。26074会进一步进入UserService44721读取云档/配置Photon身份；这不能冒充本地档案流程。原OnApplicationPause101103和OnApplicationFocus101102在恢复条件满足时调用26068；26068会调UserService.FetchUserData2736，清掉User80等当前状态并从云端读取两份档案。即使初始本地档案成功，后续切窗恢复也可能再触发旧云路径。

本修订只退役上述调用消费者：101109的metadata初始化及完整原4707基类调用（真实metadata-use5670104、methodSpec84149、method7721、Singleton`1.Awake、泛型实参FirebaseAuthService）逐字节保留，仅移除其后的浏览器认证UID读取/配置分支。没有把AuthService UID写成本地UID，没有伪造账号、认证/权限或SDK成功。两个focus/pause方法各仅将一条26068 call改为消费原已求值两参数，原焦点/时间戳记录保持，不调用2736去清空真实本地档案。原Firebase提供者和基类生命周期不换桩，v7本地档案原类型恢复/持久化/数据完成、v10真实内容、v11原生离线房间入口和v12本地保存逻辑都保持。

HTML仅移除真实CrazyGames.SDK.init().then加载统计消费者（含loadingStart及其实际Promise），保留其余所有字节。没有设置cgEnvDisabled或伪造SDK环境/完成；Firebase.initializeApp及尚未审计的SDK消费者如实保留，所以这不是全SDK完成结论。内联JS仅语法检查，不在开发机执行原游戏JS。

3类自编WAT/mock隔离验证：完整基类Awake仍以原参数执行一次，之后没有认证读取或配置；pause和focus各在两个参数值下保留本地前后记录，云恢复提供者未执行。没有原游戏函数实例化或原资产执行。完整原Wasm仅静态校验exit0；相对v12只改101102/101103/101109，其他138265函数体保持，无新增函数/导出/type/import/table/global/data；原25自编函数/20导出仍保持。实际原WAT/函数体SHA与原泛型身份绑定，不能拿其它Singleton的MethodInfo替代。

v13尚未52启动。最后真实游戏仍v4蓝色加载，累计3/5剩2；没有新增试玩、观察器或步骤预留。原生菜单、本地房间/赛车/AI、比赛、实际进度持久化及剩余SDK路径仍待运行证据，不计待验收。219是候选文件数，3类是自编检查数，不能混称整套游戏测试通过。规格V5.1保留16维；实际独占耗时/Token/费用未知null。原任务、版本、人工暂停及历史保持，不启动供货。
'''
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'));assert len(profile['specification_v51']['sections'])==16
profile['specification_v51']['sections']['system_design']=section_markdown('system_design',doc)
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','v13保留认证组件原Singleton初始化，只退役其后缓存云UID读取/配置及focus/pause云档案重置消费者；真实本地档案和原生离线入口沿v7-v12保持。HTML平台SDK加载统计消费者退役，未审计SDK仍保留。自编3类及完整Wasm静态检查通过；尚未实机，累计3/5剩2，无新增待验收。')
files={'overlay/index.html':html.encode(),'overlay/LOCAL_AUTH_CONSUMERS.md':doc.encode(),'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（认证启动恢复消费者退役待实机）',profile).encode()}
candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(native)
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
assert len(candidate)==219
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-profile-write-v12-20261118','base_candidate_manifest':base_manifest,'candidate_manifest':candidate,'native_change_proof':proof,'removed_html_sdk_init_consumer':retired,'inline_js_syntax_exit_codes':checks,'static_wasm_validation_exit':validation.returncode,'fixture_only_checks':3,'game_executed':False,'ready_review':False,'all_sdk_retired':False,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode()
for n in['smash_auth_consumer_fixture_v13_20261118.wat','smash_auth_consumer_fixture_v13_20261118.wasm','smash_auth_consumer_fixture_v13_retired_20261118.wasm','test_smash_auth_consumer_fixture_v13_20261118.cjs','smash-auth-consumer-fixture-result-v13-20261118.json']:files['isolated-fixtures/'+n]=(b/n).read_bytes()
for n in['smash_auth_consumers_v13_20261118.py','smash_profile_write_consumer_v12_20261118.py','smash_profile_native_linker_20261118.py','direct_smash_auth_consumer_fixture_v13_20261118.py','direct_smash_auth_consumers_v13r2_prepare_20261118.py','direct_smash_auth_consumers_v13r2_stage_20261118.py','direct_smash_auth_consumer_contract_v13_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
files['source-proof/native-auth-consumer-retirement-contract-v13.json']=(a/'native-auth-consumer-retirement-contract-v13.json').read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_auth_consumers_v13r2_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',(b/'direct_smash_auth_consumers_v13r2_stage_20261118.py').read_bytes());z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'candidate_files':219,'files':len(files),'previous_function_bodies_preserved':proof['previous_function_bodies_preserved'],'changed_previous_functions':[101102,101103,101109],'static_validation_exit':validation.returncode,'inline_syntax_checks':len(checks),'fixture_only_checks':3,'game_executed':False}))

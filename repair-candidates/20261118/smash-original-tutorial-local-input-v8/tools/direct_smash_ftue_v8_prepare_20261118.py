"""Stage exact original tutorial JSON, retaining native download, parse and completion."""
from pathlib import Path
import json,hashlib,contextlib,io,zipfile,subprocess,datetime,sys
from smash_ftue_native_link_v8_20261118 import assemble
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';out=r/'local-ftue-v8-support-20261118'
assert not out.exists();out.mkdir();sha=lambda v:hashlib.sha256(v).hexdigest()
src=(b/'direct_smash_local_user_v7_prepare_20261118.py').read_text(encoding='utf8')
src=src[src.index('# Reuse the immutable'):src.index('native_base=reader')]
ns={'b':b,'r':r,'sha':sha,'json':json,'contextlib':contextlib,'io':io};exec(compile(src,'immutable-v6-reader','exec'),ns)
v7=r/'local-user-v7-support-20261118';recipe7=json.loads((v7/'support/assembly-recipe.json').read_bytes());manifest7=recipe7['candidate_manifest']
def base(n):
    p=v7/'overlay'/n
    if p.exists():raw=p.read_bytes()
    elif n=='Build/original.wasm':raw=(v7/'local-user-completion-static-validation-only.wasm').read_bytes()
    else:raw=ns['base'](n)
    assert sha(raw)==manifest7[n],n;return raw
helper=(b/'smash_ftue_local_url_v8_20261118.wasm').read_bytes()
native,proof=assemble(base('Build/original.wasm'),helper)
assert proof['previous_function_bodies_total']==138250
wp=out/'original-tutorial-local-url-static-validation-only.wasm';wp.write_bytes(native)
validation=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=60);assert validation.returncode==0,validation.stderr
raw=(r/'analysis-20261118/ftue-static-development-intake/ftue-v4.original.json').read_bytes()
assert len(raw)==4251 and sha(raw)=='1b63ee72154ddbe90c7f0cb4470031a5c1db80af5a686a80e8d7695f2c168465'
assert len(json.loads(raw))==4 and sum(x['usePlayerBots']is True for x in json.loads(raw))==3
fixture=json.loads((b/'smash-ftue-url-fixture-result-v8-20261118.json').read_bytes());assert fixture['passed']==3 and fixture['fixture_only']and not fixture['original_game_code_executed']
doc='''# 原教程输入本地化 v8（未实机、未交付）

原GameConstants静态606指向getter31571，原字符串为公开静态ftue-v4.json。4251字节原文件已完整取得，SHA256为1b63ee72154ddbe90c7f0cb4470031a5c1db80af5a686a80e8d7695f2c168465，原字节复制到StreamingAssets/aa/ftue-v4.original.json。4项是教程配置，不是4关；3项原usePlayerBots=true不等于已验证本地AI。权重、地图、模式、自动开局、解锁及奖励等原值不改。

只替换原31571 URL消费者，调用1个新自编函数，通过原Application.get_streamingAssetsPath6872、String.Ctor67864和String.Concat635构造同源可迁移URL；不绑定52、端口或站点根目录。不改metadata/RVA字节，不挤占相邻字符串。v7的138250函数体中138249保持，只有31571变更，另追加1函数/导出，v7本地用户事务不变。原FtueDataService43616下载、类型解析和101058非空完成判断完整保留，不以空数组、假响应或ready旗标替代。

开发环境3项自编隔离URL/UTF16/栈保护检查通过，完整原Wasm仅静态校验，未在开发机运行原游戏。v8尚未52实机；当前桌面访问拒绝，截图仍为Windows密码页，累计3/5剩2。News/CrossPromo/GameData、剩余云端/SDK消费者、离线房间/玩家/AI及核心玩法仍未完成，不计待验收。原任务、版本、暂停、历史和预算保持。耗时、Token及费用无可信独占记录时为null。
'''
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'))
profile['specification_v51']['sections']['system_design']=section_markdown('system_design',doc)
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','当前最后实际运行仍为v4第3步蓝色加载页。v5至v8尚未实机；v8只接入原教程JSON本地路径，保留原下载与完成逻辑，不冒充Ftue加载成功。累计3/5剩2；菜单、房间、玩家、AI和核心操作未证明，不计待验收。')
files={'overlay/StreamingAssets/aa/ftue-v4.original.json':raw,'overlay/LOCAL_FTUE_INPUT.md':doc.encode(),
       'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),
       'overlay/GAME_SPECIFICATION.md':document('Smash Karts（原教程输入本地化待实机）',profile).encode()}
candidate=dict(manifest7);candidate['Build/original.wasm']=sha(native)
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
assert len(candidate)==211
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-local-user-v7-20261118',
        'base_candidate_manifest':manifest7,'candidate_manifest':candidate,'native_link_proof':proof,'static_wasm_validation_exit':validation.returncode,
        'fixture_only_checks':3,'previous_profile_fixture_checks':17,'game_executed':False,'ready_review':False,
        'original_ftue_bytes':len(raw),'original_ftue_sha256':sha(raw),'tutorial_configurations':4,
        'native_ftue_runtime_verified':False,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode()
files['support/own-native-bridge.wasm']=helper
for name in ['smash_ftue_local_url_v8_20261118.wat','smash_ftue_url_fixture_v8_20261118.wat','smash_ftue_url_fixture_v8_20261118.wasm','smash_ftue_url_linked_fixture_v8_20261118.wasm','test_smash_ftue_url_fixture_v8_20261118.cjs','smash-ftue-url-fixture-result-v8-20261118.json']:
    files['isolated-fixtures/'+name]=(b/name).read_bytes()
for name in ['smash_ftue_native_link_v8_20261118.py','smash_profile_native_linker_20261118.py','direct_smash_ftue_v8_fixture_20261118.py','direct_smash_ftue_v8_prepare_20261118.py','direct_smash_ftue_v8_stage_20261118.py']:
    files['tools/'+name]=(b/name).read_bytes()
for dest,source in [('original-service-url-getters.json','service-data-source-urls/original-settings-constant-source.json'),('original-path-method-bindings.json','streaming-path-bindings/original-path-method-bindings.json'),('original-ftue-intake.json','ftue-static-development-intake/receipt.json')]:
    files['source-proof/'+dest]=(r/'analysis-20261118'/source).read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_ftue_v8_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',(b/'direct_smash_ftue_v8_stage_20261118.py').read_bytes());z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'files':len(files),'candidate_files':len(candidate),'changed_previous_functions':[31571],'previous_function_bodies_preserved':proof['previous_function_bodies_preserved'],'static_validation_exit':validation.returncode,'game_executed':False}))

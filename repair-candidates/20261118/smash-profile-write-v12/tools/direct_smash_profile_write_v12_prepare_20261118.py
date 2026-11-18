"""Keep original local save work and retire only the two proven outbound upload consumers."""
from pathlib import Path
import json,hashlib,zipfile,datetime,contextlib,io,subprocess,sys,re
from smash_profile_write_consumer_v12_20261118 import assemble
b=Path(__file__).parent;r=b/'direct-games/job-3db06205247a';a=r/'analysis-20261118';out=r/'profile-write-v12-support-20261118';assert not out.exists();out.mkdir();sha=lambda v:hashlib.sha256(v).hexdigest()
tests=json.loads((b/'smash-profile-write-fixture-result-v12-20261118.json').read_bytes());assert tests['passed']==3 and tests['own_fixture_only']and not tests['original_game_code_executed']and not tests['fake_remote_callbacks']
src=(b/'direct_smash_local_transport_v11_prepare_20261118.py').read_text(encoding='utf8');src=src[src.index('src=(b/'):src.index('contract=json.loads')]
reader={'b':b,'r':r,'json':json,'sha':sha,'contextlib':contextlib,'io':io};exec(compile(src,'immutable-v10-reader-only','exec'),reader)
v11=r/'local-transport-v11-support-20261118';old_recipe=json.loads((v11/'support/assembly-recipe.json').read_bytes());base_manifest=old_recipe['candidate_manifest']
def base(n):
    p=v11/'overlay'/n
    if p.exists():raw=p.read_bytes()
    elif n=='Build/original.wasm':raw=(v11/'original-local-transport-static-validation-only.wasm').read_bytes()
    else:raw=reader['base'](n)
    assert sha(raw)==base_manifest[n],n;return raw
contract=json.loads((a/'native-profile-write-consumer-contract.json').read_bytes());native,proof=assemble(base('Build/original.wasm'),contract);assert proof['previous_function_bodies_total']==138268
wp=out/'profile-upload-consumer-retirement-static-validation-only.wasm';wp.write_bytes(native)
validation=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm-validate'),str(wp)],capture_output=True,text=True,timeout=60);assert validation.returncode==0,validation.stderr
# Independent WAT disassembly proves both byte patterns are actual call instructions,
# rather than arbitrary matching constants. This analysis slice is never executed.
folder=a/'native-profile-save-cloud-boundary';wat=folder/'original-functions-NOT-RUNTIME.wat';assert not wat.exists()
res=subprocess.run(['node',str(b/'native-analysis-tools/node_modules/wabt/bin/wasm2wat'),str(folder/'settings-constant-analysis-NOT-RUNTIME.wasm'),'-o',str(wat)],capture_output=True,text=True,timeout=30);assert res.returncode==0,res.stderr
t=wat.read_text();m=re.search(r'^  \(func \(;1756;\).*?(?=^  \(func|^  \(table)',t,re.M|re.S);assert m;caller=m[0]
assert len(re.findall(r'^\s+call 1679$',caller,re.M))==len(re.findall(r'^\s+call 6414$',caller,re.M))==1
assert len(re.findall(r'^\s+call 2404$',caller,re.M))==1
doc='''# 原生档案上传消费者退役 v12（未实机）

真实缺口：原UserService保存函数1756在更新本地UserData后，仍直接调用FirebaseDatabaseBridge全量写入1679或增量写入6414。FPS/已见地图等原方法会走该消费者，不能仅有5秒本地自动保存而让原上传继续外联。

本修订仅改1756内这两条明确call。原metadata token→原程序集方法指针→原Wasm table、精确完整函数SHA、独立WAT反汇编和8参数类型均绑定。两个原提供者都接收6个i32、1个f32超时及1个i32 MethodInfo，无返回值；退役call后消费全部8个已求值参数，保留参数求值副作用及所有原控制流。Firebase提供者、成功/失败回调和其他调用者均保持原字节，没有造“云端保存成功”或调用原SDK成功回调。

1756除两条call之外的原本地工作全部保留：真实UserData赋值、原Nexus字段规范化、音量/FPS、保护字段、时间戳、差异比较、序列化旧档基线和原UnityEvent<bool>。原常量table3971实际指向UserService104586反射比较，不是后端接口；保留原复杂字段/列表比较。原本地事件在上传排队后即触发，不等待远端成功；本修订没有把事件挪成伪造网络回执。真正的本地档案仍由既有v7适配读取原生真实快照，校验身份/来源、保留上一代、CAS写入和读回，5秒及pagehide保存；不清档、不预设道具/奖励、不改变ready或权限。

3类自编WAT mock隔离分别覆盖不上传、全量、增量分支：原参数（含float）全部求值，本地数据、快照基线、事件次数保持，上传提供者未调用。只运行自编fixture，不运行原游戏函数。完整原Wasm仅静态验证exit0。相对v11只有1756函数体变化，其余138267保持，无新增/变化的type/import/export/table/global/data或函数数；v11的25自编函数/20导出保持。

启动顺序另已按原12611/104933/104932/26639及User/教程回调源码核查；原初始数据加载需要真实User80/Settings21/Ftue20，不因怀疑时序就放宽门禁或加入兜底成功。真实时序仍须实机观察。

v12尚未52启动，最后真实运行仍v4蓝色加载。累计3/5剩2；桌面恢复确认未变化，没有新观察器或预留/输入。这里只退役两处确定上传消费者，不声称全SDK或所有云端路径已移除；菜单、实际离线房间、赛车/AI、比赛和真实进度持久化仍未通过，不计待验收。V5.1如实标注范围，未知耗时/Token/费用null；原任务/版本/人工暂停/历史保持，不启动供货。
'''
sys.path.insert(0,str(b.parent/'gamelab'));from controlplane.game_specification_v51 import section_markdown,document
profile=json.loads(base('game-profile.json'));profile['specification_v51']['sections']['system_design']=section_markdown('system_design',doc)
profile['specification_v51']['sections']['game_path']=section_markdown('game_path','沿v11真实原生离线入口；v12保留原UserService保存的本地数据/规范化/保护字段/时间戳/差异/基线与原事件，仅退役两条Firebase上传call，真实进度仍由已校验本地快照适配保存。3类自编mixed-signature隔离和完整原Wasm静态通过，尚未实机；3/5剩2。无新增待验收，菜单/实际房间/赛车/AI与持久化待证据。')
files={'overlay/LOCAL_PROFILE_WRITE.md':doc.encode(),'overlay/game-profile.json':json.dumps(profile,ensure_ascii=False,indent=2).encode(),'overlay/GAME_SPECIFICATION.md':document('Smash Karts（原生档案上传消费者退役待实机）',profile).encode()}
candidate=dict(base_manifest);candidate['Build/original.wasm']=sha(native)
for n,v in files.items():candidate[n.removeprefix('overlay/')]=sha(v)
assert len(candidate)==218
recipe={'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'base_stage':'D:/GameLab/temp/direct-smash-local-transport-v11-20261118','base_candidate_manifest':base_manifest,'candidate_manifest':candidate,'native_change_proof':proof,'static_wasm_validation_exit':validation.returncode,'fixture_only_checks':3,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2}
files['support/assembly-recipe.json']=json.dumps(recipe,ensure_ascii=False,separators=(',',':')).encode()
for n in['smash_profile_write_fixture_v12_20261118.wat','smash_profile_write_fixture_v12_20261118.wasm','smash_profile_write_fixture_v12_retired_20261118.wasm','test_smash_profile_write_fixture_v12_20261118.cjs','smash-profile-write-fixture-result-v12-20261118.json']:files['isolated-fixtures/'+n]=(b/n).read_bytes()
for n in['smash_profile_write_consumer_v12_20261118.py','smash_profile_native_linker_20261118.py','direct_smash_profile_write_fixture_v12_20261118.py','direct_smash_profile_write_v12_prepare_20261118.py','direct_smash_profile_write_v12_stage_20261118.py','direct_smash_profile_write_consumer_contract_20261118.py']:files['tools/'+n]=(b/n).read_bytes()
files['source-proof/native-profile-write-consumer-contract.json']=(a/'native-profile-write-consumer-contract.json').read_bytes()
files['source-proof/original-save-instructions.wat']=caller.encode()
files['source-proof/original-local-startup-order.json']=(a/'native-local-startup-order/original-settings-constant-source.json').read_bytes()
for n,v in files.items():p=out/n;p.parent.mkdir(parents=True,exist_ok=True);p.write_bytes(v)
manifest=json.dumps({n:sha(v)for n,v in files.items()},sort_keys=True,indent=2).encode();(out/'MANIFEST.json').write_bytes(manifest)
packet=b/'direct_smash_profile_write_v12_20261118.pyz';assert not packet.exists()
with zipfile.ZipFile(packet,'w',zipfile.ZIP_DEFLATED)as z:
    z.writestr('__main__.py',(b/'direct_smash_profile_write_v12_stage_20261118.py').read_bytes());z.writestr('MANIFEST.json',manifest)
    for n,v in files.items():z.writestr(n,v)
print(json.dumps({'prepared':str(packet),'candidate_files':218,'files':len(files),'previous_function_bodies_preserved':proof['previous_function_bodies_preserved'],'changed_previous_functions':[1756],'static_validation_exit':validation.returncode,'fixture_only_checks':3,'game_executed':False}))

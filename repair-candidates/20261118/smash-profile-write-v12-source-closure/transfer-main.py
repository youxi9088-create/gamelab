from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-profile-write-v12-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate=json.loads((stage/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v12-stage.json'))==json.loads((stage/'receipt.json').read_bytes())
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',manifest_raw)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note='\n\n### 2026-11-18 Smash v12退役原生档案上传消费者，本地保存待实机\n\n真实缺口：原UserService保存函数1756在更新本地UserData后，仍直接调用FirebaseDatabaseBridge全量写入1679或增量写入6414。FPS/已见地图等原方法会走该消费者，不能仅有5秒本地自动保存而让原上传继续外联。\n\n本修订仅改1756内这两条明确call。原metadata token→原程序集方法指针→原Wasm table、精确完整函数SHA、独立WAT反汇编和8参数类型均绑定。两个原提供者都接收6个i32、1个f32超时及1个i32 MethodInfo，无返回值；退役call后消费全部8个已求值参数，保留参数求值副作用及所有原控制流。Firebase提供者、成功/失败回调和其他调用者均保持原字节，没有造“云端保存成功”或调用原SDK成功回调。\n\n1756除两条call之外的原本地工作全部保留：真实UserData赋值、原Nexus字段规范化、音量/FPS、保护字段、时间戳、差异比较、序列化旧档基线和原UnityEvent<bool>。原常量table3971实际指向UserService104586反射比较，不是后端接口；保留原复杂字段/列表比较。原本地事件在上传排队后即触发，不等待远端成功；本修订没有把事件挪成伪造网络回执。真正的本地档案仍由既有v7适配读取原生真实快照，校验身份/来源、保留上一代、CAS写入和读回，5秒及pagehide保存；不清档、不预设道具/奖励、不改变ready或权限。\n\n3类自编WAT mock隔离分别覆盖不上传、全量、增量分支：原参数（含float）全部求值，本地数据、快照基线、事件次数保持，上传提供者未调用。只运行自编fixture，不运行原游戏函数。完整原Wasm仅静态验证exit0。相对v11只有1756函数体变化，其余138267保持，无新增/变化的type/import/export/table/global/data或函数数；v11的25自编函数/20导出保持。\n\n启动顺序另已按原12611/104933/104932/26639及User/教程回调源码核查；原初始数据加载需要真实User80/Settings21/Ftue20，不因怀疑时序就放宽门禁或加入兜底成功。真实时序仍须实机观察。\n\nv12尚未52启动，最后真实运行仍v4蓝色加载。累计3/5剩2；桌面恢复确认未变化，没有新观察器或预留/输入。这里只退役两处确定上传消费者，不声称全SDK或所有云端路径已移除；菜单、实际离线房间、赛车/AI、比赛和真实进度持久化仍未通过，不计待验收。V5.1如实标注范围，未知耗时/Token/费用null；原任务/版本/人工暂停/历史保持，不启动供货。\n\n\n真实52 stage D:\\GameLab\\temp\\direct-smash-profile-write-v12-20261118全部218文件SHA核对，候选清单404988ca6d4934a7abfd8977a51aa74cffe08b6220a6034c14ee0ac275b6adc9，增量清单ea21ca3cc088d2b63992ebe416efd022a0f1e1c9fa96b590e25f5961b997bea0。原任务整行/版本/暂停和3/5剩2台账保持。GitHub候选ba7bb58af014554b6f497cc7fceb6dad3691e70d23blob/push0/ls-remote一致。此处218指候选文件数，不是测试数；3类自编fixture不包含任何原游戏函数执行。\n\n测试站2026-11-18T04:51:23Z直连仍A35completed/1review/45blocked/9queued/3failed。验收中心04:51:56Z共19项注意、6项归本组/本聊天：ThrottleRiot/Starblade/Dilan反馈平台侧抽取失败或无需改包；Blocky/OvO/Sushi仍为已有原始材料/交互缺口，原人工暂停不动，无新可接续项。本轮无新增待验收，Rusty/Craig额度和桌面恢复均无新回复。\n'
if '### 2026-11-18 Smash v12退役原生档案上传消费者，本地保存待实机' not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(manifest_raw).hexdigest(),'files_verified':len(manifest),'candidate_files_verified':len(candidate),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

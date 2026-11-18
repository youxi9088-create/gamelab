from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-auth-consumers-v13r2-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate=json.loads((stage/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v13r2-stage.json'))==json.loads((stage/'receipt.json').read_bytes())
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',manifest_raw)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note='\n\n### 2026-11-18 Smash v13r2退役认证启动/恢复消费者，原基类及本地档案保持\n\n真实源码确认：FirebaseAuthService.Awake101109先调用原Singleton<FirebaseAuthService>.Awake4707初始化，再读取浏览器Firebase缓存UID并调用26074配置云身份。26074会进一步进入UserService44721读取云档/配置Photon身份；这不能冒充本地档案流程。原OnApplicationPause101103和OnApplicationFocus101102在恢复条件满足时调用26068；26068会调UserService.FetchUserData2736，清掉User80等当前状态并从云端读取两份档案。即使初始本地档案成功，后续切窗恢复也可能再触发旧云路径。\n\n本修订只退役上述调用消费者：101109的metadata初始化及完整原4707基类调用（真实metadata-use5670104、methodSpec84149、method7721、Singleton`1.Awake、泛型实参FirebaseAuthService）逐字节保留，仅移除其后的浏览器认证UID读取/配置分支。没有把AuthService UID写成本地UID，没有伪造账号、认证/权限或SDK成功。两个focus/pause方法各仅将一条26068 call改为消费原已求值两参数，原焦点/时间戳记录保持，不调用2736去清空真实本地档案。原Firebase提供者和基类生命周期不换桩，v7本地档案原类型恢复/持久化/数据完成、v10真实内容、v11原生离线房间入口和v12本地保存逻辑都保持。\n\nHTML仅移除真实CrazyGames.SDK.init().then加载统计消费者（含loadingStart及其实际Promise），保留其余所有字节。没有设置cgEnvDisabled或伪造SDK环境/完成；Firebase.initializeApp及尚未审计的SDK消费者如实保留，所以这不是全SDK完成结论。内联JS仅语法检查，不在开发机执行原游戏JS。\n\n3类自编WAT/mock隔离验证：完整基类Awake仍以原参数执行一次，之后没有认证读取或配置；pause和focus各在两个参数值下保留本地前后记录，云恢复提供者未执行。没有原游戏函数实例化或原资产执行。完整原Wasm仅静态校验exit0；相对v12只改101102/101103/101109，其他138265函数体保持，无新增函数/导出/type/import/table/global/data；原25自编函数/20导出仍保持。实际原WAT/函数体SHA与原泛型身份绑定，不能拿其它Singleton的MethodInfo替代。\n\nv13尚未52启动。最后真实游戏仍v4蓝色加载，累计3/5剩2；没有新增试玩、观察器或步骤预留。原生菜单、本地房间/赛车/AI、比赛、实际进度持久化及剩余SDK路径仍待运行证据，不计待验收。219是候选文件数，3类是自编检查数，不能混称整套游戏测试通过。规格V5.1保留16维；实际独占耗时/Token/费用未知null。原任务、版本、人工暂停及历史保持，不启动供货。\n\n\n准备阶段先纠正本地只读切片定位匹配到了脚本自身字符串的问题，再在v13语法检查把JSON-LD数据块误当JS时报错；没有上传/执行失败v13。失败准备材料保留，新不可变v13r2按script类型区分JSON-LD和JS，实际1个JSON数据块按JSON读取、2个内联JS语法exit0；v13r2完整原Wasm与失败准备阶段已静态通过的native字节精确一致，未因修正检查器改变native行为。没有重跑原游戏或重置试玩。\n\n真实52 stage D:\\GameLab\\temp\\direct-smash-auth-consumers-v13r2-20261118全部219文件SHA核对，候选清单a61bc49ef901af2200e3dd65e043ab715c16ca40a4ae2019fbe88482a0fad7d0，增量清单817875700c2c3786c91117b58c6f29368dd8e81b3298017095164d75813e829a；原v7档案/v10内容/v11离线传输/v12上传退役保持，原任务整行/版本/暂停及3/5剩2保持。GitHub候选8f65adec253b3bbc9e4d0c6384a4576f7d3b145023blob/push0/ls-remote一致。219是候选文件数，3类为自编隔离检查，不是整款实机验证。\n\n测试站2026-11-18T05:06:20Z直连仍A35completed/1review/45blocked/9queued/3failed，57未达；无本轮新增待验收。桌面恢复和Rusty/Craig追加额度均无新回复；没有调用界面、启动观察器、预留第4步或玩家输入。最后实际游戏仍v4蓝色加载，v5至v13r2未实机，不将原生离线接入实现称为完整菜单/房间/赛车/AI/比赛或持久化通过。B组、全部未授权暂停/跳过/Cow/采集与下游保持。\n'
if '### 2026-11-18 Smash v13r2退役认证启动/恢复消费者，原基类及本地档案保持' not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(manifest_raw).hexdigest(),'files_verified':len(manifest),'candidate_files_verified':len(candidate),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

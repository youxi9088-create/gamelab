from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-local-transport-v11-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate=json.loads((stage/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v11-stage.json'))==json.loads((stage/'receipt.json').read_bytes())
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',manifest_raw)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note='\n\n### 2026-11-18 Smash v11接入原生离线传输，实际游戏仍待验证\n\n在v10真实本地内容事务之后，核查原PhotonNetwork/LoadBalancingClient/Player/Room/RoomOptions等10类500方法，绑定真实方法token→模块指针→Wasm表，以及原字段/签名和逐bodySHA。确认原ConnectUsingSettings(AppSettings,bool)41676的true分支调用原OfflineMode7186，原Create/JoinRoom25388/41669/41670保留原本地Room构造10061、真实actor绑定和原创建/加入回调。原NetworkClientState4258在实际离线大厅返回15、实际本地房间返回9，保留原在线状态。原Player.UserId getter986/setter1351只读写field24；1351也被LoadBalancingClient另一字段setter共享，不能仅凭函数地址认作同一方法：本适配按Player声明类型和真实isLocal字段16绑定，原AuthValues提供者/类型不调用、不换桩。\n\n原游戏连接管理器Awake105271只读取Firebase身份配置认证，该在线消费者退役。原Update105269五次直接读取联网LoadBalancingClient.State，即使Photon已离线也看不到原实际离线状态；五处原指令精确校验后接原4258，非返回常量。Update前缀要求原OfflineMode96313实际为真后才进入，保留其余核心服务/真实数据/加载UI等原检查。没有改原Photon setter/连接器/房间/玩家生成/AI/地图规则。自编所有者在原档案和真实内容完整就绪后调用原连接入口，只有实际已保存local:UUID与真实本地actor/旧身份相容、真实AppSettings存在、原idle0/disconnected14才启动；已有在线连接/别的玩家身份拒绝，不强断、不造AuthenticationValues或服务器成功。\n\n自编挂载250ms等实际输入，最多90秒；原连接失败/异常/调用后实际offline状态未成立则停止自己的定时器并明确报错，最多一次连接尝试，不逐帧重试。成功仍复核原状态是15或9，不造已连接。重复挂载幂等，卸载仅清理自己所有的定时器。12类自编WAT/JS mock检查通过，包括缺/未完整核心数据、身份格式/其他玩家保护、真实本地actor/设置要求、拒绝接管在线连接、原连接失败/异常停止、真实9/15/14状态不替常量、幂等清理和90秒有界失败。未实例化/执行原游戏函数或资产；完整原Wasm仅静态exit0。相对v10仅105269/105271变化，其余138264函数体保持；新增2自编函数/2导出，从v5共25函数/20导出，原type/import/table/global/data/metadata保持。\n\n真实52独立stage D:\\GameLab\\temp\\direct-smash-local-transport-v11-20261118核对全部217文件，候选清单fe622668f7aa91ed51ce89f1fec62b19a9df4d26eaaf75c2d4584a39f37629da，增量清单9bdbc1d6563b6580c3f569fc839ba92be7056784e4383680c66dd242e13fd666。原v7档案/v8真实教程/v9展示消费者/v10本地内容文件逐SHA保持，原任务整行、版本、人工暂停和3/5剩2台账保持。GitHub bb8357094826174d74a1b1d1eda8cca2b0edac1425blob核对、push0、ls-remote一致。V5.1更新真实系统与游戏路径和未验证边界，未知耗时/Token/费用null。没有启动v11、观察器、第4步预留、接续/入库/供货。\n\n测试站2026-11-18T04:47:22Z直连绕过代理仍A35completed/1review/45blocked/9queued/3failed，57未达；本轮无新增待验收。最后实际游戏仍v4蓝色加载，v5至v11未实机，不能把连接实现或7预设/44场景当菜单/比赛/AI或完整SDK已通过。桌面恢复请求仍待新回复，不重复轮询旧锁屏/催促；RustyPick/Craig追加额度仍待回复；B组/所有未授权暂停/跳过/Cow/采集/下游保持。下一步桌面可用后在剩2步内观察最新v11真实运行，先核对当前候选SHA/台账，原生菜单/本地房间/赛车与AI/比赛/进度持久化仍待证据。\n'
if '### 2026-11-18 Smash v11接入原生离线传输，实际游戏仍待验证' not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(manifest_raw).hexdigest(),'files_verified':len(manifest),'candidate_files_verified':len(candidate),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

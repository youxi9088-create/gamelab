from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-local-ftue-v8-20261118');target=stage/'source-closure';target.mkdir(exist_ok=True)
candidate=json.loads((stage/'CANDIDATE_MANIFEST.json').read_bytes())
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2
with zipfile.ZipFile(sys.argv[0])as z:
    manifest_raw=z.read('MANIFEST.json');manifest=json.loads(manifest_raw)
    assert json.loads(z.read('evidence/v8-stage-receipt.json'))==json.loads((stage/'receipt.json').read_bytes())
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',manifest_raw)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note='\n\n### 2026-11-18 Smash v8原教程输入本地化，桌面仍未可控\n\n用户回复已停止操作且52在前台后，工具重新枚举唯一52窗口527928；激活仍实际返回GetCursorPos访问拒绝0x80070005。按computer-use规则只恢复一次：新list/get_window只读截图仍为Windows密码页，缺少窗口边框，不能可靠区分Codex主机或52锁定。没有操作登录页、没有启动游戏/观察器、没有预留或扣第4步；仍3/5剩2。已请求两边均保持解锁，SSH94663仍可执行并有新exit0回执，不重复登录或寻找凭据。\n\n源码侧完成v8：将已取得的原公开Ftue JSON4251字节按SHA原样放入StreamingAssets/aa/ftue-v4.original.json。只替换原getter31571远端URL消费者，调用一个新自编路径函数，使用已证实ABI的原Application.get_streamingAssetsPath6872、String.Ctor67864、String.Concat635构建可迁移同源URL。不硬编码域名/机器/端口，不覆盖57字节RVA或相邻字符串。原FtueDataService43616下载、类型解析、101058非空完成判断保持，不造空列表/成功回调/ready。4项是教程配置不是关卡，3项原usePlayerBots=true不是AI实测，权重/地图/模式/自动开局/奖励/解锁值均不改。\n\nv7全部138250函数体中138249保持，仅31571单消费者变化，另追加1函数/导出；从v5累计8自编函数/7导出，v7档案/真实本地完成事务原字节保留。原type/import/table/global/data/metadata/RVA保持。完整Wasm静态校验exit0，开发机仅执行自编路径fixture：HTTPS目录、带不同端口目录、Unicode目录3项均正确，使用UTF16原字符串拼接并恢复栈；原游戏从未在开发机运行。前17项档案隔离证据继续保留，没有因纯路径修改重跑原游戏。\n\n52独立D:\\GameLab\\temp\\direct-smash-local-ftue-v8-20261118/candidate211文件重建逐SHA，候选清单637fab52df71c0c35e459ed55099d82124583390527ebbfdf38801ed1eee2c68，增量清单1da3a9eeadaed6cd2b8ad719dd80c0f1deeba5384fbdcc1fdccbb91e4865fdad，完整原文件SHA1b63ee72154ddbe90c7f0cb4470031a5c1db80af5a686a80e8d7695f2c168465。原任务blocked/round3/versionnull整行和暂停/历史保持，未接续/入库/下游。GitHub提交c6c0b930ca2c76630013adcbf64f1234b90877a4已25blob核对、push0、ls-remote精确一致。V5.1同步写明原路径/实现事实与未实机范围；状态中的旧user_service_ready_written改为null并分列“本地事务实现”和“运行未知”，避免把代码会调用setter误读为实际游戏ready。\n\n最新测试站直连绕过代理2026-11-18T02:55:45Z：A93仍35completed/1review/45blocked/9queued/3failed，57未达目标，没有本轮新增待验收。最初误把本机测试站helper交给52时在本地路径读取即FileNotFound、未发测试站请求，已改回开发电脑原helper直连并实际成功；不拿该失败当站点故障。其余News/CrossPromo/GameData、云端/SDK消费者、离线房间/玩家/AI及核心玩法仍未完成。不能以211文件SHA或静态校验代替游戏验收。耗时/Token/费用未知null。RustyPick/Craig新追加额度问题仍未回复；B组、其它暂停、跳过/取消、Cow/采集及下游保持。\n'
if '### 2026-11-18 Smash v8原教程输入本地化，桌面仍未可控' not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(manifest_raw).hexdigest(),'files_verified':len(manifest),'candidate_files_verified':len(candidate),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

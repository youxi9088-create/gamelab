from pathlib import Path
import json,hashlib,sys,zipfile,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
s=Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118/closure');s.mkdir(exist_ok=True)
with zipfile.ZipFile(sys.argv[0])as z:
    raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest)
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(s/n).resolve();assert p.is_relative_to(s.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(s/'MANIFEST.json',raw_manifest)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note='\n\n### 2026-11-18 Smash实际遥测消费者退役v4与全A原包复核\n\n前一轮2步是真实进展，v3目录URI已实际加载5份配置/目录HTTP200，但仍停蓝色加载页。当前没有v4游戏执行或新UI输入，严格累计2/5剩3；两专属观察任务已停止，52解锁问题已解除，不重复索取解锁/授权，也不沿用旧Level Devil额度。\n\n根据第2步实际ByteBrew网络失败栈，静态核对原Preloader.Start106283→初始化26516→44632→44631→原JSlib。v4只从106283删除单次i32.const0+call26516消费者序列；没有把SDK/provider方法写成空桩或返回成功，没有写ready、账号或奖励。相对v3其他138242函数体逐SHA保持，原getter35469的URI解析修复保留；相对最初原版仅35469/106283两函数不同，其他138241保持。完整Wasm经wabt静态校验exit0，未在本机执行原游戏。\n\n网页原入口无条件firebase.analytics()初始化及Firebase Analytics模块装载已移除，同时移除gtag配置和2个loading跟踪调用，原enableFirebaseAnalytics开关改false；原main.js跟踪方法/框架/认证/数据库及162bundle保持，不冒称SDK全退役。原Analytics模块文件保留未装载历史字节，未清历史。Unity原生遥测、Firebase真实账号/数据库、广告等还未退役，本地配置/玩家/房间/AI仍未实现。此局部退役并不能证明解除加载页阻断，不为验证这个局部改动消耗剩余试玩。\n\n真实52独立D:\\GameLab\\temp\\direct-smash-telemetry-consumers-v4-20261118/candidate205文件全部SHA核对，候选清单40b085d18054083e920938a2bf0d2c11a2737392bca8b5e8e7ab3da0512b4578，增量清单b0fc8323d31be3df5f601267199f5f912fc371421c78677b25b58288beb7b2fe；原任务整行/版本/暂停、实时2/5账本保持，无观察服务/注册/安装/接续/入库/下游。GitHub 357d8a2e0f7ca9df108c5bdb4394bb9497bd094f，17blob核对、push0、ls-remote一致。V5.1随候选更新当前事实，独占耗时/Token/费用未知仍null。\n\n北京时间08:56重新以SQLite只读核对所有57未完成A任务的同源候选、版本、产物、目录及source_bundle：与2026-11-17T19:34:31Z前次逐任务JSON完全相同，bundle记录种类为空，无新原包或版本，不重复403/404访问或采集。最新测试站A仍35completed/1review/45blocked/9queued/3failed，未新增待验收。此证据不能当任务全部完成；下一轮应先梳理真实本地配置/用户生命周期的数据来源，或处理用户对LittleAlchemy v3/跑酷SDKv2各自额度问题的新答复/明确新原包，不反复跑同一全量原包检查。\n\npendingstatus已备份旧v3版本并指向v4，同时分开记录“上一v3已实测URI”与“当前v4未实机”；不得把旧v3局部运行结论继承成v4整款通过。全部A目标保持active，尚非三轮无进展阻断，绝不标complete。\n'
if '### 2026-11-18 Smash实际遥测消费者退役v4与全A原包复核' not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
ledger=json.loads(Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118/ui-ledger.json').read_bytes());assert ledger['used']==2 and ledger['remaining']==3
out={'complete':True,'stage':str(s),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'files_verified':len(manifest),'coordination_appended':True,'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'ready_review':False,'ui_steps_used':2,'ui_steps_remaining':3,'new_player_inputs':0};write_bytes(s/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

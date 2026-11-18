from pathlib import Path
import json,hashlib,zipfile,sys,copy
r=Path('D:/GameLab/app');sys.path.insert(0,str(r));from controlplane.atomic_files import write_bytes
from controlplane.service import Service
svc=Service(r/'data',r/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:before=copy.deepcopy(svc.get(db,'jobs','job-3db06205247a'))
stage=Path('D:/GameLab/temp/direct-smash-telemetry-consumers-v4-20261118');target=stage/'runtime-bootstrap-closure';target.mkdir(exist_ok=True)
candidate_raw=(stage/'CANDIDATE_MANIFEST.json').read_bytes();candidate=json.loads(candidate_raw)
for n,h in candidate.items():assert hashlib.sha256((stage/'candidate'/n).read_bytes()).hexdigest()==h,n
e=Path('D:/GameLab/temp/direct-smash-resources-localized-v1-20261118/validation-resources-v1-20261118');ledger_raw=(e/'ui-ledger.json').read_bytes();ledger=json.loads(ledger_raw);assert ledger['used']==3 and ledger['remaining']==2 and ledger['steps'][-1]['status']=='observed_partial'
with zipfile.ZipFile(sys.argv[0])as z:
    raw_manifest=z.read('MANIFEST.json');manifest=json.loads(raw_manifest)
    expected=json.loads(z.read('evidence/direct-smash-step3-full-outcome-20261118.json'));actual=json.loads((e/'observation-v4/step3-outcome.json').read_bytes());assert expected==actual
    for n,h in manifest.items():
        raw=z.read(n);assert hashlib.sha256(raw).hexdigest()==h;p=(target/n).resolve();assert p.is_relative_to(target.resolve());p.parent.mkdir(parents=True,exist_ok=True)
        if p.exists():assert p.read_bytes()==raw
        else:write_bytes(p,raw)
    write_bytes(target/'MANIFEST.json',raw_manifest)
p=r/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';old=p.read_bytes();note='\n\n### 2026-11-18 Smash第3步v4遥测实测与原生本地初始化源码补齐\n\n用户已确认52前台并停止手动操作。本轮通过computer-use正常52Chrome导航v4一次（第3步，累计3/5剩2），没有沿用旧授权、重置额度、重复Enter或刷新；未操作97、远端Codex、终端或安全设置。新截图确认原蓝色Smash加载页，未进入菜单或对局，不计新增待验收。\n\n真实观察共40条完整唯一连续序号事件：5份启动配置/实际游戏目录及.hash继续200，原Invalid path仍消失。ByteBrew初始化请求/错误、Firebase Analytics模块和启动跟踪不再出现，证明v4已删除的消费者在本次原生启动生效；这不代表所有SDK已退役。实际剩余Firebase匿名认证auth/network-request-failed及identitytoolkit signup被同源CSP阻断，Unity原生遥测和newbadwords.txt仍外联。无假UID、provider成功、ready/奖励赋值或清存档。\n\n正常Ctrl+W只关闭本次游戏页；专属GameLabDirectSmashNativeObserveV420261118已停止，真实PID9232不存在、57602监听0，旧任务无周期触发。候选205文件后验SHA与清单40b085d18054083e920938a2bf0d2c11a2737392bca8b5e8e7ab3da0512b4578完全一致。远端通过正常work-log幂等记录实测，原任务blocked/round3/versionnull整行及暂停保持，没有上传入库、接续或改待验收。\n\n两段此前WABT decompile无法生成可读源的原函数26015/43610已静态转译为C，分别503769/219733字节；完整生成C仅作本机分析，不编译、不运行、不作为游戏运行包。移交压缩到两段原函数源及各自原body/SHA，其他分析切片占位体不可运行。原metadata31方法记录含returnParameterToken，parameterStart在+16而非+12；首次类型读取断言发生于结果文件写入前，修正后11个方法参数与原定义恢复，没有修改metadata。泛型原生表进一步确认26015两个参数均Dictionary<string,object>。\n\n原26015先建立空字典，两个覆盖字典均空引用时仍进入真实应用事务：分配原GameSettingsData，调用构造43254、应用原字段，再设置其自身ready21、完成余下字段与原事件2227；不能拿直接ready赋值替代整段。原UserService17870调用25900/43206和43161/43198建立UserData及UserDataReadOnly默认实例，但不设置ready80。后续12572仍校验身份/读回并含远端写入，不能直接当本地生命周期入口。这里是原始默认值/原生数据契约的源码证明，不冒充远端实时配置、持久化、本地身份、玩家/房间/AI实现。\n\nV5.1实测补充同步发布到独立证据目录，原运行候选与历史规格不覆盖。独占处理时间/输入/缓存/输出Token及费用未知继续null。测试站直连2026-11-18T01:16:15Z，A93仍35completed/1review/45blocked/9queued/3failed，57未达到目标；全量材料此前复核无变化，不重跑相同库存或403/404请求。B组、人工暂停、用户跳过/取消、Cow与采集均保持。下一步应接通真实本地配置应用及持久化用户生命周期，具备因果修复后才用剩2步；多次受阻按原目标换到其他有实际输入的A任务。目标未完成。\n'
if '### 2026-11-18 Smash第3步v4遥测实测与原生本地初始化源码补齐' not in old.decode('utf8'):write_bytes(p,old+note.encode())
with svc.store.read()as db:assert svc.get(db,'jobs','job-3db06205247a')==before
assert(e/'ui-ledger.json').read_bytes()==ledger_raw
out={'complete':True,'stage':str(target),'manifest_sha256':hashlib.sha256(raw_manifest).hexdigest(),'files_verified':len(manifest),'candidate_files_post_runtime_sha_verified':len(candidate),'job_unchanged':True,'manual_pause_preserved':True,'game_executed':False,'prior_runtime_game_executed':True,'sync_scope':'Publication of existing genuine runtime and source evidence only; no new player input or task promotion','ready_review':False,'ui_steps_used':3,'ui_steps_remaining':2,'new_player_inputs':0};write_bytes(target/'receipt.json',json.dumps(out,indent=2).encode());print(json.dumps(out))

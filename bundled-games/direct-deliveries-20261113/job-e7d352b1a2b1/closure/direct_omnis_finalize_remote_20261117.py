from pathlib import Path
import sys,json,hashlib,datetime,subprocess,copy
root=Path('D:/GameLab/app');sys.path.insert(0,str(root))
from controlplane.service import Service
from controlplane.atomic_files import write_bytes
stage=Path('D:/GameLab/temp/direct-omnis-final-20261117-v2');receipt=json.loads((stage/'completion-receipt.json').read_text(encoding='utf8'));assert receipt['complete']and receipt['version_id']=='v-4033dfcfe644'
svc=Service(root/'data',root/'game-library','http://127.0.0.1:8766')
with svc.store.read()as db:
 j=svc.get(db,'jobs','job-e7d352b1a2b1');v=svc.get(db,'versions',receipt['version_id']);assert j['status']in ['review','completed']and j['version_id']==v['id']and v['status']=='review'
 for n,h in json.loads((stage/'DELIVERY_MANIFEST.json').read_text(encoding='utf8')).items():assert hashlib.sha256((svc.repo.artifacts/receipt['artifact_id']/n).read_bytes()).hexdigest()==h,n
code=r'''$ErrorActionPreference='Stop'
$name='GameLabDirectOmnisExtraResumedObserve20261117'
$task=Get-ScheduledTask -TaskName $name -ErrorAction SilentlyContinue
if($task){
 if($task.Actions.Execute -ne 'D:\GameLab\runtime\python\python.exe' -or $task.Actions.Arguments -notlike '*direct-omnis-local-20261116-v1\observation_server_extra_resumed_20261117.py*'){throw 'Observer identity mismatch'}
 Export-ScheduledTask -TaskName $name | Set-Content -LiteralPath 'D:\GameLab\temp\direct-omnis-final-20261117-v2\observation-task-before-stop.xml' -Encoding UTF8
 if($task.State -eq 'Running'){Stop-ScheduledTask -TaskName $name}
 Unregister-ScheduledTask -TaskName $name -Confirm:$false
}
$remaining=@(Get-CimInstance Win32_Process -Filter "Name='python.exe'" | Where-Object {$_.CommandLine -like '*direct-omnis-local-20261116-v1\observation_server_extra_resumed_20261117.py*'})
if($remaining.Count){throw 'Original observer process remains; inspect before another action'}
Write-Output 'Exact owned OMNIS verification observer stopped; no browser/worker/service stopped'
'''
done=subprocess.run(['powershell.exe','-NoProfile','-Command',code],capture_output=True,text=True,encoding='utf8',errors='replace',timeout=30);assert done.returncode==0,done.stderr
p=root/'docs/DIRECT_REPAIR_COORDINATION_20261112/AI_A_PROGRESS.md';marker='2026-11-17 OMNIS原生AI轮转已交付待验收'
line='\n\n- '+marker+'：仅追加1步后原PASS & END TURN实际触发Crypto Cult卡牌、National Security卡牌使抵抗4降0，并通过只读查找完整ROUND2玩家阶段文本确认返回玩家。累计11/剩0，原10步失败记录保留。原任务job-e7d352b1a2b1第14轮正常交付v-4033dfcfe644，artifact-664e0f94deac，253文件SHA、单机检查和交付缺项通过，旧草稿v-4f40af6a7dd7及原预算保留；不重新运行模型、不供货。V5.1定义/内容各16，测试站任务/版本review、封面200/匹配、正常授权试玩入口及main200/源SHA匹配。GitHub games-direct-deliveries-20261113已推送345cd4fa292a190ec21cf971e1aa0f6ffdd3706c（270blob核对及远端HEAD一致）。未实测玩家攻击/竞价、完整胜局/全部阵营/刷新；原无整局存档，仅教学偏好。逐款独占耗时/Token/费用未知仍null。原专属验证观察器已停止，不关其他浏览器或服务。\n'
old=p.read_bytes()
if marker not in old.decode('utf8'):
 backup=stage/'a-progress-before-final.md'
 if not backup.exists():write_bytes(backup,old)
 assert p.read_bytes()==old;write_bytes(p,old+line.encode())
portal=json.loads((root/'data/portal-platform.json').read_text(encoding='utf8'))
out={'complete':True,'at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'version_id':v['id'],'job_status':j['status'],'version_status':v['status'],'artifact_files_verified':253,'observer_stopped':True,'other_browsers_or_services_touched':False,'progress_appended_once':True,'portal_enabled':portal.get('enabled'),'portal_push_paused':portal.get('push_paused'),'supply_started':False,'github_commit':'345cd4fa292a190ec21cf971e1aa0f6ffdd3706c'}
write_bytes(stage/'finalization-receipt.json',json.dumps(out,ensure_ascii=False,indent=2).encode());print(json.dumps(out))

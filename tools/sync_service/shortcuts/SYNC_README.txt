GameLab 独立自动同步工具
=======================

已安装 Windows 后台任务：GameLabSync
执行频率：每 3 小时；Windows 启动后也会执行。
不需要打开 Codex，不需要登录桌面。电脑须开机联网。

双击入口：
  sync_now.bat     后台立即同步
  sync_status.bat  查看本轮结果及下次运行时间
  sync_pause.bat   停用后续定时执行（不中断正在进行的一轮）
  sync_resume.bat  恢复定时执行

上述管理入口需要管理员权限，如提示拒绝访问，请右键以管理员身份运行。

同步内容：
  本地业务记录 -> Cloudflare D1
  已审核游戏文件 -> Cloudflare R2，最后刷新云端看板
  本地源码 -> GitHub sync/local 分支
  云端源码 -> GitHub sync/cloudflare 分支

源码备份不会自动部署云端前端或 Worker。
不把密钥、账号配置、数据库、缓存和运行日志提交到 Git。
Git 已有暂存内容、切换工作分支或远端分歧时暂停 Git 步骤，原因记入状态。

运行状态：C:\ProgramData\GameLabSync\status.json
同步日志：C:\ProgramData\GameLabSync\logs
加密凭据：C:\ProgramData\GameLabSync\credentials.dpapi
实现与说明：F:\youxi\door\docs\CLOUD_SYNC.md

失败自动间隔 30 分钟重试，最多两次；后台不会弹窗。
关机期间不能同步，开机后继续。不要删除源码和已安装的 Python/Node 运行时。

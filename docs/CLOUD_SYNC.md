# 本地到云端及 Git 的定时同步

2026-10-28 新增，独立 Windows 后台工具，通过任务计划 `GameLabSync` 每 3 小时执行，系统启动也触发。SYSTEM 账户运行，不需要 Codex、其他聊天应用或用户登录。电脑须开机联网；关机期间无法上传，开机后补跑。此前误建的 Codex 自动任务 `gamelab-3-git` 已停用。

## 操作入口

`F:/youxi/GameLab` 提供 `sync_now.bat`（后台立即同步）、`sync_status.bat`（查看状态）、`sync_pause.bat`（停用后续定时执行）、`sync_resume.bat`（恢复）。管理任务需要 Windows 管理员权限。停用不会中断已经开始的一轮。

实现代码为 `tools/sync_service/`。`install.ps1` 安装任务，`run.ps1` 解密凭据并启动 `runner.py`，后者独立执行云端同步和 Git 同步并汇总结果。设置位于 `C:/ProgramData/GameLabSync/config.json`，凭据保存在机器范围 DPAPI 加密文件中，目录仅 Administrators 和 SYSTEM 可访问。运行不从 Codex 读取凭据；Git 使用工具自己的副本。Python/Node 使用本机已安装的可执行文件，不需要其所属应用运行，勿删除相关运行时目录。

`C:/ProgramData/GameLabSync/status.json` 为整轮状态，`logs/` 保留最近 60 轮日志。避免重复实例，失败 30 分钟后重试，最多两次；单轮上限 170 分钟。Git 分支、暂存内容或远端历史异常会停止 Git 步骤并记入状态，不强推。后台工具不会弹窗通知，失败可在状态入口和 Windows 任务计划查看。

## 云端

```powershell
& 'C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe' F:/youxi/door/tools/sync_cloud.py --apply
```

不带 `--apply` 为预检。依赖 boto3、现有 Cloudflare/R2 环境凭据和相邻 `door-cloudflare-migration` 工程的迁移工具。账户、D1、桶沿用该工程 wrangler.toml。

SQLite 只读事务取得一致记录，排除账户、会话、凭据、维护设置、执行器配置及审计记录，脱敏后写入 D1。保留本地任务实际状态，不把运行中的任务改成迁移失败。仅上传 approved/published 版本已登记文件，校验源文件与登记摘要；先上传文件再更新记录，最后刷新 R2 门户快照。历史同路径不同摘要会中止，不覆盖不可变产物。云端既有独有记录不自动删除。本同步不部署前端或 Worker 程序；源码备份到 Git 不等于程序上线。

`data/cloud-sync/checkpoint.json` 保存成功同步摘要，`status.json` 保存最后执行时间与成功/失败类型。失败不推进检查点，下次重试；进程锁阻止重叠运行。D1 多批写入不是整体事务，失败时部分记录可能已更新，但门户快照只在最后生成。执行前不重跑游戏、不修改人工验收、不重启平台。

## Git

现有 origin 为 https://github.com/youxi9088-create/gamelab.git 。本地 main 与远端 main 已分歧，因此自动备份使用独立远端分支：

- `F:/youxi/door` → `sync/local`
- `F:/youxi/door-cloudflare-migration` → `sync/cloudflare`

工具按代码目录及扩展名白名单提交，并检查现有凭据值和常见令牌/私钥格式（不是完整敏感信息审计）。排除 data、migration-private、.cache、.deploy-backups、日志、数据库及私密 reports。已有暂存内容或冲突停止 Git 步骤并记录，不强推，不切换工作分支。没有改动仍可重试上次未成功的 push；没有改动不产生空提交。云端和 Git 两步骤分别报告结果，不能将单项成功称为全部同步完成。游戏运行文件备份到 R2，不自动纳入 Git。

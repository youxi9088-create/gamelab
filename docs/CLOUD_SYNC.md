# 本地到云端及 Git 的定时同步

2026-10-28 新增，每 3 小时由 Codex 本聊天自动任务 `gamelab-3-git` 执行。本机必须开机联网且 Codex 能执行任务；这不是 Windows 系统服务，关闭应用或关机期间不能保证执行。

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

自动任务检查差异和敏感内容后，仅提交源码、测试及普通文档。排除 data、migration-private、.cache、.deploy-backups、日志、密钥、数据库及私密 reports。已有暂存内容或冲突应停止 Git 步骤并通知，不强推，不切换工作分支。没有改动仍可重试上次未成功的 push；没有改动不产生空提交。云端和 Git 两步骤分别报告结果，不能将单项成功称为全部同步完成。

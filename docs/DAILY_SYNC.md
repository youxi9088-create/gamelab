# 每日 Git 与云端数据同步

## 本次准备状态（2026-10-30）

转换数据的权威来源已迁到 192.168.56.52 的 D:\GameLab\app，不能再用原电脑暂停时的数据库覆盖云端。当前仅完成脚本改造；没有安装或启用生产定时任务，也没有完成一次云端发布。缺少 Cloudflare/R2 发布凭据和目标确认，不能把此文件当作部署完成记录。

Git 的 origin/sync/cloudflare 分支已恢复到独立工作目录 door-cloudflare-migration，保存已有 Worker、D1 和 R2 工具。该分支记录的站点为 https://gamelab-migration.youxi9088.workers.dev ，需要确认仍是实际目标。不修改正在转换任务的工作副本。

新机器 D:\GameLab\qa\daily-sync 已完成 6 项隔离测试（包括云端缺记录、陈旧记录、上传成功但读回陈旧快照的失败路径），安装脚本 PowerShell 语法检查通过，时区确认为 China Standard Time。测试使用模拟云端，不代表真实 Cloudflare 发布通过；没有在原电脑执行测试。当前和转换机器均未发现 GameLabSync 配置或 Cloudflare/R2 环境凭据。

## 调度和成功条件

用户已确认两个发布目标：原服务器 https://47.110.232.68/ 和 Cloudflare https://gamelab-migration.youxi9088.workers.dev/ 。两者都必须更新。调度器使用 required_cloud_targets=[cloudflare, origin] 分别记录结果，一边失败仍尝试另一边，但不能登记整体成功。原服务器连接已验证，Cloudflare/R2 凭据尚未取得；原服务器同步适配尚未实现，安装器要求提供已实现并验证的 OriginSyncScript，不能拿旧版全量恢复覆盖生产库。接入时保留原站账号和独有数据，先核查正在运行的任务与记录冲突，再制定增量合并。

原服务器连接补充：用户提供的 SSH 部署密钥已通过严格 known_hosts 校验，Administrator@47.110.232.68:22 登录成功。接收目录权限过宽会被 OpenSSH 拒绝；实际连接使用用户 .ssh/gamelab-deployment 下限制当前用户访问的副本，不修改接收原件、不输出私钥、不将密钥加入 Git。现场确认 C:\GameLab\app 指向 releases\07e0d568c2379b360a5db060d295fc5b0ae4b0ad；数据为 C:\GameLab\shared\data\platform.sqlite3。检查时有 21 个候选、69 个版本、11 个任务（9 completed、2 blocked）、3 个账号，无 running/queued 任务；此为检查时快照，不代表发布时仍空闲。未改原站服务或数据。Cloudflare/R2 凭据仍未找到，SSH 密钥不能替代它们。每日任务尚未启用，原服务器合并适配仍待实现和隔离验证。

- Windows GameLabSync：默认机器本地时间每日 03:00，并在开机时补跑；部署时核对机器时区为北京时间。无须 Codex 会话或用户保持登录。
- 不重叠执行；失败间隔 30 分钟重试 3 次，单次上限 4 小时。关机或网络不可用不能承诺当天成功；status.json 明确失败，last-success.json 保留最后一次真正成功时间。
- 云端镜像从 SQLite 只读事务取得一致记录；私密配置、用户、会话和凭据不进入云端业务镜像或 Git。当前仅已批准/已发布版本上传成品文件，待验收/运行任务只同步记录，不自动验收。
- D1 写入后逐条读取本次源快照所有记录并比较。再生成门户 state-core.json，写 R2 并 GET 比较完整字节；两者成功才更新 checkpoint、last-success 和北京时间按日汇总回执。不是只检查脚本退出码或上传 HTTP 成功。
- 即使当天业务无变化，也重新生成门户快照和同步回执。业务记录数量、变更量、文件数量和门户摘要进入 data/cloud-sync/daily/YYYY-MM-DD.json。不伪造新增游戏或完成数。
- 回执验证范围是 D1 与 R2；正式开通仍需浏览器登录云端核对门户最新数据，不能将对象存储读回冒充界面验证。
- Git 现有备份保留 sync/local、sync/cloudflare 分支，不强推；已有暂存修改、冲突或远端分叉时停止 Git 部分并保留失败原因。生产启用前必须确定实际代码工作目录和分支，不能直接对无 .git 的迁移副本运行。
- 现有工具更新云端数据和门户快照，不自动把 Python 后端部署成 Worker。修改 Worker 代码需在独立云端分支验证后发布，不能把 Git push 当成代码上线。

## 接通时的检查

在转换机器配置独立云端目录、Python boto3 依赖、NODE_BINARY 和 Git 工作目录；Cloudflare/R2/Git 凭据由该机 DPAPI 加密存储并限制目录 ACL，不复制另一机器加密文件，不放入代码或报告。install.ps1 接收 LocalRoot、CloudRoot、Python、DailyAt，cloud_root 会显式传给同步脚本。

先执行一次实际同步并核对 D1/R2 回执、Git 远端 SHA、云端登录后的数据与源快照，再注册任务、检查 NextRunTime 和失败重试设置。安装成功本身不代表已成功同步。

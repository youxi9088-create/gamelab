# 云端生产运行、开发与发布手册

更新：2026-10-22。

## 1. 权威来源

- Git：平台程序、依赖锁文件、部署脚本、测试与文档。
- 云端统一生产目录：全部业务数据库、游戏运行产物、游戏源码版本库、过程证据、账号及服务私密配置。
- 本地电脑：只负责开发与隔离测试。关闭开发电脑不影响云端服务。

生产文件不提交平台 Git；从 Git 发布必须使用确定的提交，不使用未提交工作区文件。

## 2. 云端目录

```text
C:\GameLab\
  app\                       当前发布版本的目录链接，保持旧引用稳定
  releases\<Git提交>\         不可变的程序发布目录
  shared\                    统一生产数据根目录
    data\                    数据库、游戏产物、服务配置、用量与工具凭据
    game-library\            游戏源码、版本与独立 Git 历史
    runs\                    任务执行文件、截图、检查点与证据
    converter-data\          原包服务私有数据
    config\                  门户私密配置、环境路径及部署配置副本
    logs\                    平台运行日志
    history\                 本地历史完整归档与独有游戏导入清单
    release.json             当前程序提交与上一个发布目录
    releases.jsonl           发布与回退记录
    backup-status.json       最近成功备份及完整性校验结果
    monitor-status.json      健康检查、磁盘与备份新鲜度
  runtime\                   可重新安装的执行依赖，不属于业务数据
  backups\                   带完整文件清单和 SHA-256 的备份包
```

数据库与游戏文件共同组成完整生产数据。数据库存关系和业务记录，文件系统存大型运行包和证据；两者纳入同一备份清单。此实现为云服务器集中持久存储，尚未接入独立云数据库或对象存储。

当前与旧路径兼容的目录链接使历史产物引用继续可用。`app` 下的 data、game-library 和 executors/runs 指向 shared，更新程序不能替换这些生产目录。

## 3. 账号与权限

项目内共享数据，不进行客户之间的数据隔离。

| 角色 | 权限 |
|---|---|
| 管理员 | 查看全部数据；管理账号、服务、价格与规则；执行验收、供货及其他管理操作 |
| 操作员 | 查看项目数据；提交转换；回复和重试任务；启动、暂停、恢复及停止批次；处理采集建议 |
| 只读用户 | 查看游戏、任务与记录，不修改项目数据 |

管理员登录后进入“账号与运维”，创建账号、设置角色、启停账号或重置密码。账号无公开自助注册入口。密码使用带随机盐的 PBKDF2 哈希，数据库不保存明文密码。

首次升级将既有环境管理员初始化为数据库账号。初始化之后环境变量不会每次重置管理员密码。会话以 Token 哈希持久化，12小时到期；修改密码、权限或停用账号后，旧会话立即失效。至少保留一名启用的管理员。

历史任务没有可靠操作者信息时不补造归属；新创建任务记录创建者，新操作记录实际账号。既有任务仍属于共享项目。

## 4. 本地开发

1. 在家里或公司电脑从 Git 拉取代码。
2. 使用独立开发数据目录启动，不复制生产密钥作为默认开发配置。
3. 修改后使用隔离数据库和自有样例测试，不通过真实游戏重跑验证平台代码。
4. 将代码、需要的迁移逻辑与文档一并提交和推送。

```powershell
git pull --ff-only
# 安装环境后开发和检查
python -m unittest discover -s tests -p test_cloud_production.py
git add <本次修改文件>
git commit -m "Describe change"
git push origin main
```

新功能不需要改动数据库结构时，仍应考虑 JSON 记录的向后兼容。破坏性数据迁移必须设计独立备份与回退方案，不能用程序回退代替数据恢复。

## 5. 发布

### 5.1 构建来自 Git 的发布包

```powershell
python tools/build_release.py --ref HEAD --output qa-output/release.zip
```

脚本从 Git 提交读取文件，确认提交被远程分支包含；工作区未提交的内容不会进入发布包。发布包带提交 ID 与逐文件 SHA-256 清单。历史 bundled-games 快照不随每次程序更新重复分发，生产游戏由 shared 管理。

### 5.2 在服务器部署

将发布包和仓库中的部署脚本传到服务器，然后在服务器管理员 PowerShell 执行：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/deploy_release.ps1 `
  -Package C:\GameLab\staging\release.zip -Root C:\GameLab
```

首次启用可把部署脚本先放到 staging；后续使用已发布的 app/tools/deploy_release.ps1。SSH 凭据单独保管，不提交 Git。

发布流程：验证包 → 检查没有正在转换或扫描的任务 → 暂停新任务领取 → 停止平台 → 校验备份 → 切换 app 目录链接 → 启动 → 管理和试玩健康检查 → 登记 Git 提交 → 恢复领取任务。

发布遇到正在运行的转换会拒绝，而不是强行杀掉任务。可以先在“账号与运维”暂停领取新任务，等待当前任务结束，再发布。发布使用独占锁，避免备份与发布同时执行。

依赖锁发生变化时部署拒绝复用旧依赖，需先为新版本准备匹配的执行依赖；浏览器与 Node/Python/Git 仍是服务器运行环境，不能靠复制源码自动获得。

当前是显式发布，不是每次推送 Git 自动发布生产。没有自动覆盖生产数据的 Git 钩子。

## 6. 回退

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\GameLab\app\tools\rollback-release.ps1
```

回退选择 release.json 中记录的上一程序目录，保留 shared 数据。需要没有活动转换；回退后执行门户与试玩健康检查并登记记录。

这只适用于数据仍兼容的代码回退。若数据库发生不兼容迁移，应停止服务并按经过检查的备份恢复方案处理，不能直接切旧代码。首个标准发布的上一版本可能是保留的 legacy 目录，其来源不能冒充 Git 发布版本。

## 7. 完整备份与恢复

计划备份与发布前备份共用 `tools/production_data.py`。备份覆盖 shared 数据，数据库通过 SQLite 备份 API 生成一致快照，文件记录大小与 SHA-256，生成后进行全量校验。

```powershell
# 维护暂停且没有活动转换或扫描时
python tools/production_data.py backup --root C:\GameLab\shared --file D:\Backups\production.zip
python tools/production_data.py verify --file D:\Backups\production.zip
# 仅允许恢复到空目录
python tools/production_data.py restore --file D:\Backups\production.zip --target D:\Restored\shared
```

备份包含凭据和业务数据，必须限制访问；当前备份包不自带加密。还原后保持维护暂停，核对路径、账户权限、运行环境及配置后恢复服务。

同机备份可防误操作和程序更新问题，不能防整台服务器或磁盘丢失。应另行配置受控的异机备份目标；未提供目标之前，不宣称已完成异地灾备。当前脚本不自动删除历史备份，磁盘不足会产生告警。

## 8. 持续运行与监测

`GameLabPlatform` 监督平台进程，执行器监督 worker；HTTPS 代理和证书维护使用服务器计划任务。

安装生产维护任务：

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File C:\GameLab\app\tools\install-production-tasks.ps1
```

- 每5分钟检查门户、试玩、SQLite、可用磁盘以及最近备份时间。
- 每天服务器本地时间04:00尝试完整备份。部署服务器使用中国标准时间。
- 备份遇到活动转换或扫描不会中断任务，会退出并在下一次计划重试；超过48小时无成功备份会在运维页面报告。
- 运维页面读取监测文件和操作审计，显示发布版本、数据位置、备份及维护状态。

当前告警保存在云端运维页面及计划任务结果中，没有接入短信或邮件通知，也不承诺高可用、零停机升级或永不失败。

## 9. 本地历史归档与独有游戏合并

本地历史归档保留原数据库、游戏产物、游戏源码库（含 Git 历史）及执行文件，以清单和 SHA-256 校验完整性。归档位于 shared/history，纳入后续完整备份；它不是线上任务队列。

`tools/merge_game_history.py --archive <shared/history中的备份包> --shared C:\GameLab\shared` 先输出计划；加 `--apply` 在维护暂停、无活动转换时执行。它只导入云端 ID 和来源 URL 均不存在的正式游戏、版本、产物及已有规格记录，不覆盖现有游戏、不导入历史服务凭据或旧任务、不触发转换或验收。隐藏自检游戏只留在归档中。版本状态原样保留，原始提交与来源信息保留在历史字段及完整归档中。

历史工作记录仍通过归档数据库保存，尚无在门户浏览完整历史归档的专门页面。原始记录中的本地证据绝对路径是历史来源信息，不能当作云端可直接打开的路径。当前导入的游戏运行包和源码版本目录有独立的云端副本。

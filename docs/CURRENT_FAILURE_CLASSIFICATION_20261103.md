# 当前失败任务分类与恢复（2026-11-03）

最新用户顺序：先看所有待完善/执行失败，按共性原因修复共享流程；修复验证并同步后恢复相应任务，等待游戏结果期间处理供货。首页暂不修改。

| 游戏 | 分类 | 恢复条件 |
| --- | --- | --- |
| Play Throttle Riot - Free Online Game ／ Rosebud | resource_missing | 补抓/缺失来源证据及回退审查→原节点复验，不自动豁免 |
| Last Minute | entry | 最终可见控件与遮挡检测、过滤站点导航及账号操作，再真实交互 |
| Play Wild Contracts - Free Online Game ／ Rosebud | screenshot | 专用验证会话重建及无头截图复验；持续失败归平台 |
| Play Whip Worm - Free Online Game ／ Rosebud | screenshot | 专用验证会话重建及无头截图复验；持续失败归平台 |
| TurboCrib | entry | 最终可见控件与遮挡检测、过滤站点导航及账号操作，再真实交互 |
| Play Turbo Lane 3D - Free Online Game ／ Rosebud | screenshot | 专用验证会话重建及无头截图复验；持续失败归平台 |
| The Castle Ate Naomi | entry | 最终可见控件与遮挡检测、过滤站点导航及账号操作，再真实交互 |
| Play The 96 - Free Online Game ／ Rosebud | resource_missing | 补抓/缺失来源证据及回退审查→原节点复验，不自动豁免 |
| Play Starblade - Free Online Game ／ Rosebud | verification_navigation | 仅内部部署域名导航超时进入有界专用会话恢复 |
| Play Spinted Postal - Free Online Game ／ Rosebud | control_plane | 有界幂等重试，记录失败接口；不交给AI修改游戏 |
| Play SciFiStory - Free Online Game ／ Rosebud | online_core | 纯联机核心，需真实服务条件或实质单人/人机改造；不盲重试 |
| Play Roundhouse Hockey 2 - Free Online Game ／ Rosebud | resource_missing | 补抓/缺失来源证据及回退审查→原节点复验，不自动豁免 |
| Play Pocketwild - Free Online Game ／ Rosebud | external_static_modules | 仅实际请求且源码明确声明的公开模块GET自动补齐并复验 |
| Play Pocket Empire - Free Online Game ／ Rosebud | resource_missing | 补抓/缺失来源证据及回退审查→原节点复验，不自动豁免 |

共享修复已按文件摘要保护、备份、隔离测试后同步；最终同步回执与重启结果随后记录。原版本与人工验收状态不覆盖。
前一批已进入待验收：Finger Haunt、Street Football。当前分类清单与前一批不是同一快照，不能直接相减统计。
非目标队列临时暂停的恢复责任保留：D:/GameLab/backups/needs-work-focus-20261103/resume-other-queued.json。

## 19:22 后的正式恢复及复查

- 全量复查扩展为16项：另含 Viktor Vega（AI调用超时）及 SmashUp（部署导航超时）。15项通过平台原任务启动流程恢复；SciFiStory 的真实账号/联机核心条件仍未具备，未盲重试。
- 初次专项临时暂停的175项普通队列已全部恢复，回执 D:/GameLab/backups/classified-resume-20261103-192210/receipt.json，另保存 final-restore-receipt.json；没有遗留专项暂停。
- 重启后继续按新结果分类，不能把排队当作已修复。Turbo Lane 3D已由正常流程完成；资源仍缺失、截图仍超时的任务仍保留实际错误。
- 入口复查发现 Universal 外层加载器可能未挂出iframe，而RSC已声明当前游戏revision。新增来源域及路径限定的公开平台适配，读取JSON字面量，不执行页面脚本；唯一revision只生成待探测地址，必须重新打开并验证。
- 采集响应体收集改为有界等待，保留已完成资源及未结束标记。Python采集超时在Node仍存活时回收所属进程树，并归类 acquisition_process_timeout；不把采集超时变成游戏完成。
- 本地及远端18项Python回归与2项Node回归通过。远端备份 acquisition-recovery-20261103-200642；此前供货基础23项回归通过。
- 20:00将 Last Minute、TurboCrib、The Castle Ate Naomi 沿原任务再次恢复；同一事务将176项普通队列恢复到它们之后。没有中断运行任务、没有留下新增手动暂停。回执 entry-target-resume-20261103-200016/receipt.json。

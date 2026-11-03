# 待完善到待验收专项跟进（2026-11-03）

权威要求：用户要求跟进任务中心当前待完善任务，真实修复并验证后全部到待验收。禁止直接改状态、代替人工验收或拿隔离启动通过冒充完整玩法。

当前阶段：阶段一实施中、证据待补；阶段二仅保留原画面，未新增UI设计；阶段三未扩展。已有游戏的转换修复不改造原玩法或画面。验收以每项原始玩法门禁及本轮真实操作证据为准。

## 锁定目标

| 任务 | 游戏 | 初始问题 |
| --- | --- | --- |
| job-6e1680735b15 | Throttle Riot | TimeoutError: timed out |
| job-0b256b1ec1c7 | Finger Haunt – Haunted Survival FPS | RuntimeError: Web verify: Missing local runtime resources |
| job-4032056fbfc4 | Taxi Sort: City Rush | AI 调用中断：AI API 调用失败：超时，任务等待上限 300 秒；请检查连接和模型配置；下一步：服务恢复后从本轮已验证操作继续原任务，重新观察后完成剩余检查 |
| job-b25e69d82c51 | Last Minute | 入口恢复未通过：页面声明了 iframe 入口候选：https://playground-gateway-v2-snduoq54tq-uc.a.run.app/api/server/1ec8 |
| job-898ab943e6f5 | Wild Contracts | RuntimeError: Web verify: Offline check failed: {"errors":[],"missing":["/assets/voice/n1.mp3", |
| job-85d2d2a86b03 | Whip Worm | RuntimeError: Web verify: Viewport screenshot timed out |
| job-1eb9f3109aa9 | Viktor Vega: The Setup | AI 调用中断：AI API 调用失败：超时，任务等待上限 300 秒；请检查连接和模型配置；下一步：服务恢复后从本轮已验证操作继续原任务，重新观察后完成剩余检查 |
| job-5beff206e446 | TurboCrib | 入口恢复未通过：页面声明了 iframe 入口候选：https://playground-gateway-v2-snduoq54tq-uc.a.run.app/api/server/7c37 |
| job-32b35ff232c7 | Turbo Lane 3D | TimeoutError: timed out |
| job-adf13457f63c | The Midnight Sessions: Echoes | RuntimeError: Web verify: Offline check failed: {"errors":[],"missing":["/assets/dave-greening- |
| job-92b66d41e876 | The 96 | RuntimeError: Web verify: Offline check failed: {"errors":[],"missing":["/assets/p-jenna.webp"] |
| job-4d23c00e7956 | Street Football: The Roguelite | RuntimeError: Web verify: Viewport screenshot timed out |
| job-24fda4e6c18e | Starblade | TimeoutError: timed out |
| job-4e4fc88d39aa | SmashUp.io | RuntimeError: Web verify: Viewport screenshot timed out |

## 已实施措施

- 8项基础设施失败沿平台bulk start恢复；随后4项资源相关任务恢复，保留检查点与历史版本。2项入口失败在查证后再恢复。排队不记为完成。
- 用平台bulk pause临时暂停非目标排队任务，让目标优先获得空闲槽。恢复清单：远端D:/GameLab/backups/needs-work-focus-20261103/resume-other-queued.json；专项结束必须逐项恢复原先未暂停项，已有手动暂停项不在清单中。现有运行任务未停止。
- 新增精确入口/URL绑定的公开资源恢复缓存，SHA-256及字节数校验后才提供真实原站字节，不缓存验证结果。Finger Haunt两份原始字体已入远端缓存；源证据在工程父目录deployment-packages/finger-font-source-evidence.json。主补抓仍受原路径、字体头、总字节限额和原节点复验约束。
- 缓存测试在本地及远端通过，覆盖正确字节、跨入口不复用和篡改拒绝。正式discovered-web.cjs合入缓存读取，保留远端Poki及资源解析改动；备份D:/GameLab/backups/recovered-cache-20261103-175756。
- 发现ReviewBrowser在8秒优雅关闭失败后只kill Node父进程，存在遗留Chrome后代风险。新增process_tree.py在Windows超时路径定向终止所拥有的进程树；真实父子进程退出测试在本地及远端通过。远端discovered_web.py只替换该关闭分支，备份D:/GameLab/backups/browser-tree-20261103-180047。不对活动任务调用清理。

## 完成门禁

每项必须由本轮平台转换完成，并有真实启动、关键操作、结果反馈与截图；打开截图核查界面。更新后的正式版本出现在测试站且状态为review。已完成/待验收游戏不重复运行。全部目标完成后恢复其他排队任务并复核无遗漏。

## 队列恢复责任已履行

初次175项临时暂停已于19:22恢复，回执 classified-resume-20261103-192210/receipt.json。20:00为三个修正入口的目标调整队列顺序，在一个事务内暂停并立即恢复176项普通排队项，未碰运行项及原先人工暂停项；回执 entry-target-resume-20261103-200016/receipt.json。目标仍持续复查，不能将恢复队列或同步代码写成全部游戏通过。

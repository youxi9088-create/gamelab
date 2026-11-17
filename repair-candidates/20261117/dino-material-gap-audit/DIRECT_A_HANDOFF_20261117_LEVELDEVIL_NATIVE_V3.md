# A组继续交接：Level Devil 原生v3

目标仍为A93、20261112-r1及归属本聊天的验收整改全部正常待验收。OMNIS已经交付，不再重复。2026-11-17T12:17:58Z测试站绕代理直连A93：35completed/1review/45blocked/9queued/3failed，57未达目标。本轮暂未新增待验收。原B组、人工暂停、Cow失败及停止采集约束保持，不触发下游供货。

## 当前原任务与源码

Level Devil：job-ca75d464d2d7 / game-2a4704442ec3，远端实际failed、round6、v-1f8b04b1ee19，无人工暂停。原草稿和任务状态未改。修订work-native-retirement-20261117-v3已经在52 `D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3/converted`，原45候选＋17支持文件逐SHA保持，清单88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08。不得重跑旧构建器或覆盖v2/v3历史。

15/145原Lua仅服务边界改动，其他130份不变；803资源中788份解码字节不变；原三章、关卡、物理、角色、存档和本地编辑保留。真实WASM构造器PokiSdk注册调用退役、其他4420函数体不变；14JS导入只留异常守卫，无假SDK成功、广告领取、免费跳关、全局平台或许可标志变更。原dmanifest/projectc及校验逻辑保留。本轮真实引擎已接受新归档并启动，覆盖此前“新归档尚未启动”状态；不等于全部玩法通过。

源候选GitHub提交c33c49d2c45898b630285d5c2718a0e1463a73c3，69blob已验证；本轮追加证据提交5dbe50e473a31a6722fa8897b9dda5018d635e8b，24blob已验证、push0、ls-remote一致。仓库youxi9088-create/gamelab，分支games-direct-deliveries-20261113；本轮证据路径repair-candidates/20261117/level-devil-native-v3-validation。旧源候选README“未启动”为其当时历史，当前以本补充为准。

## 实机与授权，不能重置

call_gkZRy3lYXlVRC4SM8XDEmTiB仅此修订额外5步，实际全部执行并照实计数：累计6启动原生v3章节地图；7点击入口未进；8屏幕键盘空格尝试未进；9重新聚焦后空格仍未进、原Pits提示出现；10原门口一次连续鼠标按下/释放实际进入首房间，角色在左、出口在右、第一小关标记显示。新增5步没有验证移动、跳跃、陷阱、胜负或刷新。原5步记录仍保留，不套用其旧候选观察当本修订通过。

截图validation-native-v3-20261117/revision-step06-native-map.png和revision-step10-original-first-room.png均真实Sky截图。只读事件13连续、12资源全部localhost57586且200、无记录错误或外部请求，源码45文件SHA不变。runtime_verified/ready_review仍false。

随后用户call_y3mdSTScSZcHhD0ZkwVw3SFG明确“仅此修订追加最多3步”，绑定同一已加载v3，累计最大13、实际已执行10、另外3尚未执行。已独立写本机/远端extra-three-authorization-20261117.json及工作日志，回执complete。

最新ui-ledger-native-v3-20261117.json已预留累计11向右移动，但Sky返回“user input was detected in this window; call get_window_state before continuing”，**拒绝发出操作**；随后读到RDP最小化，恢复重取再次被手动输入打断。目前第11步status=reserved，不是已运行；ledger steps_used=11表示保守预约，remaining=2是未预约余量，实际10执行＋1未发预约＋2未预约＝13上限。不得把预约写成移动成功，也不得再reserve一个向右动作；桌面恢复后沿同一第11步执行，然后outcome，再预约12/13。没有实际输入的明确拒绝不能虚称游戏故障；不要因此重启游戏。

已异步请用户保持52前台、暂不切换/最小化；等明确答复，不能以等待期满当桌面恢复。不需要重连SSH或重新授权3步。当前52仍首房间，系统屏幕键盘在上方遮顶、玩家/地板在下方可见；不应自动操作额外菜单或重置存档。

## 连接和GUI约束

SSH活控session94663，桥goal-c5d93770d156，最新12:38Z额外3步回执真实exit0。旧70702已退出绝不复用。Sky仅node_repl+@oai/sky，目标实际RDP窗口527928/192.168.56.52，97不能动。现有node变量sky/ldWindow/ldState/ldFs/ldEvidence；窗口最小化或输入中断后不得复用旧坐标，先重新get_window_state，必要激活再get_window一次。若用户物理Esc或停止指令出现，马上停止输入。

准备阶段仅自编无游戏诊断页测量键盘：Sky普通Right约3.3ms，52预装OSK按键拖动24.8/28.3ms；本机OSK不向RDP传键，已关闭。本机与52的键盘应用均为预装，未安装软件或修改输入选项/安全设置。不能只由这些时长推断真实游戏唯一漏键根因。原GLFW.isCanvasActive仅接收canvas焦点，键盘焦点与按下/释放采样需核对；不伪造游戏事件、直接调用业务或改变平台就绪值。52OSK经任务栏恢复后需核对浏览器/画布焦点，窗口准备与玩家操作分开；实际给游戏的失败输入仍计额度。

观察器任务GameLabDirectLevelDevilNativeV3Observe20261117、实际PID27284、localhost57586、两小时上限，路径observation_server_native_v3_20261117.py。仅只读错误/资源观察，诊断页限制方向/空格计时；不注入业务/输入。当前不要重复注册或启动。最终完成或暂缓时按任务动作、PID命令行精确清理，仅停本聊天观察器，不关闭Chrome/其他任务。

## 接续条件

先完成已授权剩余3个实际动作范围，按观察写真实结果。若仍无法验证，保留阻点并切下一个A项；不得因为本机静态和资源齐全直接待验收。真正通过后新不可变最终包，V5.1 16维写本修订实测事实/边界，截图revision-前缀；正常依赖修订、原任务一次reconstruct接续、定向租约、artifact及ready_review接口，保留旧草稿/自动跟进/预算，禁止手改状态。正常HTTPS授权试玩读回入口/资源SHA、规格16维/封面，源码完整GitHub提交推送。每款独占耗时/Token/费用未知保留null。

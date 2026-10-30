# 三款 Remix 游戏转换：共享修复与复用规则

## 适用目标

输入不同站点的 Web 游戏，保留原代码与资源，生成可离线运行包，再以真实输入和截图核对基础玩法。以下记录来自本地版本与执行证据，不代表所有引擎或网站已验证。

## 三个实际样本

| 游戏 | 待验收版本 | 实际适配 | 验证边界 |
|---|---|---|---|
| PolyRace | v-260c1d23179f | Three.js 模块与资源URL本地化、Remix SDK本地宿主、浏览器网络下载回退 | 发车、车辆控制、重生、重开、菜单及本地保存；非完整比赛验收 |
| STICKMAN STRIKE | v-6d4f8adb08c3 | Three.js引用本地化、Google Fonts CSS与4份字体、CSS依赖重定位 | BOT对战、移动射击、回合推进与刷新恢复；在线对战等未验证 |
| Zombie Wrecker | v-add432566a4a | Remix本地宿主、7张车辆图片补齐、动态资源引用映射 | 驾驶、结算、车库升级与本地恢复；未证明完整通关 |

报告与截图：data/artifacts/artifact-88339b3a3c43、artifact-32776d53df6b、artifact-8773728021b1。版本状态是待人工验收，不是人工已验收。核心玩法未按本次需求重写；HTML/JS/CSS存在路径、宿主与兼容修改。

## 共性、自动处理和证据

| 问题特征 | 共享规则 | 实现入口 | 通过条件 |
|---|---|---|---|
| 未识别专用模块结构 | 专用静态适配不适用时回退实际浏览器采集 | discovered_web.py / modular_web.py | 必须继续离线及交互验证 |
| 公开资源API下载连接重置/超时 | GET有限重试，仍失败则隔离浏览器网络栈下载 | resource-retry.cjs / browser-resource-transfer.cjs | 保存真实响应字节、来源与哈希；不伪造网络成功 |
| 模型/配置通过跨域fetch加载 | 入口与已取得脚本的字面量静态引用，必须精确匹配实际GET | static-resource-evidence.cjs | 方法、URL及查询参数一致；不开放未知API |
| 文件已有但动态地址仍请求原站 | 精确URL映射；支持src/href与CSS背景，采用包基址 | adapters/runtime-resource-bindings.js / discovered-web.cjs | 干净浏览器外网隔离复验 |
| CSS移到本地导致字体地址失效 | 从原始CSS按原URL解析相对依赖，已取得依赖切换本地 | runtime_recovery.py | 新暴露依赖仍须取得并复验，保留原文与修改哈希 |
| 需要AI反复判断是否补字体/图片 | 本轮真实静态GET与包内HTML/CSS字面声明精确匹配后自动补抓 | declared_static_ids / recover_declared_static | 最多3轮、每轮12项、不重复相同URL集合，随后回原节点实际复验 |
| 复验失败撤销已下载资源 | 静态下载可保留为待验证输入，移除重复rollback | auto_repair.py | 保留不表示验证通过，普通宿主编辑继续回退 |
| 续跑恢复到修复之前 | 实际复验成功后新建不可变web-runtime检查点 | conversion_checkpoint.py | 任务/输入绑定和文件摘要校验；历史检查点不覆盖 |
| 空补丁也提示过大 | 限制本次提交patch，不把沿用基线算成新补丁 | discovered_web.py | 新全文仍受2MB限制，原始文件保护不变 |

自动资源规则在共享诊断入口执行，覆盖有真实runtime报告的初次转换和Web续作；无匹配、网络失败或仍有运行问题时回到原AI诊断，不忽略异常，也不自行改变待验收状态。static-recovery.json记录自动选择、下载及复验结果。

## 复用边界

以上是按技术证据组合的共享能力，禁止按游戏名、ID或截图路径特判。原站SDK适配仍按明确声明选择，不代表所有版本兼容。未知脚本混淆、动态拼接地址、CSS复杂语法、后端接口和未访问关卡仍可能需要探索。不可把去掉URL查询参数、屏蔽字体/图片或伪造登录作为成功。

这三个同站样本证明这些修复对实际问题有效，尚不是跨站成功率评估。可组合契约注册库、发现阶段全部资源移交、跨站固定样本矩阵尚未完整完成；不得宣称已具备自动学习任意游戏契约能力。

## 回归

- tests/test_declared_static_recovery.py：精确声明、查询参数、排除未知和POST、自动复验与停止重复。
- tests/test_stylesheet_rebase.py：相对字体/CSS引用来源与映射更新。
- tests/test_conversion_checkpoint.py：不可变历史、修复检查点、身份绑定和摘要。
- tests/test_runtime_bindings.cjs：原生浏览器动态图片与背景、嵌套部署、不同查询参数不误匹配。
- tests/test_resource_retry.cjs：有限GET重试，POST与非传输错误不重试。
- tests/test_static_resource_evidence.cjs：静态引用证据与动态模板排除。
- tests/test_runtime_recovery.py：原始证据保留、回滚、连续依赖与实际浏览器复验。

再次遇到同类失败时，先看runtime.json、acquisition.json、static-recovery.json和检查点，不重新针对游戏编写方案。不保证所有问题消失；新结构需保留失败样本并补共享能力和隔离回归。

## 2026-10-30：本地共享规则与资源移交更新

- runtime-contracts.json 是共享规则注册表，revision 标记库版本，单规则保留 id/version、group、requires/excludes、优先级、adapter/provides。加载器与宿主分别组合。首批注册 Ruffle、Cocos 2、Defold、通用浏览器和声明的 Remix SDK，不将同网站等同同引擎。
- runtime-contracts.cjs 在采集到入口源码后匹配。规则冲突/证据不足继续通用浏览器探索；未知结构仅生成未验证候选记录，不自动把AI生成代码晋升为可信适配器。源哈希记录本游戏来源，不作为跨游戏匹配条件。
- 每次执行 runtime-contract.json 记录命中、未满足条件、冲突、来源和阶段历史，证据进入 converted/evidence；检查点携带该记录。最终玩法验证追加自身证据，不把启动验证当成玩法通过。不追溯改写历史游戏版本。
- acquired-resources.cjs 在发现浏览器中保存受限静态响应；按来源帧、精确URL、长度与SHA-256验证后，供通用浏览器及静态模块采集复用。最多300文件、80MB，单资源20MB；未取得或不匹配就正常下载，不猜查询参数。
- 静态模块的 urllib/curl 传输失败同样接入浏览器网络回退，HTTP明确拒绝不切换传输冒充可取得；这补齐了 esm.sh 模块分支此前的覆盖缺口。
- 观察结果新增 document_focused、focused_tag、pointer_locked、pointer_lock_target，供实际输入诊断使用，不以焦点或指针锁定状态单独认定操作成功。
- report_capture_funnel.py 是只读统计命令，按来源站点列出当前已启动任务、产物、启动证据、交互证据、待验收及人工完成。当前状态含历史代码结果与重排队任务，不可作为新代码A/B成功率。logs/capture-funnel-20261030.json 是本次快照。

验证包括真实浏览器离线外链拒绝、Defold持续按键与存储、静态资源恢复、动态CSS、来源变化/冲突/证据不足规则矩阵和发现快照校验。规则矩阵为隔离样例，不宣称真实跨站游戏成功率已经提高；真实游戏样本仍是本次三款Remix。

本地后续独立执行器会读取这些新文件。常驻管理服务重启仍被执行策略阻止，未使用其他方式终止原进程。无自动生成任意引擎适配代码、恢复任意后端或完整通关保证。

## 契约观察库补充

2026-10-30：Remix宿主选择已受共享匹配结果控制。每个标准runs执行的入口/验证阶段追加独立观察文件，按稳定特征及规则版本归组；不同来源相同技术结构可归为同组。单游戏URL、哈希和阶段证据仍独立。失败会更新当前验证状态，不抹掉历史过程。

运行 `python tools/report_contract_families.py` 查看跨游戏样本与启动/失败证据。只有今后实际执行会产生新观察，不将历史待验收样本伪装成新匹配成功。该库积累观察，不自动生成或批准未知引擎代码；新适配规则仍需实现与正反例验证。

# 供货阻塞回流到转换流程（2026-11-03）

本次实际快照共 15 条需处理记录。历史issues与最新notice可能不一致，以当前state、notice和复验结果联合判断，不能按旧问题重试。

|游戏|当前问题|处理归属|
|---|---|---|
|Eventide Drop|EXTERNAL_DEPENDENCY|我方|
|Chubby Knight: Food and Glory|EXTERNAL_DEPENDENCY|我方|
|Don't Trust the Game|MISSING_LOCAL_RESOURCE|我方|
|Sir Rolls-A-Lot|MISSING_LOCAL_RESOURCE|我方|
|Pearlfall Mania|平台侧处理出错，我们会处理，不需要你改包；如需加急可联系平台|下游|
|Jose’s Kingdom|MISSING_LOCAL_RESOURCE|我方|
|Blocky Blast Puzzle|TOOLCHAIN_UNSUPPORTED|我方|
|Jade Idol Temple|游戏在平台浏览器里没能正常启动：[{"url": "http://127.0.0.1:8061/gameagent/extraction-preview/x20261030192851d40|我方|
|PolyRace|MISSING_LOCAL_RESOURCE|我方|
|霜原炉火|平台自动核验没能证明这个游戏能玩，需要你改包：平台自动核验没能证明这个游戏能玩：平台自动试玩没能证明走进了玩法：点了 4 步后画面几乎没变，证明不出走进了玩法（这个作品没提供可读状态，只能按|我方|
|Frost Land - Snow Survival|TOOLCHAIN_UNSUPPORTED|我方|
|跑酷小人冲冲冲|游戏在平台浏览器里没能正常启动：["Cannot read properties of undefined (reading 'addComponent')"]。在无网络、无 Cookie |我方|
|几何王国|平台自动核验没能证明这个游戏能玩，需要你改包：平台自动核验没能证明这个游戏能玩：平台自动试玩没能证明走进了玩法：点了 3 步后画面几乎没变，证明不出走进了玩法（这个作品没提供可读状态，只能按|我方|
|扫雷大挑战|游戏引擎启动时用 eval 现拼代码，平台制作预览不允许，游戏起不来，暂不能收录：["Evaluating a string as JavaScript violates the follo|我方|
|chaos-courier|平台侧处理出错，我们会处理，不需要你改包；如需加急可联系平台|下游|

## 当前流程已补齐
- 转换生成本地运行包与规格时，调用同一resource_audit生成CONVERSION_DELIVERY_CHECKS.json并写入版本report。提前暴露本地缺文件、外部CSS/字体等引用、后端依赖和缺可重放操作序列；不是等供货失败再发现。
- 该报告是静态预警，不自动改验收状态、不提交或重推。供货前仍对整理后的副本做检查，保持原始已验收产物及历史提交摘要不变。
- 当前只在local_run共享交付入口接入；内存files/changes入口尚未接入，必须如实保留边界。
- Unity等运行包先提示下游工具链兼容性；不能改扩展名假装可编辑模板。完整CSP实机兼容和ZIP实机测试归后续自动化测试阶段。

## 待处理共性
- Eventide Drop及Chubby Knight字体CSS仍有外部依赖：检查实际供货副本字体下载、CSS重写和进程是否加载新版本，不能只删字体引用。
- Don’t Trust %23n和Sir Rolls GLTFLoader示例路径可能是误报；须核对原文及真实引用，不能凭字符串一律忽略。Jose资源属于真实导入/素材缺口，需单独补齐。
- 跑酷、几何王国、扫雷历史issues与最新notice不完全一致；需取原提交最新问题修订，按实际启动、玩法步骤、CSP或归档限制处理。
- Pearlfall Mania和chaos-courier为平台侧失败，查询原提交即可，不用改包反复重推。

## 验证
- 2项隔离测试通过：缺文件和外部引用提前列出、查询参数不回显；干净包不伪称实机通过，源文件保持不变。
- 当前代码已在开发环境完成，远端部署及历史包解阻尚未全部完成。

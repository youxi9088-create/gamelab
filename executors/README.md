# 独立执行器

> 当前端到端路径与预算边界以 [转换流程](../docs/AUTO-CONVERSION.md) 和 [服务要求](../docs/SERVICE_REQUIREMENTS.md) 为准。本文早期 A/B 路径之外，已有原包转换、登记 Web 配置、内嵌 HTML/lib 适配与检查点续作。

此目录独立于管理站点和试玩服务。Python 3.11+ 标准库执行器通过公开 HTTP 接口领取任务、保持租约、上传产物并回传结果。支持多个进程，以平台原子任务领取与租约校验避免重复写入。

平台启动时已自动注册并启动内置执行器，自动处理链接提交任务；下列手工启动方式用于原有手动批次和调试。详见 [链接自动转换服务](../docs/AUTO-CONVERSION.md)。

## 安装和启动

在本目录运行 `pnpm install --frozen-lockfile --ignore-scripts` 安装锁定的 `rea-agents@6.4.0`。REA 使用包公开声明的 `scripts/rea.mjs` CLI；不注册全局 MCP、不修改个人配置，不安装无关引擎。

Windows Server 的内置 `GameLabPlatform` 计划任务应使用 `NT AUTHORITY\LOCAL SERVICE`（受限运行级别），不要以 `SYSTEM` 运行 REA。部署时运行 `tools/configure_windows_service_identity.ps1`，它会备份任务 XML 并按目录授权代码读取、运行数据写入和配置读取。必须在该任务身份下检查转换服务健康状态；管理员或 SYSTEM 进程的手工运行不能代表平台 worker。

```powershell
$env:PLATFORM_URL = 'http://127.0.0.1:8765'
$env:PLATFORM_TOOL_TOKEN = '<由运维通过管理员 POST /api/tools 注册取得的凭证>'
$env:NODE_BINARY = '<node 可执行文件绝对路径>'
python executors/worker.py --once
# 持续领取任务：去掉 --once
```

自有 fixture 的真实静态分析：

```powershell
python executors/worker.py --analyze executors/fixtures/orbit-catch
```

## 路径 A：REA 与源代码整理

管理员明确选择的 `input.source_path` 为本地提取后的 JavaScript 目录；外部采集器使用 source-bundles 上传文件，执行器下载受验证的 ZIP 并在工作目录解包。执行器真实调用 REA 并保留完整 Evidence，不执行目标的 shell 脚本。当前内置打包器支持静态 Web 游戏，入口默认为 `index.html`。图片、音频、字体和 WASM 通过 base64 协议保留；未知文件类型明确阻断，不会静默删除素材。

REA 静态分析报告不是反编译成功或玩法验证。当前适配器整理已提供的静态源文件，经过 Playwright 真实浏览器加载检查后返回协议状态 `recovered`，标注 `recovery_kind:provided_source`、有限的 runtime smoke coverage，展示文案为“源码整理可运行”，不是声称还原了原始工程。自有 fixture 另有点击得分和重开检查。复杂打包、WASM 和依赖构建需要外部能力适配器。没有本地代码包时阻断等待采集工具，不能作为反编译失败转 B 路径。

有 `.map` 与 `sourcesContent` 时，将嵌入源文件提取至独立 `recovered-src/`，保留原运行包；`sourceRoot` 和源路径只作证据，不用作磁盘路径，防止路径逃逸。报告区分 `recovered-source-map`、`provided_source`、疑似压缩长行的 `bundle-preserved`。提取源文件不代表构建关系已恢复或可维护性已验收。REA 成功但真实运行出现错误则转 B；浏览器缺失等工具环境异常仍阻断。

## 路径 B：真实 AI 接口

配置兼容 Chat Completions 的服务（base URL 应包含服务所需的 `/v1`）：

```powershell
$env:REPLICA_AI_BASE_URL = 'https://your-provider.example/v1'
$env:REPLICA_AI_MODEL = '<model>'
$env:REPLICA_AI_API_KEY = '<secret>'
```

输入 `observations` 至少描述操作、规则、计分、胜负和重开。采集器需要通过真实试玩提供观察材料；仅提供 URL 不足以启动复刻。执行器先分析为玩法规格，再生成代码。无凭证/无观察材料真实阻断，不填充假游戏。生成产物经过浏览器加载检查后待人工验收。运行失败时将错误和截图反馈给模型，在平台 `repair_rounds` 上限内修复；同时遵守 `rea_minutes`/`reconstruct_minutes` 时间预算、`REPLICA_AI_MAX_CALLS`（默认5）调用数预算、`REPLICA_AI_MAX_TOKENS`（默认12000）单次输出预算。

`REPLICA_AI_VISION=1` 时向支持视觉输入的模型发送实际截图。观察输入支持 `actions` 数组，例如 `[{"type":"click","selector":"#restart","expect_text":"得分 0","assert_selector":"#score"}]`；也支持 key 和有上限的 wait。每步保存截图，只验证显式预期，不自动宣称完整玩法正确。提供本地源包和 actions 时，先对原游戏执行这些动作获取观察材料。没有自动推断未知控件并自主通关的能力。

浏览器校验使用锁定的 `playwright@1.62.1` 默认 Chromium；不会自动检测并切换到系统 Edge。仅显式设置 `BROWSER_EXECUTABLE` 才覆盖默认浏览器。Windows 服务部署应以运行执行器的账户安装 Playwright Chromium，并让服务进程继承相同的 `PLAYWRIGHT_BROWSERS_PATH`，避免服务账户和管理员账户的浏览器缓存不一致。禁止游戏请求外部网络，临时本地服务器只提供显式产物文件，截图和报告保存在 `runs/`。这不是容器级隔离，生产 worker 仍必须部署在专用隔离环境。

## 接口

- `POST /api/v1/jobs/claim`：`capabilities`, `worker_id`。
- `POST /api/v1/source-bundles`：采集工具提交 `candidate_id`, `files`, `entry`。
- `GET /api/v1/source-bundles/{id}/download`：执行工具下载 ZIP；校验路径、文件数、解压大小、符号链接。
- `POST /api/v1/jobs/{id}/heartbeat`：`lease_token`, `progress`, `message`。
- `POST /api/v1/jobs/{id}/events`：租约及唯一 `event_id`。
- `POST /api/v1/artifacts`：`job_id`, `lease_token`, 文本 `files`, `entry`, `report`。
- `POST /api/v1/jobs/{id}/complete`：租约、唯一事件 ID、结果、原因、报告和可选产物 ID。

所有调用使用 Bearer 工具凭证。工具凭证不写入日志。模型配置优先读取平台 `data/services.json`，未保存配置时兼容上述环境变量；密钥不提交到 Git。独立部署时用 `REPLICA_SERVICE_CONFIG` 指定配置文件，详见 [服务配置](../docs/SERVICES.md)。源路径必须是管理员可信选择，不能直接信任任意外部采集器提供的服务器路径。生产 worker 应运行在独立低权限环境。

## 验证与研究边界

`python -m unittest discover -s executors -p test_worker.py` 验证路径约束、素材不丢失、两类阻断和结果诚实性。REA 6.4.0 已真实分析自有 Orbit Catch fixture，完整证据在本机 `runs/`，该目录不入 Git。此验证不代表任意第三方游戏恢复能力。

`python -m unittest discover -s executors -p test_ai_integration.py` 使用明确标记的本地假模型 HTTP 服务，验证生成失败、浏览器发现错误、带截图修复、二次验证和产物提交。该测试使用3次 HTTP 模型调用、1轮修复，不代表真实 AI 模型生成质量。

`python executors/integration_selftest.py` 仅将自有 fixture 通过运行中的本地平台真实分析、测试、入库和发布；重复生成新版本需显式 `--new-version`。fixture 实际检查启动、点击得分、10分获胜和重开，使用已知源码坐标作为白盒测试。真实截图随产物上传，原始证据留在工作目录。

参考来源（2026-10-13 核查）：
- https://github.com/morluto/rea — 已安装和执行的分析工具。
- https://github.com/PlayableIntelligence/game-creator — 2D/3D 游戏工程与 QA 流程参考，未声称安装或实测该插件。
- https://github.com/leigest519/OpenGame — 生成和迭代架构参考，未声称接入该项目。

真实模型的可用性取决于部署账户的 Codex 登录或 API 配置。仓库隔离回归使用本地假模型，只验证协议与修复流程，不代表真实模型质量。源码整理和生成产物均须经过人工验收，不自动公开上架。

独立采集器示例（只提交明确提供的本地资源包，URL 作为来源记录，不自动抓取）：

交付报告应包含 `game_profile` 对象，所有字段为文字：`category`、`dimension`（2D/3D/2.5D/混合）、`perspective`、`core_gameplay`、`core_experience`、`controls`、`game_loop`、`content`（实际数量）、`progression`、`save`。只描述交付游戏的事实，不写复刻过程；未知字段留空。共享入库服务生成文字说明书和 JSON 档案；空字段会使索引标为 incomplete，不能声称档案完成。下游 AI 从 `catalog/index.json` 查找游戏，再按 specification 路径读取全文。

```powershell
python executors/collector.py --url https://example.com/owned-game --title "自有样例" --directory executors/fixtures/orbit-catch --rights owned
```


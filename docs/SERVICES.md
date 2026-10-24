# 平台服务清单

更新：2026-10-22。工具页面展示转换、AI、下游供货；采集、REA 和浏览器验证属于执行链内部组件。

| 服务 | 入口 / 生命周期 | 实现与配置 |
|---|---|---|
| 管理控制平面 | `server.py`，8765 | SQLite、任务/批次/租约、版本、账本、本机会话 |
| 独立试玩 | `server.py`，8766 | 与管理不同源；不可变产物、独立游戏 Git 仓库 |
| 小游戏转 Web 浏览器游戏服务 | Executor 随平台启动监督 worker | 配置键 `wechat` 保留兼容；内置执行器或外部模式 |
| Cocos 原包 API | 默认 8770，按配置启动 | `services/wechat-web-service/`，异步 ZIP 转换，现有 3.5.1/define 适配 |
| 资源采集与 REA | worker 按任务调用 | REA 6.4.0，证据按轮保存；Windows 平台任务以 `NT AUTHORITY\LOCAL SERVICE` 运行 |
| 浏览器验证 | 执行器子进程 | Playwright + Edge/Chromium，启动/交互/规格/对照各有验证范围 |
| AI | `controlplane/ai_provider.py` | Codex、API、API 优先/Codex 备用；真实调用与 usage |
| 每日采集分析 | DiscoveryScheduler | 默认北京时间 09:00，每30秒检查、同日去重、生成建议 |
| 下游模板供货 | SupplyWorker | 验收后独立检查、打包、HMAC 提交、状态与问题回传 |

## 配置

AI 连接的填写示例、本地桥接启动及排错步骤见 [AI 服务配置指南](AI_CONFIGURATION.md)。工具页分别保存本地 Codex、云服务器 Codex CLI、官方 API 和兼容 API 的参数，旧服务器 Codex/自动备用仅作历史配置兼容。

- 转换/AI：工具页保存 `data/services.json`；独立 worker 使用 `REPLICA_SERVICE_CONFIG`。读取接口脱敏，密钥不入 Git。
- AI API 支持 Chat Completions 与 OpenAI Responses API；工具页配置接口协议、模型、API Key 和可选 actor 授权头。Responses 调用关闭服务端存储，并记录供应方返回的输入/输出用量。Codex CLI 模型目录 JSON 是 Codex 客户端配置，平台服务直接按所选模型 slug 调用 API，不读取该目录文件。
- AI 兼容环境：`REPLICA_AI_BASE_URL`、`REPLICA_AI_MODEL`、`REPLICA_AI_API_KEY`；Codex 使用运行账户已有登录，不复制登录令牌。
- `wxapkg_v1` + `http://127.0.0.1:8770` 启用本地原包服务监督。`REPLICA_PACKAGE_SERVICE_DIR` 可指定目录；否则兼容旧相邻 `wechat-web-service/`，干净克隆使用仓库内服务。不会复制或覆盖旧密钥/任务数据。
- 原包服务首次启动生成其私有 `data/local-api-key.txt`，管理员填入平台转换配置；新克隆不携带本机密钥。其余配置见 [原包服务 README](../services/wechat-web-service/README.md)。
- 供货：工具页或 `tools/configure_supply.ps1`，保存 `data/supply-config.json`，环境变量优先；详见 [供货集成](SUPPLY_INTEGRATION.md)。
- 每日计划与来源规则在平台页面设置。自动选择、自动派单需显式开启；当前保持关闭。后台必须运行，仅补扫当日计划，不追扫全部历史日期。

## 检测与边界

`GET /api/services` 返回脱敏状态；`POST /api/services/{wechat|ai}/save` 与 `/test` 需要管理员 CSRF。空密钥保留旧值，clear_key 显式清除。健康结果5分钟有效，刷新页面只读结果。

Windows Server 部署使用 `tools/configure_windows_service_identity.ps1` 将 `GameLabPlatform` 计划任务设为 LOCAL SERVICE，并按目录授予代码只读、运行数据写入权限。REA 原生控制自检依赖实际进程身份；不要把服务任务设为 SYSTEM，也不要仅用管理员会话测试后判定转换服务健康。

AI 检测以及平台启动的 AI 探测可能调用模型并产生用量。内置转换检测 worker、Node、REA 安装、REA 自有样例分析和浏览器；外部转换检测其自身接口。在线只表示检查通过，不代表任意游戏可转换或供货已发布。

源码与隔离检查统一交付；数据库、密钥、游戏原包、缓存、运行产物单独备份。供货协议有模拟测试，真实下游配置暂空，仍需真实联调。每日分析是来源页面与品类分析，不等于完整试玩或自动验收。

[平台两类服务建设说明](平台两类服务建设说明.md) 为历史背景，当前实现以本文为准。

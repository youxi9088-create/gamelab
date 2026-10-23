# Game Lab · Web 小游戏转换平台

Web 转换与管理平台：游戏发现、资源采集与 REA 分析、现有引擎适配、AI 续作、浏览器验证、人工验收、版本库与下游模板供货。生产部署、数据和开发环境的关系见云端交付手册。

九款已入库游戏随仓库保存在 [bundled-games](bundled-games/README.md)。首次启动前执行 `python tools/game_snapshot.py restore` 可恢复到空数据目录。

## 文档入口

| 内容 | 文档 |
|---|---|
| 跨项目能力标准、阶段退出条件与交付要求 | [转换服务规范](docs/CONVERSION_SERVICE_STANDARD.md) |
| 各引擎／宿主的适用条件、流程与经验 | [引擎适配流程手册](docs/ENGINE_PLAYBOOKS.md) |
| 接入步骤、现有协议及待补齐的项目 API | [项目接入指南](docs/PROJECT_INTEGRATION.md) |
| 云端数据、账号、Git 发布与回退、备份恢复 | [云端交付手册](docs/CLOUD_DELIVERY.md) |
| 系统组成、数据流、任务调度、部署与边界 | [平台架构说明书](docs/ARCHITECTURE.md) |
| 全流程、支持路径、自动推进与限制 | [转换流程](docs/AUTO-CONVERSION.md) |
| 服务职责、端口、配置与健康检查 | [服务清单](docs/SERVICES.md) |
| 安装、隔离检查、备份与迁移 | [运维手册](docs/OPERATIONS.md) |
| 本轮整理与验证结果 | [交付检查](docs/RELEASE_CHECK.md) |
| 已确认需求与维护约定 | [服务要求](docs/SERVICE_REQUIREMENTS.md) · [AGENTS](AGENTS.md) |
| API / 持续任务 / 供货协议 | [API](docs/API.md) · [多轮任务](docs/MULTI_ROUND_TASKS.md) · [供货集成](docs/SUPPLY_INTEGRATION.md) |

## 启动

需要 Python 3.11+、Git。管理后端使用标准库，前端不需要构建；转换执行另需 Node、REA、Playwright、Edge/Chromium，以及可用 AI 配置。

```powershell
./setup-executors.ps1
./start.ps1
```

也可安装执行器锁定依赖后运行 `python server.py`。开发环境管理站点为 http://127.0.0.1:8765 ，独立试玩端口 8766，可选 Cocos 原包服务 8770。默认本机绑定。首次初始化管理员时同时设置 `PORTAL_ADMIN_USERNAME` 和 `PORTAL_ADMIN_PASSWORD`；已有账号后由账号管理维护。支持项目内共享数据和角色权限，云端通过 HTTPS 反向代理提供访问；尚无跨项目租户隔离。详见 [API 文档](docs/API.md#门户管理员登录)。

## 使用

1. 在工具页配置并检测转换、AI 服务；每日来源扫描在采集建议页管理。
2. 提交游戏地址，或审核采集建议后派单；经采集和来源识别，进入已有适配路径。
3. 任务中心查看进度、证据与阻断，恢复任务或提交续作要求。基础交付未完整时继续推进，不把可运行草稿冒充完成。
4. 人工功能验收通过后进入小游戏库，保留旧版本与源码提交。
5. 下游供货独立检查配置、可分发声明、静态包与 HTTPS 下载条件。真实下游配置暂空，不宣称已完成真实供货。

已有 Cocos 2 Web、声明 SWF 的 Ruffle、Defold HTML5/WASM、Remix Three 等明确运行契约，以及 Cocos 3.5.1/define 原包、内嵌 HTML/lib、静态源码和有材料的 AI 续作。另有通用浏览器探测路径。每种路径的材料、宿主及交付限制见 [适配手册](docs/ENGINE_PLAYBOOKS.md)；不能由引擎名称推定任意游戏均可转换。

## 仓库结构

| 目录 | 用途 |
|---|---|
| `web/` | 中文管理界面与演示数据 |
| `controlplane/` | 共享任务服务、版本、资源/供货、账本与调度 |
| `executors/` | 采集、REA、适配、续作和运行验证 |
| `services/wechat-web-service/` | 可独立部署的原包转换 API、适配模板与测试 |
| `tests/`、`tools/` | 隔离回归及维护工具；真实游戏专项脚本不属于默认验收流程 |
| `docs/` | 当前服务文档、历史说明和供货协议副本 |
| `data/`、`game-library/` | 本机运行数据与独立游戏仓库，均不进入本仓库 |

## 检查

```sh
python tools/check_release.py
```

使用临时数据库与自有 fixture，分别运行平台、执行器和原包服务回归；需先装齐执行器依赖。报告写入忽略的 `qa-output/`。不为测试重跑或验收真实游戏，不执行真实模型或下游提交。平台源码、运行数据和独立游戏仓库分别迁移。

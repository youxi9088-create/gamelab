# Game Lab · Web 小游戏转换平台

本地管理平台：游戏发现、资源采集与 REA 分析、现有引擎适配、AI 续作、浏览器验证、人工验收、版本库与下游模板供货。

## 文档入口

| 内容 | 文档 |
|---|---|
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

也可安装执行器锁定依赖后运行 `python server.py`。管理站点为 http://127.0.0.1:8765 ，独立试玩端口 8766，可选 Cocos 原包服务 8770。默认本机绑定，这是本机工作台会话模式，不能直接当公网多租户认证系统。

## 使用

1. 在工具页配置并检测转换、AI 服务；每日来源扫描在采集建议页管理。
2. 提交游戏地址，或审核采集建议后派单；经采集和来源识别，进入已有适配路径。
3. 任务中心查看进度、证据与阻断，恢复任务或提交续作要求。基础交付未完整时继续推进，不把可运行草稿冒充完成。
4. 人工功能验收通过后进入小游戏库，保留旧版本与源码提交。
5. 下游供货独立检查配置、可分发声明、静态包与 HTTPS 下载条件。真实下游配置暂空，不宣称已完成真实供货。

已支持登记的 Cocos 2 Web 配置、Cocos 3.5.1/define 原包、内嵌 HTML/lib、静态源码与有材料的显式 AI 重建/续作。不是任意 HTML 游戏都能 1:1 复刻；在线服务器、未知引擎与全部玩法仍有明确边界。

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

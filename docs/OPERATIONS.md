# 安装、运行与迁移

## 干净环境安装

1. 安装 Python 3.11+、Git、Node 20+ 和 pnpm。管理后端无 pip 依赖，前端静态加载。
2. Windows 执行 `./setup-executors.ps1`；其他平台执行 `pnpm --dir executors install --frozen-lockfile --ignore-scripts`。
3. Windows 可使用现有 Edge；其他环境在 executors 目录运行 `pnpm exec playwright install chromium`，系统依赖由部署人员安装。`BROWSER_EXECUTABLE` 可指定路径。部分管理 UI 回归显式使用 Edge，运行完整回归建议 Windows + Edge。
4. `NODE_BINARY` 指定平台执行器 Node，原包服务使用 `NODE_BIN`；未显式指定时平台优先 PATH，再检查本机附带运行时。
5. 运行 `python server.py` 或 `./start.ps1`。默认管理 8765、试玩 8766，数据目录 data，游戏仓库 game-library。
6. 工具页配置 AI；Codex 模式需服务运行账户已有登录，API 模式填写实际模型和凭据。配置供货前可先使用平台转换和人工验收。

`--port`、`--play-port`、`--data-dir`、`--repo-dir`、`--service all|admin|play` 可分开部署。`--no-executor` 与 `--no-discovery` 用于隔离环境，不代表停掉供货线程；测试必须使用临时 data/repo 目录。

## 原包服务部署

源码在 `services/wechat-web-service/`。独立运行 `python services/wechat-web-service/server.py` 后，私有数据目录会生成本地 key。平台工具页选择 wxapkg_v1 模式，地址默认 http://127.0.0.1:8770 ，填写该 key。

只有配置模式与默认本地地址匹配时，平台才监督启动原包服务。原有相邻目录优先，保持已有密钥与任务路径；需要迁移到仓库内版本时，停服备份旧服务 data 后指定 `REPLICA_PACKAGE_SERVICE_DIR`，按原包服务 README 配置 `CONVERTER_DATA`，并核对平台 key。不会自动复制密钥或上传旧 data。

原包服务单 worker/任务额度和 ZIP 限制见其 README。第三方 Acorn 许可证随 vendor 保留；游戏资源包、用户存档不随服务源码分发。

## 检查

`python tools/check_release.py` 依次运行临时数据库的平台回归、执行器单测、本地假模型契约测试、独立原包 API 单测。日志与结果位于 qa-output，需依赖安装完毕；不是上线后真实游戏重跑。

额外隔离协议检查：`python tools/check_package_service_isolated.py`，使用自己生成的合成原包。真实模型质量、特定游戏全流程、Docker 部署及真实下游网络不由上述测试代替。

不要为了测试运行 `executors/integration_selftest.py` 或 `tools/check_live_continuation.py` 对现有平台入库、验收或重跑；这些是人工维护工具，不属于默认回归入口。专项游戏脚本也不自动执行。

## 备份与恢复

停写后分别备份：平台 data（数据库、配置、任务材料）、game-library（完整独立 Git 历史与产物）、原包服务私有 data，以及供货分发目录。密钥与备份使用受控存储，不通过本源码仓库迁移。

新主机恢复相同数据，核对 Python/Node/浏览器、源资源目录、试玩地址、原包 key 与供货下载地址后启动。单独 git clone 只得到代码和示例，不包含原机器的九款游戏、微信缓存或私人配置。

## 故障定位

| 现象 | 检查 |
|---|---|
| 自动任务没有运行 | 工具服务依赖检查、data/executor.log、批次暂停/停止、租约与具体阻断 |
| 原包服务无法就绪 | 转换模式、8770 监听、NODE_BIN、data/package-converter.log、key 是否匹配 |
| 资源采集缺失 | 每轮索引、下载拒绝/容量记录、AppID 匹配、来源页面访问报告 |
| 续作停止 | 当前轮原因、问题输入、检查点基线、三段额度/无进展上限 |
| 用量未知 | 提供方是否返回 usage、JSONL 终态、待补传账本；不要估算伪补 |
| 已验收但供货受阻 | 独立供货记录、配置/指纹、可分发声明、静态包和 HTTPS 白名单 |
| 每日没有建议 | 计划启用/小时、来源启用、当日扫描及去重记录、后台是否持续运行 |

外网部署需反向代理、TLS、身份网关、独立试玩域名和隔离 worker。本机进程与浏览器限制不是完整容器隔离。

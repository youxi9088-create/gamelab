# 独立抓取与转换任务后台

更新：2026-10-27

## 定位

`services/task_backend/` 是可单独启动的任务后台，将来源采集、转换队列、worker 监督、AI/原包服务配置和后台账号从 Game Lab 门户进程中拆出。任务状态转换仍复用 `controlplane`，不会在另一套接口里复制转换规则。

新后台与原门户是两套独立数据，不会隐式读取或改写原 `data/platform.sqlite3`。本次不自动迁移现有任务、账号、AI 密钥、游戏版本或历史产物，也不重跑真实游戏。

## 启动

```powershell
./services/task_backend/start.ps1
# 默认 http://127.0.0.1:8780
```

也可运行：

```powershell
python services/task_backend/app.py --port 8780
```

开发预览入口支持 npm 参数转发：

```sh
cd services/task_backend
npm run dev -- --port 7100
```

首次打开页面时创建首位管理员。账号名为 3–80 位字母、数字或 `. _ @ -`，密码为 12–256 位。没有开放注册，也没有默认密码。

自动化部署可在首次启动前设置 `TASK_BACKEND_ADMIN_USERNAME` 与 `TASK_BACKEND_ADMIN_PASSWORD`。两项必须同时设置；已有账号后，环境变量不会重置密码。不要在命令行、Git 或页面中保存密码。

## 独立数据与配置

默认目录：

| 内容 | 位置 |
|---|---|
| 任务、批次、账号、会话、事件、用量 | `data/task-backend/platform.sqlite3` |
| 不可变运行产物 | `data/task-backend/artifacts/` |
| 执行工作文件、检查点与观察证据 | `data/task-backend/runs/` |
| 独立游戏代码版本库 | `data/task-backend/game-library/` |
| AI 与原包转换私密配置 | `data/task-backend/services.json` |
| worker 凭证与日志 | `data/task-backend/executor-token.txt`、`executor.log` |

可用 `--data-dir` 与 `--repo-dir` 显式更改。不要让新旧后台同时以可写方式使用同一数据库；SQLite WAL 不等于两个独立调度器的全局互斥。

原门户账号和 AI 配置仍留在原目录。新后台需分别初始化账号和配置，密钥不从网页、旧服务或 Git 自动复制。

## 账号与权限

- **管理员**：账号、采集调度、服务配置、维护暂停及全部任务操作。
- **操作员**：提交任务、回复/重试任务、控制批次、审核和派发采集建议；不能管理账号、调度或服务凭据。
- **只读用户**：查看任务、采集建议、服务脱敏状态和下载产物，不能修改。

密码使用 PBKDF2-HMAC-SHA256 加盐哈希。会话保存于新后台数据库，有效期 12 小时，使用独立 `task_backend_session` Cookie、HttpOnly 和 SameSite=Strict。禁用账号、修改角色或密码后，旧会话因 revision 变化失效。写操作要求 CSRF 和同源 Origin；登录失败按来源地址和账号限流。

采集建议的人工决定记录实际账号名；自动规则仍记录 `selection-policy`，无请求上下文的历史/脚本调用保留 `local-admin` 兼容值。

## 功能范围

新后台包含：

- 每日采集调度、立即扫描、建议审核与派单；
- 单链接转换、统一单任务队列、批次暂停/恢复/停止/异常重试；
- worker 注册、租约领取、心跳、事件、产物与结果协议；
- 任务详情、过程记录、补充要求和版本 ZIP 下载；
- AI 五种连接配置与原包转换服务配置，密钥脱敏；
- 登录、账号角色、会话撤销、审计与维护暂停；
- 登录保护的本地试玩路由。

新后台**不包含**游戏库门户、人工验收、发布和下游模板供货。这些仍属于 Game Lab 门户职责。技术转换进入待验收，不代表已人工验收或发布。

## 与原平台拆分运行

原 `8765` 平台默认行为没有改变。正式把新任务切到独立后台时，原平台应只保留门户与试玩：

```powershell
python server.py --port 8765 --play-port 8766 --no-executor --no-discovery
```

然后单独启动 `8780` 后台。不要让原平台和新后台同时执行采集/转换，避免重复消耗网络、AI 和浏览器资源。原包 API 默认仍为 `8770`，由持有内置转换 worker 的一侧监督。

当前未提供一键生产迁移或双写同步。现有任务继续在原平台处理；新任务在新后台创建。若后续需要迁移历史数据，应先暂停两侧写入，制定数据库、产物、Git 仓库和账号的离线迁移与回退方案，不能直接复制正在写入的 SQLite 文件。

## 健康与检查

- `GET /health`：仅返回独立后台进程健康，不代表 AI、浏览器或真实游戏转换成功。
- `GET /api/services`：登录后返回脱敏配置和已有检测结果。
- “实际调用检测”会访问已配置服务，AI 检测可能产生用量；页面轮询不会自动发起付费检测。

隔离检查：

```sh
python -m unittest tests.test_task_backend
```

测试使用临时数据库与临时游戏仓库，禁用采集调度和转换 worker，不访问真实游戏，不执行真实 AI 调用，不自动验收或发布。

默认只绑定回环地址。公网部署仍需另行配置 HTTPS 反向代理、公开 Origin、服务账号权限、备份与监控；登录页面本身不等于公网安全部署完成。

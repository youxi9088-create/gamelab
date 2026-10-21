# 游戏复刻中心接入接口

## 本机大型运行包入库

管理员可运行 `python tools/import_local_review.py --candidate <候选ID> --preview http://localhost:8787/ --report <验收报告JSON路径>`。命令读取候选已登记的可信 `source_path`，以流式快照接收最多 500 文件、256 MiB 的运行包，过滤隐藏文件和依赖目录，拒绝符号链接。此本机命令不改变外部工具的 20 MiB 上传限制。

结果为独立 Git 版本、可下载 ZIP 和待验收记录，路径标记为“本地运行包”，不声称恢复源码，不改变授权字段，也不自动批准或发布。Unity 等运行包使用独立回环端口试玩；中心预览页显示打开独立窗口的链接，原隔离 iframe 策略保持不变。启动该版本目录中的启动器即可运行对应快照。

本地管理入口默认 `http://127.0.0.1:8765`，独立试玩入口默认 `http://127.0.0.1:8766`。当前仅绑定本机，不是公网多租户服务。请求体为 JSON 对象，单次 HTTP 请求不超过 30 MiB。时间保存为 UTC，看板按 Asia/Shanghai 统计。

## 工具认证

管理员在工具接入页面创建工具，能力为 `collect`、`rea`、`reconstruct` 的组合。返回的令牌仅显示一次；调用时发送 `Authorization: Bearer <token>`。数据库保存令牌哈希。工具不能调用管理接口，停用后无法认证。

POST 支持 `Idempotency-Key` 请求头；也可在 JSON 中提供 `event_id`。作用域是工具与接口路径，同键同内容返回原结果，同键不同内容返回 409。不要对连续领取任务永久使用同一个幂等键。

## 外部工具接口

| 方法与路径 | 输入与结果 |
|---|---|
| POST `/api/v1/heartbeat` | `{}`；更新工具最近在线时间 |
| POST `/api/v1/candidates` | `title,url` 必填；可附 `source,category,engine,description,cover,screenshots,observations,rights`；返回 `candidate,deduplicated`。需 collect 能力 |
| POST `/api/v1/source-bundles` | `candidate_id,files,entry`；返回 `bundle_id,sha256,size,files,entry`。需 collect；游戏正在执行时不允许替换输入包 |
| GET `/api/v1/source-bundles/{id}/download` | Bearer 认证，返回 ZIP；仅持有对应游戏有效运行租约的工具可下载 |
| POST `/api/v1/jobs/claim` | `capabilities`、可选 `worker_id`；返回 `job` 或 null。job 含 input、settings、lease_token 与 lease_expires_at |
| POST `/api/v1/jobs/{id}/heartbeat` | `lease_token,progress`；延长租约 |
| POST `/api/v1/jobs/{id}/events` | `lease_token,message,progress`，可选 `stage,event_id`；保存日志并延长租约 |
| POST `/api/v1/artifacts` | `job_id,lease_token,files,entry,report`；返回 artifact_id 等信息 |
| POST `/api/v1/jobs/{id}/complete` | `lease_token,outcome,reason,report`；形成版本时还需 artifact_id |

`rights` 为 `unknown/owned/licensed/open`，由审核人员核实；字段值不是法律授权证明。外部工具不能提供本机 `source_path`。

`files` 是相对路径到 UTF-8 文本或 `{ "encoding":"base64", "content":"..." }` 的映射。最多 500 文件、解码后总计 20 MiB；entry 必须是其中存在的 HTML 文件。拒绝绝对路径、遍历路径、隐藏目录、Windows 保留名和 node_modules。较大工程需后续扩展对象存储上传协议。

领取到的 source_bundle_url 是平台相对 URL。不要把来源站 URL 当作文件包 URL，也不要向外部来源发送平台令牌。

## 阶段与结果

初始阶段为 `rea`。当前内置执行器的 `recovered` 表示已提供源码经 REA 分析、整理并完成加载检查；不证明恢复原始工程，也不等于玩法验收通过。

| outcome | 允许阶段 | 平台行为 |
|---|---|---|
| recovered | rea | 校验当前租约产物，写入 Git，生成 A 路径待验收版本 |
| fallback | rea | 转 reconstruct 阶段，清除旧租约，重新排队为 B 路径 |
| ready_review | reconstruct | 校验产物，写入 Git，生成 B 路径待验收版本 |
| blocked / failed | 任一运行阶段 | 保留原因和报告，停止该次处理，等待人工操作 |

REA 服务未配置、输入包未获取、临时执行失败应明确阻断或失败，不能伪报已尝试反编译失败。租约只对领取工具有效；过期租约不能上传或完成。超时回收在下一次 claim 时执行，并非后台定时扫描。批次暂停只停止新领取，运行中租约仍可完成。

## 管理接口

GET `/api/session` 建立本机管理 Cookie 并返回 csrf；所有管理 POST 附 `X-CSRF-Token`。这不是企业账号登录。GET `/api/state` 返回真实数据，GET `/api/demo` 返回独立演示数据，GET `/api/docs` 返回本文。

| 路径（POST） | 操作 |
|---|---|
| `/api/candidates` | 手动创建候选，字段同外部提交；可选管理员可信本地 source_path |
| `/api/candidates/{id}/update` | 更新 source_path、observations、rights、description、category |
| `/api/batches` | name、candidate_ids；每批 1–100 款 |
| `/api/batches/{id}/start`、`pause`、`resume` | 批次启动、暂停调度、恢复 |
| `/api/jobs/{id}/retry` | 失败或阻断任务重新排队，历史事件保留 |
| `/api/versions/{id}/approve` | checks 的 gameplay、visual 均须为 true；记录功能验收，不修改资源使用范围 |
| `/api/versions/{id}/reject` | reason 必填，退回任务等待修复 |
| `/api/versions/{id}/publish`、`unpublish` | 发布或下架；发布历史 approved 版本即回滚 |
| `/api/tools`、`/api/tools/{id}/toggle` | name、capabilities 创建工具；启停工具 |
| `/api/sources`、`/api/sources/{id}/toggle` | name、url 创建来源；启停来源记录 |
| `/api/settings` | 更新 concurrency、lease_seconds、max_attempts、rea_minutes、reconstruct_minutes、repair_rounds |

GET `/api/versions/{id}/download` 用管理会话下载对应源码版本 ZIP。试玩 GET `/play/{artifact_id}/{entry}` 在独立端口提供只读静态文件，不提供管理接口，不需要 worker 在线。当前内部预览地址不是权限隔离的私密链接；需要对外部署时增加预览鉴权及正式发布路由。

POST `/api/jobs/{id}/reconstruct` 为管理员明确选择玩法重建，需 `reason`（至少10字）及候选已有 `observations`。只允许 queued/blocked/failed 的 REA 任务，拒绝运行中任务。记录 `rea_attempted:false`，不会把没有原包伪报为反编译失败；后续由独立 reconstruct 工具提交产物。

错误响应为 `{"error":"原因"}`。常见状态：400 参数不符、401 缺少认证、403 权限不符、404 记录不存在、409 状态/租约/幂等冲突、413 请求过大、415 内容类型错误。


## 链接自动转换

管理员 `POST /api/conversions` 仅需 `{url}`，自动创建并排队，重复活动链接返回已有任务。内置执行器随平台启动，原有外部工具和手动批次接口保留。完整协议见 [AUTO-CONVERSION.md](AUTO-CONVERSION.md)。

## 依赖分析

`POST /api/candidates/{id}/dependencies`：提交 `{revision,dependencies:{scope,items}}`。items 包含 id、name、kind、status、reason、evidence、next_action。kind 为 code/resources/data/backend/platform。status 为 unknown/available/missing/rebuild/verified/not_applicable。初次 revision=0；版本冲突返回 409。管理端不能在任务执行中更新。工具端使用 `/api/v1/`，另传 job_id、lease_token，必须是该游戏当前运行租约。

`POST /api/jobs/{id}/dependency-plan`：管理员传 `{reason}`，将 waiting_input/blocked/failed 的原任务记录为依赖待处理，清除旧问题。不会重新排队，不代表自动适配已启动。

`executors/dependency_inventory.py <root> --output <file>`：对保留的 unpacked/manifest.json、resource-manifest.json 与 modules 进行本地核对，生成保守依赖清单，不执行目标代码或调用远端接口。

POST /api/jobs/{id}/work-log：管理端提交 message（10–4000 字符），追加助手处理记录及事件；不改变任务、批次、版本或验收状态。

# 多链接批次与时间线

`POST /api/conversions` 兼容单链接 `{url}`，新增 `{name?, urls: string[]}`，最多 100 条。返回 `{batch, jobs, reused, submitted, unique}`。多链接提交立即排队，重复任务保持原归属；全部重复时 batch 为 null。非法链接或与失败历史冲突时整批回滚。

`GET /api/state` 的每个 job 增加 `pipeline={current,nodes,note}`，仅作只读投影。
执行器 `POST /api/v1/jobs/{id}/events` 可附 `node` 和 `node_status`：
节点为 identify/acquire/analysis/adapt/test/delivery/review/publish，状态为 running/succeeded/failed/waiting_input/skipped/cancelled。必须持有效租约；原 message/stage 事件兼容。时间线中的历史无证据节点保留等待或有记录，不伪造已完成。

# 每日采集建议

- `GET /api/state` 增加 `recommendations`、`discovery_runs`、`discovery_settings`，兼容原轮询。
- `POST /api/discovery/settings`：`enabled`、北京时间 `hour`（0–23）、`max_pages`（1–10）、`max_games`（1–50）、`aliases`（品类别名映射）。
- `POST /api/discovery/rules`：`{source_id,rule:{entry_urls,game_paths}}`；入口限定当前来源域名及子域。
- `POST /api/discovery/scan`：排队只读扫描，运行或排队中复用原扫描。后台每 30 秒检查，不在请求事务里访问网络。
- `POST /api/discovery/approve` / `reject`：`{ids,reason?}`，最多 100 条，整批事务。通过仅进入 pending_capture；拒绝永久抑制同 URL 推荐。
- `POST /api/discovery/dispatch`：`{ids,name?}`，只能派发 pending_capture，使用共享多链接转换接口；记录任务关联。
- 每日定时器随管理员服务启动。`server.py --no-discovery` 可禁用；隔离测试的 `build_server` 不启动调度器。重启恢复、扫描失败、来源缺少适配都保留记录。

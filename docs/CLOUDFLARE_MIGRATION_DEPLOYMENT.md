# Game Lab 云迁移部署文档

面向对象：需要在新环境复现或继续推进本次迁移的人。
状态：**数据迁移已完成并核验通过**（D1 与 R2 双向对账一致），等待公网浏览器验收（2026-10-27）。

---

## 1. 目标与边界

| 项 | 内容 |
| --- | --- |
| 目标 | 把 Game Lab 从 `47.110.232.68`（Windows 云服务器）整站迁到 Cloudflare，最终停用原服务器 |
| 存储 | 文件对象放 Cloudflare R2，结构化数据放 D1 |
| 入口 | Cloudflare Workers + Static Assets |
| 硬性边界 | **不得**停服、删除源数据或改动原站；**不得**改成匿名公开访问（必须保留账号登录） |
| 发布边界 | 迁移只做到「验收通过」，不对外发布 |

原服务器与源数据在整个过程中保持只读引用，未被修改。

---

## 2. 架构

```
浏览器
  │
  ▼
Workers（gamelab-migration）        cloudflare/worker.mjs
  ├── Static Assets（../web）       真实平台前端（41 个文件）
  ├── D1（gamelab-migration）       records / artifact_files / credentials / auth_failures
  ├── R2（gamelab-migration-private）  artifacts/<artifact_id>/<path>
  └── Secret: MIGRATION_UPLOAD_TOKEN
```

- `worker.mjs`：路由与鉴权入口，负责登录、私有播放、上传、状态。
- `auth.mjs`：PBKDF2 密码校验、会话 Cookie、失败限流。
- `playback.mjs`：从 R2 读取已登记文件并按清单校验后回放。
- `portal.mjs`：**云端只读门户**，把 D1 记录组装成前端 `web/` 期望的 state；并发取数、
  裁剪 `report`、补引擎标签、算用量与游戏明细看板（见 §7.5 / §7.6）。
- `schema.sql`：D1 表结构（`records` 为主表，KV 形式：`kind / id / data`）。

当前形态为**变体 B**：平台与转换任务留本地，云端只做对外只读门面 + 已通过审核产物试玩。
`/api/state` 里标注 `migration.read_only = true`，供货配置、AI 服务、转换接口均如实标注由本地提供，不伪造状态。

---

## 3. 云端资源清单（已创建）

| 资源 | 标识 |
| --- | --- |
| Cloudflare 账户 | Youxi9088，ID `eb36b4758b88c5b65dff5bebb0181c31` |
| Worker | `gamelab-migration` → `https://gamelab-migration.youxi9088.workers.dev` |
| 当前版本 | `8793e3fa-836b-446c-b198-17f088561973` |
| D1 数据库 | `gamelab-migration`，ID `1610b3f0-7a28-4270-b30b-fab183f92dbd`，区域 **WNAM** |
| R2 桶 | `gamelab-migration-private` |
| Worker Secret | `MIGRATION_UPLOAD_TOKEN` |

> 账户里另有一个既有桶 `gmaedate`，本次未做任何操作。

---

## 4. 迁移数据来源

| 项 | 值 |
| --- | --- |
| 主机 | `Administrator@47.110.232.68` |
| SSH 密钥 | `~/.ssh/gamelab-cloud-deploy-20261022`（另一个 `gamelab-deploy-ed25519` 会被拒） |
| 生产库 | `C:\GameLab\shared\data\platform.sqlite3` |
| 产物根 | `C:\GameLab\shared\data\artifacts` |
| 规模 | 69 个产物 / **17,408** 个登记文件 / **2,026,487,163** 字节（2.03 GB） |
| 记录 | 清洗后 **4,277** 条（源库 4,328 条） |
| 账号 | 2 个（见 §6） |

> **不要用本地 `door/data` 当数据源**，那里只有 35 个产物、4.4 MB，是开发库。

### 取数注意

- 在 Git Bash 里通过 `ssh` 执行远端 `cmd` 会被 MSYS 把 `C:\x` 转成 `C:/x`，导致「无效开关」。**列目录与取文件一律用 `sftp`**（原生正斜杠）。
- 不要在 bash 里调远程 PowerShell，会被安全策略拦截。
- 远端输出是 GBK，需按 `errors='replace'` 解码。

---

## 5. 迁移流程

三个工具串联，全部只读源站、不触碰原服务器运行态。

### 5.1 清洗导出

```bash
python tools/cloudflare_transfer.py prepare \
  --database migration-private/platform.migration.sqlite3 \
  --artifacts migration-private/artifacts \
  --output migration-private/prepared
```

输出 `private.sql`（41.5 MB）与 `manifest.json`。
剔除内容：

- `portal_sessions` 51 条（会话票据）
- `credentials` 1 行 + `idempotency` 254 行
- `lease_token` / `lease_expires_at` / `lease_seconds` / `lease_until` / `last_seen` 字段
- `auth_*` / `leases` / `credentials` 等敏感 kind

产物校验结果：`records 4277`、`files 17408`、`bytes 2026487163`。

### 5.2 导入 D1

```bash
D1_DATABASE_ID=1610b3f0-7a28-4270-b30b-fab183f92dbd \
python tools/d1_import.py \
  migration-private/platform.migration.sqlite3 \
  migration-private/prepared/manifest.json
```

**不要**用 `wrangler d1 execute --file private.sql`——见 §7.1。
该脚本复用 `cloudflare_transfer` 的 `EXCLUDED_KINDS` / `clean_record`，保证与 5.1 完全同一套清洗规则；按 200 条或 1.2 MB 切批，429/5xx 指数退避。

导入结果（已校验）：**records 4277/4277，artifact_files 17408/17408**。

### 5.3 上传 R2

```bash
<venv>/Scripts/python.exe tools/r2_upload.py \
  --manifest migration-private/prepared/manifest.json \
  --account eb36b4758b88c5b65dff5bebb0181c31 \
  --bucket gamelab-migration-private \
  --mode auto --concurrency 32
```

- `--mode auto`：检测到 `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` 就走 S3（快车道），否则回退 REST。
- 支持 HEAD 断点续传（已存在且一致则跳过）、`--limit N` 试跑、`--verify` 上传前重算 sha256。
- 实测：并发 8 → 5.3 个/秒；**并发 32 → 23–26 个/秒**（瓶颈是小文件数量，不是带宽）。

实际执行结果：`files 17408 / uploaded 17008 / skipped 400 / failed 0 / bytes 2026487163 / 749 秒`（400 个为先前试跑已上传、被断点续传正确跳过）。

### 5.5 迁移结果（已核验）

| 目标 | 期望 | 实际 | 结果 |
| --- | --- | --- | --- |
| D1 `records` | 4,277 | 4,277 | ✅ |
| D1 `artifact_files` | 17,408 | 17,408 | ✅ |
| R2 对象数 | 17,408 | 17,408 | ✅ |
| R2 总字节 | 2,026,487,163 | 2,026,487,163 | ✅ |

R2 侧用 `list_objects_v2` 全量列举复核，字节数与清单逐字节一致。

### 5.4 部署

```bash
cd cloudflare
CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" npx --yes wrangler@4 deploy --config wrangler.toml
```

### 5.5 部署后自检（三道，从快到慢）

```bash
# 1) 结构自检：本地 sqlite 驱动 portal.mjs，检查字段裁剪、脱敏、响应体积（27 项）
node cloudflare/tests/portal-state.test.mjs

# 2) 口径对账：同一份库，Python 原实现 vs JS 移植，逐字段比对（应 0 差异）
python tools/verify_dashboard_parity.py

# 3) 真实 D1：portal.mjs 原样跑，D1 绑定换成直连 REST（8 项，需环境代理）
NODE_USE_ENV_PROXY=1 node cloudflare/tests/portal-state-remote.mjs

# 4) 缓存路径：真实 D1 登录 → 从 R2 取预生成状态 → 拼上 current_user（8 项）
NODE_USE_ENV_PROXY=1 node cloudflare/tests/state-cache.test.mjs
```

第 3 道是唯一能验证 **D1 侧 `json_remove` / `json_extract` 行为** 的检查，改裁剪 SQL 后必须跑。
第 4 道验证的是线上真正走的缓存路径（见 §7.8）。

每次往 D1 同步数据后必须刷新云端快照，否则门户一直展示旧快照：

```bash
python tools/refresh_portal_state.py     # 生成 + 上传 R2 portal/state-core.json
```

---

## 6. 认证方案（重要）

| 项 | 决定 |
| --- | --- |
| 算法 | PBKDF2-SHA256，格式 `salt(32 hex ASCII):hash(64 hex)` |
| 迭代轮数 | **5,000**（原站 600,000） |
| 原因 | Workers Free 每请求 CPU 上限 **10 ms**；600k 实测 319 ms（超 31 倍），免费版必然 1102 超限 |
| 实测耗时 | 600k=319ms / 210k=110ms / 100k=56ms / 20k=11ms / 10k=5ms / **5k=3–5ms** |
| 代价 | 5,000 轮远低于 OWASP 建议值，是为留在免费版**主动接受**的安全取舍 |

**哈希单向，600k 哈希无法转成低轮数**，因此迁移时为两个账号重新生成了随机密码并重新哈希。新明文密码保存在 `migration-private/new-passwords.json`（权限 0600，已 gitignore），需另行交付给使用者。

| 账号 | 角色 | 状态 |
| --- | --- | --- |
| `test02` | viewer | `enabled: false` |
| `preview-admin` | admin | `enabled: true` |

重设脚本：`migration-private/reset_passwords.py`（从只读源库 backup 出新库再改，源快照不动）。

> 若要恢复 OWASP 级别强度，必须升级 Workers Paid（$5/月，CPU 上限 30 s），届时把 `cloudflare/auth.mjs` 的 `PBKDF2_ITERATIONS` 改回并重设密码。

---

## 7. 已知限制与踩坑

### 7.1 D1 单条 SQL 上限 100 KB

生产库里 `artifacts` / `jobs` / `versions` 的 `report` 字段单条最大 **810 KB**，字面量 `INSERT` 必然失败。
解法：走 D1 REST API `POST /accounts/{acct}/d1/database/{db}/query` 的 **`batch` + `params` 参数化写入**——SQL 文本很短，大值走参数通道（行上限 2 MB，够用）。

其他相关限制：Free 计划库上限 **500 MB**（当前 43 MB，安全）；`d1 execute` 文件上限 5 GB；单查询最多 100 个绑定参数。

### 7.2 Workers Free CPU 10 ms

见 §6。R2 免费 10 GB 装得下 2.03 GB；100 MB 请求体、10 万次/日请求对 17,408 个文件上传也够。

### 7.3 本机无法做公网运行时验证

沙箱代理只对 `api.cloudflare.com` 和 `<account>.r2.cloudflarestorage.com` 放行，对 `workers.dev` 的 CONNECT 返回 502，直连也超时。**验收必须由使用者在自己浏览器完成。**

另外本机 `workerd` / Miniflare 启动即 `0xc0000005` 崩溃（Windows 沙箱限制，非代码问题），`wrangler dev --remote` 也起不来，`wsl.exe` 被策略拦截。

**绕过办法（已验证）**：Node 22 的 undici 支持环境变量代理，加 `NODE_USE_ENV_PROXY=1` 后 `fetch` 就能走沙箱代理打到 `api.cloudflare.com`。于是不需要本地跑 workerd——直接在 Node 里执行**真实部署代码** `portal.mjs`，只把 D1 绑定替换成 D1 REST 调用，即可用云端真实数据完成端到端验证（`cloudflare/tests/portal-state-remote.mjs`）。

> 曾尝试用本地 Python 中继转发 D1 查询，但沙箱会把后台进程与后续命令隔离（ECONNREFUSED），已废弃该方案。

### 7.4 本机验证中发现并修复的两个生产级 bug

1. **路由未 `await`**：`return upload(...)` / `login(...)` / `play(...)` 同步抛错时逃出顶层 `try/catch`，本该返回 401/422 的请求变成 500。已全部改为 `return await ...`。
2. **校验和 base64 解码错误**：`hashMatches` 用 `Buffer.from(checksum)`（默认 UTF-8）比对 R2 返回的 base64 sha256，永远不相等，会误报「校验和损坏」409。已改为 `Buffer.from(checksum, 'base64')`。

### 7.5 看板口径必须与原实现对齐（否则前端静默空白）

`cloudflare/portal.mjs` 里的 `gameTotals` / `operationalOverview` 是 `controlplane/usage.py::game_totals`
与 `controlplane/dashboard_operations.py::overview` 的 JS 移植。前端 `web/dashboard.js` 只要
`state.dashboard_operations` 缺失就渲染「正在获取游戏明细…」，不会报错——所以口径漂移很难肉眼发现。

移植时踩到并已修的三处：

| 问题 | 表现 | 修法 |
| --- | --- | --- |
| 事件排序方向不一致 | 同 `created_at` 的事件配对错乱，耗时与 `unpaired_events` 全部偏大 | 对账脚本必须与 `store.py:51` 一致用 `rowid DESC` |
| `report` 裁剪丢了 `engine` | 5 个游戏退化成「待分析」，按引擎分析失真 | 加入 `REPORT_FIELDS`（最长 8 字节） |
| `report` 裁剪丢了 `blocker` | 阻断原因只剩状态码 `blocked`，丢失 `PUBLISHER_SITE_LOCK` 等真实码 | 加入 `REPORT_FIELDS`（最长 323 字节） |

`REPORT_FIELDS` 同时生成 SQL 投影与 `rebuildReport` 的还原逻辑，**只维护一处**，避免两边漂移。
任何改动后用 `tools/verify_dashboard_parity.py` 复核，当前 0 差异。

### 7.6 D1 查询要并发（串行会放大跨区延迟）

`/api/state` 需要 15 次 D1 查询。库在 WNAM、请求从边缘发起，串行实测 **29 s**；改 `Promise.all`
并发后 **3.1 s**（还是经由本机代理，Worker 内更快）。另把 `events` 全量取回后 `slice(0,150)`，
省掉一次重复查询——`rowid DESC` 下结果与 `LIMIT` 一致。

### 7.8 /api/state 改为预生成 + R2 直出（不是优化，是能不能跑）

现算一次 `/api/state` 需要 15 次 D1 查询 + 解析 + 序列化。实测 `JSON.stringify` 的成本与体积
线性相关：**1 MB ≈ 8.5 ms**，而 Workers Free 每请求只有 10 ms CPU——现算必然偶发 1102。

门户状态是只读的，只在数据同步时变化，所以改为：

| 步骤 | 谁做 | 成本 |
| --- | --- | --- |
| 生成 `portal/state-core.json`（不含 `current_user`） | `tools/refresh_portal_state.py` | 离线，无 CPU 限制 |
| 上传到 R2 `gamelab-migration-private` | 同上（boto3） | — |
| 请求时取出字节流，尾部拼上 `current_user` 返回 | `worker.mjs:portalStateResponse` | 不解析、不重新序列化 |

`current_user` 随会话变化，不能进缓存，所以预生成的 JSON 故意去掉结尾 `}`，请求时补上这一项再封口。
R2 对象缺失时自动回落到现算，不会因缓存没生成而打不开。

配套瘦身（前端实际读取的字段才留，逐个 grep `web/` 确认）：
`rounds` 140 KB → 41 KB（只留 7 个字段）、`recommendations` 396 KB → 242 KB（只留 17 个字段，
`selection_score` 只留 `value`）。

### 7.9 D1 免费版单日写入配额会打断登录

D1 Free 限制 **单日写入 10 万行**，超了之后所有写请求返回 `7500`（读不受影响）。
登录要写 `portal_sessions`，配额用尽时登录直接 503，且不会提示真实原因。

- 影响：新登录失败；已登录会话在 12 小时内仍有效。
- 处理：等 00:00 UTC（北京时间 08:00）重置，或升级 Workers Paid（$5/月，同时解除 10 ms CPU 限制）。
- 排查：`wrangler tail` 看 `[auth] 未预期错误:` 那段堆栈，`auth.mjs` 已把未预期异常打到日志。

### 7.10 环境依赖

`boto3` 不在默认解释器里，R2 上传需用已装 boto3 的 venv：
`C:/Users/Administrator/.workbuddy/binaries/python/envs/default/Scripts/python.exe`

---

## 8. 环境变量

凭据只放本机环境变量，**不贴进对话、不进 Git**。修改后需重启会话才能被子进程继承。

| 变量 | 用途 |
| --- | --- |
| `CLOUDFLARE_API_TOKEN` | Cloudflare API 令牌（需 Workers Scripts / D1 / R2 编辑权限 + Account Settings 读） |
| `CLOUDFLARE_ACCOUNT_ID` | 账户 ID |
| `D1_DATABASE_ID` | D1 数据库 ID |
| `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY` | R2 的 **S3 兼容** API 令牌（32 / 64 字符） |

> R2 的 S3 凭证是**独立凭证类型**，不能在原有 Cloudflare API 令牌里追加（API 报 `9109`），必须单独创建。

`.gitignore` 已排除：`migration-private/`、`private.sql`、`manifest.private.json`、`.wrangler/`、`.env*`。

---

## 9. 验收步骤（待使用者执行）

打开 `https://gamelab-migration.youxi9088.workers.dev`：

1. 用新密码登录（同时验证免费版 10 ms CPU 下登录是否稳定）
2. 打开一个私有产物并试玩
3. **刷新页面，确认存档/进度仍在**（这是最关键的验收项）
4. 退出后确认未登录访问被拒（不能匿名公开）
5. 打开「用量与执行明细」→「单个游戏转换用量」，确认表格有行、引擎筛选有值、
   执行耗时与 Token 有数（此前该面板因缺 `dashboard_operations` 一直停在「正在获取游戏明细…」）

---

## 10. 待决事项

- **D1 区域为 WNAM（美西）**，国内访问有延迟。数据涨起来后再改成本高，**现在改最便宜**。
- **是否升级 Workers Paid（$5/月）**：同时解除 10 ms CPU 与单日 10 万行写入两个限制，
  也能把 PBKDF2 迭代从 5,000 提回安全水平（见 §6）。当前免费版的两个限制都已实际触发过。
- **采集服务归属**：云端只读展示建议，扫描仍需本地平台（`server.py` 的 `DiscoveryScheduler`）执行，
  结果经 `tools/refresh_portal_state.py` 同步到云端。是否要让云端定时拉取，待定。
- 既有 R2 桶 `gmaedate` 是否需要一并纳入或清理。
- 原服务器停服与源数据删除：需在**验收通过且使用者确认切换后**才执行，当前未动。

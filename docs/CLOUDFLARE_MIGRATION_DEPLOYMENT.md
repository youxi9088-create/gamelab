# Game Lab 云迁移部署文档

面向对象：需要在新环境复现或继续推进本次迁移的人。
状态：**数据迁移已完成，等待公网浏览器验收**（2026-10-27）。

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
  ├── Static Assets（site/）        登录页与前端
  ├── D1（gamelab-migration）       records / artifact_files / credentials / auth_failures
  ├── R2（gamelab-migration-private）  artifacts/<artifact_id>/<path>
  └── Secret: MIGRATION_UPLOAD_TOKEN
```

- `worker.mjs`：路由与鉴权入口，负责登录、私有播放、上传、状态。
- `auth.mjs`：PBKDF2 密码校验、会话 Cookie、失败限流。
- `playback.mjs`：从 R2 读取已登记文件并按清单校验后回放。
- `schema.sql`：D1 表结构（`records` 为主表，KV 形式：`kind / id / data`）。

---

## 3. 云端资源清单（已创建）

| 资源 | 标识 |
| --- | --- |
| Cloudflare 账户 | Youxi9088，ID `eb36b4758b88c5b65dff5bebb0181c31` |
| Worker | `gamelab-migration` → `https://gamelab-migration.youxi9088.workers.dev` |
| 当前版本 | `5ccfbfac-764b-444e-a2d2-434349b652a7` |
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
- 实测：并发 8 → 5.3 个/秒；**并发 32 → 26 个/秒**（瓶颈是小文件数量，不是带宽）。全量约 10–15 分钟。

### 5.4 部署

```bash
cd cloudflare
CLOUDFLARE_API_TOKEN="$CLOUDFLARE_API_TOKEN" npx --yes wrangler@4 deploy --config wrangler.toml
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

另外本机 `workerd` / Miniflare 启动即 `0xc0000005` 崩溃（Windows 沙箱限制，非代码问题），`wsl.exe` 被策略拦截。替代方案：`cloudflare/tests/node-logic.test.mjs` 用 `node:sqlite` + 内存 R2 mock 驱动**真实 worker 代码**做等价验证（7 项检查全过）。

### 7.4 本机验证中发现并修复的两个生产级 bug

1. **路由未 `await`**：`return upload(...)` / `login(...)` / `play(...)` 同步抛错时逃出顶层 `try/catch`，本该返回 401/422 的请求变成 500。已全部改为 `return await ...`。
2. **校验和 base64 解码错误**：`hashMatches` 用 `Buffer.from(checksum)`（默认 UTF-8）比对 R2 返回的 base64 sha256，永远不相等，会误报「校验和损坏」409。已改为 `Buffer.from(checksum, 'base64')`。

### 7.5 环境依赖

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

---

## 10. 待决事项

- **D1 区域为 WNAM（美西）**，国内访问有延迟。数据涨起来后再改成本高，**现在改最便宜**。
- 既有 R2 桶 `gmaedate` 是否需要一并纳入或清理。
- 原服务器停服与源数据删除：需在**验收通过且使用者确认切换后**才执行，当前未动。

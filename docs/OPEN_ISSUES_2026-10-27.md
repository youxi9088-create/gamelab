# 待处理问题清单（2026-10-27）

本轮目标：Game Lab 迁移到 Cloudflare（**变体 B：平台留本地、云做只读门面**）。
下列为截至 2026-10-27 仍未解决、需要你回头处理的事项，按阻塞程度排序。

> 已确认的边界：原站 47.110.232.68 未改未停、源数据未删、云端保留登录限制（不匿名公开）、
> 云端不发起任务。下面所有建议都不突破这些边界。

---

## A. 阻塞级

> **2026-10-27 17:20 更新：A1、A2 已解决，见 C 区「本轮补记」。**
> 仍然卡住的只剩 **A3（缺 54 个产物）** 与 **A4（D1 写入配额，次日 08:00 自动恢复）**。

### A1. ~~AI 能力不可用~~ ✅ 已解决（改用 Moonshot Kimi）

**现象**
发起任务后卡在 `local_codex_busy` → `local_codex_failed`，平台提示"超时，任务等待上限 60 秒"。

**根因（已实测定位，不是配置写错）**
`api.openai.com` 在本机返回 **000 不可达** —— 代理不放行，直连超时。
两个版本 CLI 都在 270 s 默认超时内失败：

| 版本 | 来源 | 结果 |
|---|---|---|
| `codex` 0.164.0 | npm 安装（需 `--proxy http://127.0.0.1:64999`） | 超时 |
| `codex.exe` 0.164.0-alpha.11.1 | 桌面版 `AppData\Local\OpenAI\Codex\bin\2993767bd1dfb009\` | 超时 |

登录态是好的：`C:\Users\Administrator\.codex\auth.json` 存在，`codex login status` = *Logged in using ChatGPT*。
所以**卡在网络，不卡在账号**。

可达性实测对照：

| 端点 | 结果 |
|---|---|
| `api.moonshot.cn` | **401（通）** |
| `ai.botclaw.top` | **401（通）** |
| `api.openai.com` | **000（不通）** |

**处理入口（三选一，a 最快）**

a. **用 Moonshot Kimi**（网络已通，只差密钥）
   1. 填 `F:/youxi/door/.env`：
      ```
      REPLICA_AI_BASE_URL=https://api.moonshot.cn/v1   ← 已填好
      REPLICA_AI_MODEL=kimi-latest                     ← 留空则自动取列表第一个
      REPLICA_AI_API_KEY=你的密钥                       ← 目前为空
      ```
   2. 跑 `python tools/sync_ai_config.py`
      （脚本会调 `/v1/models` 验证连通并列出模型，再写进 `data/services.json`。
      注意平台**不读 .env**，`services.json` 才是生效配置；它每次调用重读，改完即生效，不用重启。）
   3. 只看不写：加 `--check`。

b. **让代理放行 `api.openai.com`**，或给 codex 显式配 `HTTP_PROXY/HTTPS_PROXY`。

c. **换 `ai.botclaw.top`**：改 `.env` 的 `REPLICA_AI_BASE_URL` 后同样跑 `sync_ai_config.py`。

**附带待决**
工作区里有为 Codex 路线写的、尚未提交的代码改动，Codex 若不用了要决定去留：

- 新增：`controlplane/codex_account.py`、`controlplane/runtime_compatibility.py`、`tools/local_codex_bridge.py`(M)、`tools/start_local_codex_bridge.ps1`(M)、`tests/test_codex_account.py`、`tests/test_runtime_compatibility.py`、`services/wechat-web-service/tests/*`
- 修改：`ai_connections.py`、`ai_provider.py`、`codex_backend.py`、`service_registry.py`、`server.py`、`web/app.js` 等
- 失效的 local_codex 服务配置我已撤销，不会误触发。

---

### A2. ~~本机平台当前没在跑~~ ✅ 已解决（已重启，见 C 区）

**现象**
`curl http://127.0.0.1:8765/api/state` → `WinError 10061 目标计算机积极拒绝`；`netstat` 查 8765/8766 无任何监听。
（注意：如果走代理会看到 502，那是代理返回的，不是平台状态。）

**处理**
```bash
cd /f/youxi/door
python server.py --port 8765 --play-port 8766 \
  --data-dir F:/youxi/door/data \
  --repo-dir F:/youxi/door/game-library
```
执行器是内置的（`server.py:318` 起 `Executor`），**不需要**另开 `executors/worker.py`。
启动后 `/api/session` 拿 cookie + csrf，再带 `X-CSRF-Token` 请求 `/api/state`（`auth_required=false` 也要走这一步，否则 401）。

---

### A3. ~~产物文件缺失~~ ✅ 已解决（本机就有，无需联网）

**原判断：补不回来。这个判断错了。** —— 见 C4。当前状态：**89/89 产物、21334/21334 文件，0 缺失**。

---

### A4. D1 免费版当日写入配额已用尽

**现象**
云端新登录返回 **503**，D1 报 `7500`。**读不受影响**；已登录会话在 12 h 内继续有效。

**限额**：Free 版单日写入 **100,000 行**，超额后所有写请求被阻断到 **00:00 UTC（北京时间 08:00）**。

**处理**
- 等重置：北京时间次日 08:00 后自动恢复。
- 根治：**升级 Workers Paid（$5/月）** —— 同时解除 10 ms CPU 上限，
  还能把云端 PBKDF2 从当前的 **5000 轮**（Free 10 ms 限制下的妥协）提回安全轮数。
  注意哈希单向，本地原轮数的密码**不能降级**去迁就云端 5000 轮，只能云端提上去。

**附带**
D1 `artifact_files` 表有 **51 行**已删产物的残留记录要清，等配额恢复后执行。

---

## B. 待办 / 待决策（不阻塞，但要给个说法）

### B1. 云端不能发起任务
变体 B 的既定设计：`/api/discovery/*` 明确返回 **501**，
提示"采集扫描由本地平台执行；云端站点只读展示已产生的采集建议"。
若以后要开放写路径，等于改架构（真云端执行 + 对象存储回写），需单独评估。

### B2. 本机 → 云端回传工具未建
你选的是"需要时手动推"，所以目前只有云端→本机单向合并脚本 `tools/merge_cloud_to_local.py`。
反向回传（本机新产生的数据推到 D1）尚未实现，需要时再说。

### B3. GitHub 推送待办
- 1 个提交未推送：`eeee9a4 Wait for offline routes before closing browser`
- 工作区 **30 项**未提交（见 A1 附带清单）
- 本机访问 `github.com` 受限，离线 bundle 已备好：
  `F:/youxi/outputs/gamelab-migration-bc0fb02.bundle`
- 仓库：`https://github.com/youxi9088-create/gamelab.git`

### B4. 云端站点需要你在浏览器亲自验收
**本机访问 `https://gamelab-migration.youxi9088.workers.dev` 返回 000（被网络拦）**，我无法代验。
请按序验：登录 → 浏览看板 → 打开游戏明细 → 试玩 → 刷新后存档恢复。
（历史约定：公网浏览器实际启动、操作、刷新才算验证通过。）

### B5. 四个悬而未决的选型
| 项 | 现状 | 待决 |
|---|---|---|
| D1 区域 | WNAM | 延迟是否可接受，要不要换区域 |
| 既有 R2 桶 `gmaedate` | 已存在 | 是复用还是新建专用桶 |
| Workers 套餐 | Free | 是否升 Paid（见 A4，收益明确） |
| 采集服务归属 | 本地平台 | 是否长期放本地，还是迁到云 |

---

## C. 本轮补记（2026-10-27 17:20）

### C1. AI 已接通：Moonshot Kimi ✅

密钥已写入 `F:/youxi/door/.env`（`.gitignore` 排除，不会进 Git），
并跑 `tools/sync_ai_config.py` 写入 `data/services.json`。
平台 `/api/services` 显示：**ai | 在线 | AI API 实际调用成功**（这是一次真实的 `/health` 调用，不是 ping）。

**模型实测对比**（按平台的真实参数：`response_format=json_object` + `max_tokens=12000`）：

| 模型 | 耗时 | JSON 输出 | 备注 |
|---|---|---|---|
| `kimi-k2.7-code` | 5.0 s | ✅ | **当前选用**，代码能力强 |
| `kimi-k2.7-code-highspeed` | 1.1 s | ✅ | 最快，质量换速度 |
| `kimi-k3` | 9.2 s | ✅ | 通用最强但最慢 |
| `kimi-k2.6` | 3.4 s | ✅ | 均衡 |
| `kimi-k3.1-pro` / `-highspeed` | — | — | **HTTP 429**，该密钥无权限或配额不含 pro |

**踩到的坑（重要，别再踩）**
这几个都是**推理模型**，token 预算会先被 `reasoning_tokens` 吃光。
`max_tokens=64` 时 `content` 返回**空字符串**，看起来像"API 坏了"——实际只是预算不够。
平台侧 `ai_provider.py:215` 默认 `max_tokens=12000`，足够，不用担心。
但**任何用小 max_tokens 做的连通性测试都会误判成失败**。

**换模型**：改 `.env` 的 `REPLICA_AI_MODEL` 后重跑 `python tools/sync_ai_config.py` 即可（写 services.json，无需重启）。

### C2. 本机平台已重启 ✅

进程已在跑，端口 8765/8766 有监听，执行器在同一个进程内轮询（`POST /api/v1/jobs/claim 200`）。

**注意**：用 `nohup ... &` 起的进程会被沙箱随命令结束回收，
必须让它在后台任务里常驻，否则下一次命令里 `curl` 就是 10061。

### C4. 产物缺失已补齐 ✅（不用从 GitHub，本机就有）

**先说 GitHub 为什么不行**：`F:/youxi/door/data/artifacts` 虽然自己是个 git 仓库，但 `git remote -v` **是空的**——
没有远端，只有一次本地提交 `Initialize game library`。主仓库 `.gitignore` 第 1 行 `data/` 又把整个数据目录排除了。
**产物从来没进过 GitHub**，拉不到。

**但根本不用联网**：这 54 个产物早就在本机——
`F:/youxi/door-cloudflare-migration/migration-private/artifacts/`（69 个目录，2 GB），
是当初从生产服务器 47.110.232.68 用 sftp 全量下载的。缺的 54 个**一个不落全在里面**。

**执行**：复制 54 个目录进 `data/artifacts`（1.39 GB，104 s，0 失败）。

**补完又查出更深一层**：按目录数看 89/89 齐了，但按库里登记的文件清单逐文件核对，
**21334 个文件里还缺 2224 个**。定位后集中在**唯一一个**产物 `artifact-1d443b84ae9c`：

- 本机原有的是打包形态（5 个文件：`index.html` + `web-runtime.zip` 等）
- 云端记录登记的是展开形态（2229 个文件）
- 两边共有的 4 个文件**字节完全一致**，本机只是少了 `runtime/` 目录

补上 `runtime/`（2224 个文件）后全量复校：**89 产物 / 21334 文件 / 0 缺失**。

**教训（重要）**：
1. **别按目录数判断产物是否齐全，要按库里 `files` 清单逐文件核对**——
   目录在但里面是空的或另一种形态，按目录数看是"齐全"的。这条之前记过一次，这次又应验了。
2. **"补不回来"这种结论要先查本机**。当初判断依据是"R2 只留了 18 个"，
   却忘了 sftp 全量下载的副本一直躺在本机。下结论前先 `ls` 一遍本地已有资产。
3. `data/artifacts` 现在 2.65 GB（F 盘仍余 94.3 GB）。

**平台无需重启**，产物按 id 读目录；网页刷新即可。

### C6. 运行包：`F:/youxi/GameLab/`（双击即启动）

| 文件 | 作用 |
|---|---|
| **`start.bat`** | 双击启动平台，约 10 秒后自动开浏览器 |
| `stop.bat` | 停止平台（按 8765 端口找 PID，`taskkill /T` 连子进程一起停） |
| `scan_now.bat` | 立即触发一次采集扫描（平台需已在运行） |
| `wait_ready.py` | 就绪检测后开浏览器（**必须 `ProxyHandler({})` 绕代理**，否则 127.0.0.1 走代理拿 502） |
| `scan_now.py` | 走 HTTP `POST /api/discovery/scan`，复用平台进程写库，避免并发写冲突 |
| `README.txt` | 说明 |

**已实测通过**：start.bat 启动 → 8765/8766 监听 → `/api/session` 200 → 执行器自动轮询。

**启动命令等价**：
```
python server.py --port 8765 --play-port 8766 --data-dir F:/youxi/door/data --repo-dir F:/youxi/door/game-library
```
（**不带** `--no-executor` / `--no-discovery`）

**两个编码坑**：
1. bat 以 **GBK** 保存 + `chcp 936`，中文才正常。用 UTF-8 存会乱码。
2. 我的工具终端是 UTF-8，看 bat 输出是乱码——**这是终端侧的问题，双击时 cmd 是 936 代码页，显示正常**，别误判成脚本错了。

### C7. 采集服务：不需要独立进程，已内置

`server.py:314-317` 起 `DiscoveryScheduler`（daemon 线程），每 30 秒 tick 一次。
**实测验证（不是推断）**：`POST /api/discovery/scan` 提交后返回 `queued`，
**45 秒后自动变成 `running` 并真的在扫** —— 证明采集调度随平台在跑。

本次手动扫描结果（`scan-74ea0e41abc9`，最终 `partial`，耗时约 4 分钟）：

| 来源 | 状态 |
|---|---|
| 4k99 / 4K99 | success |
| CrazyGames | success |
| Rosebud | success |
| Remix | success |
| Poki | needs_adapter |
| itch.io | needs_adapter |
| Astrocade | needs_adapter |

新增建议 **41** 条，库内采集建议 436 → **477**。

**三个源失败，都是本机网络环境，不是平台问题**：
- **Poki**：`SSL UNEXPECTED_EOF_WHILE_READING` —— 本机到 poki.com 的 TLS 握手被中断。
- **itch.io**：`不采集本机、内网或保留地址` —— 域名被解析成了保留地址（代理/DNS 环境所致）。
- **Astrocade**：同样需要适配器。

换网络环境或配代理可能解决。要覆盖这三个源需另配适配器。

**采集频率**：每天 09:00 自动一次，**当天已跑过就不再触发**。要立刻再跑用 `scan_now.bat`。

### C8. 判断平台存活的正确姿势

```bash
curl -s -m 5 --noproxy '*' http://127.0.0.1:8765/api/session
```
必须加 `--noproxy '*'`：走代理会拿到 **502**，那是代理返回的假象，不是平台状态。
另外 `/tmp` 在不同命令间不共享，跨命令传值要写进工作区（如 `.cache/`）。

### C9. 云端总览看板「分析游戏 / AI 复刻生成」显示「—」 ✅ 已修复

**现象**：横幅、试玩都正常，但总览页四张卡里这两张是横线。

**根因不是字段丢了，是整段没算**：前端 `web/app.js:347` 读 `state.metrics.production.{analyzed,generated}`，
空值按 `${n??'—'}` 渲染。本地 `controlplane/service.py:148` 会构造 `metrics` 并在 `:168`
调 `production_metrics(state)` 补 `production`；**云端 `portal.mjs` 从来没返回过 `metrics`**。
顺带一起补的还有近 7 天趋势 `metrics.trend`（同一段丢失）。

**做法**：把 `controlplane/dashboard.py::production_metrics` 与 `service.py` 的 metrics 段整体移植进
`cloudflare/portal.mjs`（`canonUrl` / `productionMetrics` / `overviewMetrics`）。
report 里的大字段在云端是裁掉的，所以证据字段单独用一条 SQL 投影取布尔存在性，不走全量 report。

**踩到的两个坑**（都是"看起来对"但实际错）：
1. `records` 表只有 `id/kind/data` 三列，`candidate_id` 得写 `json_extract(data,'$.candidate_id')`，
   直接 `SELECT candidate_id` 报 `no such column`。
2. 事件查询返回的是 `{jobId}` 对象数组，当成 id 数组用 → 分析事件那一路全丢。
   靠 `verify_dashboard_parity.py` 的 **369 vs 368** 才暴露出来——数字只差 1，肉眼永远看不出来。

**验证**：`tools/verify_dashboard_parity.py` 本地 Python 与云端 JS 逐键对账 **0 差异**
（analyzed 369 / generated 1 / websites 7 / acquired 11，evidence 四组键集合完全相同）。
已重新生成 R2 `portal/state-core.json`（763,924 字符 / 1,012,084 字节）并部署版本 `f4a09fdc`。

> 注意：云端 `/api/state` 走的是 **R2 预生成缓存**，不是每次现算。
> 改了 `portal.mjs` 之后必须跑 `tools/refresh_portal_state.py`，否则线上还是旧快照。

---

## D. 本轮已完成（对照用）

- **云端只读门户字段补全**：游戏明细（21 款 / 519 次调用 / 11 类引擎）、采集建议（367 条）、
  采集设置与 7 轮记录、候选 facets / dependency_summary、任务 conversion_plan。
- **四层验证**：本地结构 34/34、Python↔JS 逐字段对账 **0 差异**、真实 D1 8/8、R2 缓存路径 8/8。
- **CPU 上限规避**：响应 981 KB → 字段白名单裁剪 729 KB → 改为 R2 预生成核心 JSON 直出（不解析不重序列化）。
  实测 `JSON.stringify` 1 MB ≈ 8.5 ms，逼近 Free 版 10 ms 上限——体积在这里是"能不能跑"的问题。
- **数据合并**：云端→本机 1131 → 5083 条（candidates 11→22、versions 35→89、jobs 18→29、
  recommendations 162→436、events 569→3100）。已排除 `users`/`portal_sessions`/`audit`
  （云端 users 是 5000 轮哈希，合进本地会造成"有账号但永远登不上"）。
- **修掉 3 处肉眼不可见的口径漂移**：事件排序必须 `ORDER BY rowid DESC`、report 裁剪丢 `engine`（5 款游戏退化"待分析"）、
  report 裁剪丢 `blocker`（失败原因只剩状态码）。统一由 `REPORT_FIELDS` 单一来源生成。
- **并发优化**：15 路 D1 查询从串行 29 s 改为 `Promise.all` → 3.1 s。

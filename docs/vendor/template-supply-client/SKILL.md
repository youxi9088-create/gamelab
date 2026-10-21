---
name: template-supply-client
description: "AI 游戏平台「模板供货」接入技能：把你方的网页游戏 zip 推给平台抽成可复用模板，查抽取进度与模板的问题清单并在自己界面展示。Use when: 接入模板供货、推送游戏包、实现 X-Supply-* HMAC 签名、查 extraction/status 或 extraction/issues、处理 needs_your_fix、排查 401/413/422/429。关键词：模板供货、supply、app_id、授权码、archive_url、archive_sha256、submission_id、问题清单。"
argument-hint: "描述你要推的游戏包和当前接入阶段"
---

# AI 游戏平台模板供货接入

## 先读这三条（不满足的包平台收不了）

1. **只收纯静态网页工程。** zip 解开后是 HTML + JS + CSS + 资源，浏览器直接打开 `index.html` 就能玩。需要构建的（TypeScript / Vue / React 源码、webpack / vite 工程）请交构建产物，但**带内容哈希文件名的打包产物也收不了**（素材无法按名替换）；Unity WebGL、Godot 导出包收不了。入口 `index.html` 必须在 **zip 根目录**（最常见的错误是多包了一层文件夹）。
2. **包 ≤100MB**，解开后 ≤500MB、文件数 ≤2000，不含可执行 / 脚本类文件（.exe .sh .bat .py .php 等）。推送请求里平台会**同步下载**你的包，读超时要设 **≥330 秒**。
3. **必须声明可分发授权**（`license_declaration.distributable = "yes"` 并写明权利人）：你方声明该游戏可被平台抽成模板，并用于生成、发布衍生作品。不能授权的不要推。

## 平台怎么处理你推的包

```text
推送（同步：校验 + 下载 + 核对摘要，秒级到数分钟）
  → queued 排队（按你方同时处理数放行，可能数小时）
  → analyzing 分析（解包、安全扫描、清点、试运行）
  → awaiting_platform_review 平台运营人工确认（看能不能跑、主要流程是否可用）
  → building 制作模板（整理、验证玩法路径、开放可调参数、打包）
  → template_ready / certifying 平台试玩认证
  → published 已上架
```

- **平台不会主动通知你**：状态变化要你来查（`watch` 命令替你轮询）。
- **推多了不会被拒，只会排队**：每天最多受理 100 条，排队中最多 100 条；超过同时处理数的排队等候，`queue_position` 是你方排第几。平台人工确认有排期，排队时间可能以小时计。
- **有问题时**：`next_action = "supplier"` 表示要你改包，`notice` 是一句可以直接展示给你方用户的提醒，`extraction/issues` 给逐条问题（码、位置、怎么改）。改好后用**新的** `submission_id` 重推。

## 安装与快速开始

把整个 `template-supply-client` 目录复制到你方项目（目录名保持不变）：

```text
.claude/skills/template-supply-client/
.github/skills/template-supply-client/
.agents/skills/template-supply-client/
```

在你方**服务端**设置凭据（授权码只放服务端，不进浏览器、不进游戏包、不进日志、不提交 Git）：

```powershell
$env:SUPPLY_PLATFORM_BASE = "平台交付的测试或生产基址"
$env:SUPPLY_APP_ID = "平台交付的 app_id（sup_ 开头）"
$env:SUPPLY_APP_SECRET = "平台一次性交付的授权码"
```

自检（三步都要过再推包）：

```powershell
python scripts/supply_api.py selftest      # 必须输出 SELFTEST: PASS（与平台服务端同一组签名向量）
python scripts/supply_api.py fingerprint   # 12 位指纹，必须与平台管理页显示的一致
python scripts/supply_api.py whoami        # 平台回你方名称、指纹、配额、允许的下载主机
```

推一个包、跟进：

```powershell
python scripts/supply_api.py sha256 game.zip
python scripts/supply_api.py submit --json "@assets/submit.example.json"   # 先把示例里的占位值换掉
python scripts/supply_api.py watch --submission-id "你的 submission_id"     # 退出码 2 = 要你改包
python scripts/supply_api.py issues --submission-id "你的 submission_id"
```

`supply_api.py` 只用 Python 标准库。生产集成可把签名逻辑迁到你方后端语言，但原始 body、规范查询串和签名顺序必须一致。

## 签名（每个请求都要）

| 请求头 | 值 |
|---|---|
| `X-Supply-App-Id` | 平台给的 `app_id` |
| `X-Supply-Timestamp` | 当前 Unix 秒，与平台时钟相差 ≤300 秒 |
| `X-Supply-Nonce` | 16–64 位字母、数字、`_`、`-`，同一 `app_id` 10 分钟内不可重复（**重试也要换新的**） |
| `X-Supply-Signature` | 下面签名原文的 HMAC-SHA256 十六进制（密钥 = 授权码） |

签名原文 6 段，用 `\n` 连接：

```text
app_id
timestamp
nonce
METHOD（大写）
signed_path
SHA256_HEX(原始请求体)
```

- **POST**：`signed_path` = 不带查询串的路径（POST 不许带查询串）；请求体 ≤1MiB，签名用的就是实际发送的字节。
- **GET**：`signed_path` = `path?规范查询串`；规范查询串 = 键按字典序、`application/x-www-form-urlencoded` 编码、每键一个非空值、只用接口列出的键。**没有查询参数时 `signed_path` 就是 path 本身，不带 `?`**。请求体为空，摘要取空串的 SHA-256。
- 不要自己发 `X-Supply-Body-Sha256` / `X-Supply-Query`：网关会删掉并按实际字节重算。

## 接口

前缀 `/v0.1/apecv/gameagent/supply/open/`。响应键为 snake_case。

### `POST extraction/submit` 推送一个游戏包

| 字段 | 必填 | 说明 |
|---|---|---|
| `submission_id` | ✅ | 你方业务主键（16–64 位）。**幂等**：同一个 id 重推返回已有记录（`duplicate=true`），不重复下载、不重复扣额度。改包重推必须换新 id |
| `archive_url` | ✅ | zip 的 https 下载地址，主机必须在平台为你方登记的白名单内；可以是短时效预签名地址（5 分钟有效即可，平台受理时当场下载）。平台不落库、不回显 |
| `archive_sha256` | ✅ | zip 文件本身的 SHA-256 |
| `game_name` | ✅ | 游戏名（≤40 字） |
| `license_declaration` | ✅ | `{distributable:"yes", owner:"权利人", note?}` |
| `acceptance_steps` | | 玩法验收路径（格式见 [assets/acceptance-steps.example.json](assets/acceptance-steps.example.json)）：至少要有一步真正的操作（click / key / drag）。**只作为平台运营确认时的默认值，不会自动放行** |
| `known_limitations` | | 你方已知并接受的限制（字符串数组），同样只作参考 |
| `contact_note` | | 排障备注（≤500 字） |

回 `{submission_id, extraction_id, state, state_text, queue_position, accepted_at, archive_bytes, duplicate, quota:{daily_used, daily_limit, queued, queue_limit}}`。排队中 `extraction_id` 为空，放行进处理后才有。

当场能判的问题当场拒（不扣额度）：地址不合规、主机不在白名单、下载失败、超 100MB、摘要不符、zip 打不开、根目录没有入口、日限额满、排队满。错误码见 [assets/issue-codes.md](assets/issue-codes.md) 第二张表。

### `GET extraction/status?submission_id=…`（或 `extraction_id=…`，二选一）查进度

```json
{
  "submission_id": "…", "extraction_id": "x2026…", "game_name": "…",
  "state": "awaiting_platform_review", "state_text": "等平台确认：…",
  "percent": 50, "accepted_at": "…", "updated_at": "…",
  "blocking": true, "next_action": "platform",
  "queue_position": 0, "notice": "",
  "revision": 1, "issue_count": {"blocker": 0, "warning": 1, "info": 4},
  "template": {"template_id": "…", "version": 3, "certified": false}
}
```

- `next_action`：`platform` 等平台 / `supplier` 要你改包重推 / `none` 在跑或已结束。**界面上最该展示的就是它和 `notice`**。
- `queue_position`：排队中时你方排第几（1 起）；`0` = 不在排队。平台不给预计等待时长。
- `notice`：需要提醒你时的一句话（要你改包、排队位次超过 20、当日额度用到 80%）；空串 = 无需提醒。
- `percent` 是按阶段的固定刻度，只用于画进度条，**不能用来估剩余时间**。
- `template` 只在模板生成后出现。

对外状态（12 个，只增不改）：

| state | 含义 | next_action |
|---|---|---|
| `queued` | 已收到包，排队中 | none |
| `received` | 已开始处理，等分配资源 | none |
| `analyzing` | 解包、安全扫描、清点、试运行 | none |
| `awaiting_platform_review` | 平台运营人工确认中 | platform |
| `needs_your_fix` | 要你改包（看问题清单），用新 submission_id 重推 | supplier |
| `building` | 制作模板中 | none |
| `template_ready` | 模板已生成，等平台试玩认证 | platform |
| `certifying` | 平台上架前试跑中 | platform |
| `published` | 已认证上架 | none |
| `rejected` | 平台未收录（原因见问题清单） | supplier |
| `failed` | 平台侧失败，平台处理，不需要你改包 | platform |
| `canceled` | 你方已撤回 | none |

终态（不会再变）：`published`、`rejected`、`failed`、`canceled`、`needs_your_fix`。

### `GET extraction/issues?submission_id=…` 查模板的问题

可选 `since_seq`（增量拉取）、`severity`（blocker / warning / info）、`limit`（≤200）。回 `{submission_id, extraction_id, revision, items[], max_seq, total}`，每条：

```json
{"seq": 3, "code": "PARAM_SKIPPED", "severity": "info", "stage": "template",
 "title": "有 12 个数值没能开放成可调参数：多处赋值", "detail": "",
 "files": ["js/config.js"], "locations": [{"path": "js/config.js", "line": 42, "symbol": "PLAYER_SPEED"}],
 "suggestion": "把这类数值收敛成一处具名常量或配置对象……", "at": "…"}
```

- `files` / `locations` 是你方包里的相对路径。
- 同一 `revision` 内 `seq` 稳定；**`revision` 变了（平台运营修订后重跑）就从头拉**。
- 码表见 [assets/issue-codes.md](assets/issue-codes.md)。遇到不认识的码，按 `severity` + `title` + `suggestion` 原样展示。

### `POST extraction/cancel` 撤回

`{submission_id, reason}`（理由必填）。排队中与处理中可撤回；已进入打包或已产出模板的回 409。**撤回不退当日受理额度**。

### `GET extraction/list` 列你推过的

可选 `state`（对外状态）、`limit`（≤100）、`offset`。只返回你方的记录，每项同 status。

### `GET whoami` 自检

回你方 `app_id`、名称、状态、授权码指纹与版本、旧码过渡截止时间、允许的下载主机、配额用量、同时处理数、每分钟请求上限、平台时间。

## 轮询节奏

| 状态 | 多久查一次 |
|---|---|
| `queued` / `received` | 5 分钟 |
| `analyzing` / `building` | 1 分钟 |
| `awaiting_platform_review` / `template_ready` / `certifying` | 30 分钟（人工环节，查勤了没用） |
| 终态 | 停查 |

每分钟请求上限 60（含所有接口）。`watch` 命令就按这个节奏：要你改包时打印 `notice` 与全部 blocker 后以**退出码 2** 结束，到终态退出码 0，超时退出码 3——可以直接挂到你方定时任务上，用退出码触发提醒。

## 排障

| 现象 | 先查什么 |
|---|---|
| 401 `SIGNATURE_INVALID` | `selftest` 是否 PASS；`fingerprint` 是否与管理页一致（不一致 = 拿错授权码或授权码已轮换）；签名用的 body 是否与发出去的字节一字不差（别在签名后再格式化 JSON）；GET 的查询串是否按字典序、无参数时是否误带了 `?` |
| 401 `TIMESTAMP_SKEW` | 服务器时钟；用 Unix **秒** |
| 401 `NONCE_REPLAY` | 重试时也要生成新 nonce |
| 401 `AUTH_HEADER_MISSING` | 四个头是否都带了、是否被代理重复加了一次 |
| 403 `SUPPLIER_DISABLED` / `SECRET_NOT_ISSUED` | 联系平台运营 |
| 403 `ARCHIVE_HOST_NOT_ALLOWED` | 请平台登记你方下载主机（只登记域名，不带协议和端口） |
| 413 / 422 | 看 `message` 与 `suggestion`：包太大、摘要不符、下载失败、zip 打不开、根目录没入口 |
| 429 `DAILY_QUOTA_EXCEEDED` / `QUEUE_FULL` / `RATE_LIMITED` | 三种分别是：今日受理满（等到次日 0 点）、排队满（等前面的开始处理）、每分钟请求超（等 `retry_after` 秒） |
| `needs_your_fix` | 读 `notice` 与 `issues?severity=blocker`，改包后**换新 `submission_id`** 重推 |
| `failed` | 平台侧问题，不需要你处理；如需加急联系平台 |
| 授权码轮换 | 平台轮换后旧码 24 小时内仍可用，在此期间换上新码；`whoami` 能看到旧码截止时间 |

## 自检清单（上线前）

- [ ] `selftest` PASS、`fingerprint` 与管理页一致、`whoami` 能回你方名称
- [ ] 授权码只在服务端，不在前端代码、游戏包、日志与 Git 里
- [ ] 推送读超时 ≥330 秒；下载地址至少 5 分钟有效、可直接 GET、不重定向
- [ ] 同一个包重推用的是同一个 `submission_id`（幂等），改过的包用新的
- [ ] 界面展示了 `state_text`、`next_action`、`notice` 和问题清单
- [ ] 轮询按上面的节奏，遇到 429 按 `retry_after` 退避
- [ ] 对不认识的状态 / 码有兜底展示

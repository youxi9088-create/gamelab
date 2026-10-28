# Game Lab 部署现状总览（2026-10-27 17:50）

## 一、三处部署

现在系统跑在**三个地方**，各有明确分工，不是新旧替代关系。

| 位置 | 地址 | 角色 | 状态 |
|---|---|---|---|
| **本机平台** | `http://127.0.0.1:8765` | 完整平台：写操作、转换、采集、AI | ✅ 运行中（PID 16188） |
| **云端门面** | `https://gamelab-migration.youxi9088.workers.dev` | 公网只读：登录、浏览、试玩 | ✅ 在线（Worker `8793e3fa`） |
| **原服务器** | `47.110.232.68` | 生产源站，**未改动未停用** | ✅ 仍在跑（2 个服务进程） |

这就是此前选定的**变体 B：平台留本地、云做只读门面**。
原服务器保持原样，是"迁移验证通过前不得停服"的既定边界。

---

## 二、本机平台（主工作台）

**启动方式**：双击 `F:/youxi/GameLab/start.bat`（约 10 秒后自动开浏览器）
**停止**：`stop.bat` 或关掉黑窗口
**立即采集**：`scan_now.bat`

```
python server.py --port 8765 --play-port 8766
                 --data-dir F:/youxi/door/data
                 --repo-dir F:/youxi/door/game-library
```

| 端口 | 用途 |
|---|---|
| 8765 | 管理界面 + API |
| 8766 | 试玩服务 |

**三件事都内置在平台进程里，不用另起**：

| 能力 | 实现 | 验证 |
|---|---|---|
| 转换执行器 | 自动拉起 `executors/worker.py`（`--parent-pid` 随父进程退出） | 日志 `POST /api/v1/jobs/claim 200` 持续轮询 |
| 采集调度 | `DiscoveryScheduler` 守护线程，每 30 秒 tick，每天 09:00 自动扫 | 手动提交后 45 秒自动变 `running` 真跑 |
| AI | `kimi-k2.7-code`，配置在 `data/services.json` | `/api/services` 显示"在线 · 实际调用成功" |

**数据**（`F:/youxi/door/data`）：

```
records 总数   5135        库 44.7 MB
  events       3104        recommendations  477
  ai_usage      650        artifacts         89
  messages      307        versions          89
  rounds        164        jobs              29
                           candidates        22
产物目录  data/artifacts   89 个 / 2.65 GB / 21334 文件，0 缺失
```

---

## 三、云端门面（Cloudflare）

| 资源 | 配置 | 现状 |
|---|---|---|
| Worker | `gamelab-migration`，版本 `8793e3fa` | 静态资源托管真实前端 `web/`（41 文件） |
| D1 | `gamelab-migration`，区域 **WNAM**（LAX） | 46.8 MB，records 约 4277 |
| R2 | `gamelab-migration-private` | **6403 对象 / 600.2 MB**（artifacts 599.3 + portal 0.9） |

**能做什么**：公网登录 → 浏览看板 → 游戏明细 → 试玩 → 刷新恢复存档。
**不能做什么**：发起任务、采集、转换——`/api/discovery/*` 明确返回 501「采集扫描由本地平台执行」。

**前端写入口已全部隐藏（18:30 部署 `f0c9b7f5`）**
云端 state 本来就有 `migration.read_only: true`，前端据此进入只读模式，两层防护：

1. **UI 层**：`body.read-only` 下 CSS 隐藏 31 类写控件（新建、派单、重试、下架、验收、
   开关、采集扫描/规则/决策、各类保存表单）；采集页的按钮与空状态文案也换成只读措辞；
   顶部加横幅「云端只读站点 · 可浏览、可试玩」。
2. **JS 层**：`mutate()` 直接拦截并提示，`data-action` 的新建入口同样拦住——
   只靠 CSS 挡不住脚本触发，只靠 JS 会让用户点了才发现。

**本地平台不受影响**：本地 `state` 没有 `migration` 字段 → `readOnly = false` → 所有入口照常显示。
一份代码两种行为，不用维护两份前端。

**试玩修复：`Missing module: .../regeneratorRuntime`（18:49 部署 `fb78ce9a`）**

打包产物（Cocos / Babel 转译）的模块加载器按**无扩展名**路径请求 JS，
而文件实际叫 `regeneratorRuntime.js`。按路径精确查 D1 查不到 → 404 → 整局游戏起不来。

修法是两端一致的回退：精确未命中且路径无扩展名时补查一次 `.js`，
**MIME 按实际命中的路径计算**（否则 `nosniff` 下浏览器拒绝执行脚本）。

- 云端 `cloudflare/playback.mjs`，本地 `server.py::play()`（本地是文件直出，同一个坑）
- 新测试 `cloudflare/tests/playback-extension.test.mjs` 5/5 通过
- 本地实测：无扩展名 → 200 `text/javascript` 6773 B；确实不存在 → 404 不误命中

顺带修正：云端弹窗原写着"独立本地窗口试玩 / 下载版本包后按包内说明启动"，
在只读站点上是错误引导，已改为"将在新窗口打开完整游戏"。

**试玩真正根因：`boot.js` 模块基准前缀（19:00 部署 `71388f69`）**

前一节的猜测只对了一半——这类打包产物**根本不发网络请求加载模块**：
`registry.js`（5.83 MB）把 129 个模块注册进内存 `__modules`，键是**纯相对路径**
（如 `@babel/runtime/helpers/regeneratorRuntime.js`）；而 `boot.js` 的 `window.require`
拿**脚本所在 URL 的目录**当基准。云端挂在 `/runtime/<id>/runtime/` 下，
模块 id 就被拼成 `runtime/artifact-xxx/runtime/@babel/...`，与注册表键永远匹配不上 →
浏览器报 `Missing module`，整局起不来。

**本地早有官方解法**：`controlplane/runtime_compatibility.py::mounted_boot()`
按 sha256 白名单把基准改回相对路径（不改写产物文件本身）。这份 boot.js 的
sha256 `1ea87465…` 就在白名单里，所以**本地一直是好的**。
云端 `playback.mjs` 原文写着"未迁移：旧 boot.js 的已知散列通用兼容补丁"——缺的就是它。

已移植为 JS 版 `mountBoot()`，仅在 runtime 模式 + 文件名 `boot.js` + 无 Range 时生效，
并同步修正 `Content-Length`（补丁后长度会变，不修正会截断）。
新测试 `tests/playback-boot-patch.test.mjs` 5/5，含"非 runtime 不打补丁""普通脚本不受影响"。

> 教训：看到 `Missing module` 要先分清是**网络 404** 还是**内存注册表键不匹配**。
> 另外"本地能跑、云端不能跑"时，优先查本地有而云端没迁移的兼容逻辑。

**两个已解决的性能约束**：
- 响应体 981 KB → 字段裁剪 729 KB → **R2 预生成 `portal/state-core.json` 直出**（不解析不重序列化）。
  根源是 Workers Free 每请求 **10 ms CPU**，实测 `JSON.stringify` 1 MB ≈ 8.5 ms。
- 15 次 D1 查询串行 29 s → `Promise.all` 并发 3.1 s。

**D1 写入配额：已恢复**（17:50 实测写入成功）。此前 Free 版单日 10 万行上限触发过 `7500`，北京时间 08:00 重置。

---

## 四、数据关系

```
生产服务器 47.110.232.68（源，未动）
        │  sftp 全量下载
        ▼
migration-private/artifacts（69 个，2 GB）  ← 本机完整副本
        │
        ├──► 本机 data/artifacts（89 个，2.65 GB）   ✅ 已补齐，0 缺失
        │
        └──► R2（仅审核通过 18 个，599 MB）          云端试玩用
```

**云端 D1 与本机是两份数据，方向为云端 → 本机单向合并过一次**（`tools/merge_cloud_to_local.py`，
1131 → 5083 条）。此后本机产生的新数据**不会自动回传云端**——你选的是"需要时手动推"。

所以：**云端看到的是 10-27 早上的快照，本机才是活的。**

---

## 五、本轮解决的问题

| 项 | 处理 |
|---|---|
| AI 不可用 | Codex 走不通（`api.openai.com` 本机 000）→ 换 **Kimi k2.7-code**，已验证实际调用成功 |
| 平台没在跑 | 已重启，并做成运行包 |
| 缺 54 个产物 | **本机就有**（`migration-private/artifacts`），已补齐；又查出 `runtime/` 缺 2224 文件，一并补齐，现 0 缺失 |
| D1 写入配额 | 已自动恢复（实测写入成功） |
| 采集服务 | 确认**内置在平台**，无需独立进程；实测扫描 8 源，新增 41 条建议 |
| 看板字段缺失 | 已移植 `game_totals`/`overview`，Python↔JS 逐字段对账 0 差异 |
| 线上试玩起不来 | 真根因是打包产物 `boot.js` 的**模块基准前缀**（云端 `/runtime/<id>/runtime/` 被拼进模块 id），不是 404。已加 `mountBoot` 兼容补丁，部署 `71388f69` |
| 总览看板显示「—」 | 云端 `portal.mjs` **从未返回 `metrics`**。已移植 `production_metrics` + 近 7 天趋势；重新生成 R2 状态并部署 `f4a09fdc`。对账 0 差异 |

---

## 六、还剩下什么

| 项 | 状态 | 何时解决 |
|---|---|---|
| **云端站点验收** | 本机访问 `workers.dev` 返回 000（被网络拦），无法代验 | 需要你在浏览器亲自走一遍：登录 → 浏览 → 试玩 → 刷新恢复存档 |
| **GitHub 推送** | 1 个提交未推（`eeee9a4`），工作区 31 项未提交 | 本机 `github.com` 不可达；离线 bundle 已备好 `F:/youxi/outputs/gamelab-migration-bc0fb02.bundle` |
| **本机 → 云端回传工具** | 未建 | 你选的是"需要时手动推" |
| **Poki / itch.io / Astrocade 采集失败** | 本机网络环境所致（SSL 中断、域名被判保留地址） | 换网络或配代理 |
| **D1 `artifact_files` 残留 51 行** | 配额恢复后可清 | 随时可做 |
| **是否升级 Workers Paid（$5/月）** | 待你决定 | 升了可同时解除 10 ms CPU + 写入配额，并把 PBKDF2 从 5000 轮提回安全水平 |

**四个选型待决**：D1 区域 WNAM 延迟、既有 R2 桶 `gmaedate` 去留、是否升 Paid、采集服务长期归属。

---

## 七、一句话总结

**本机是完整平台和唯一可写端**（双击 `F:/youxi/GameLab/start.bat` 即用，含转换、采集、AI）；
**云端是公网只读门面**（可登录浏览试玩，不能发起任务，数据是当天快照）；
**原服务器未动未停**，等你确认云端验收通过后再决定何时下线。

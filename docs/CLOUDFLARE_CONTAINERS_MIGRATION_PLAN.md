# 平台本体迁移方案（Cloudflare Containers）

2026-10-27 制定。前置文档：[CLOUDFLARE_MIGRATION_DEPLOYMENT.md](./CLOUDFLARE_MIGRATION_DEPLOYMENT.md)

---

## 1. 为什么需要这份方案

第一阶段只迁了**数据与游戏产物**，平台本体仍在原服务器：

| 组成 | 位置 | 状态 |
| --- | --- | --- |
| 前端 | `web/` 41 个文件 / 19 MB | 已在 Git，**未部署到 Cloudflare** |
| 后端 API | `server.py` 334 行 | 未迁 |
| 业务逻辑 | `controlplane/` 45 模块 / 4,876 行 Python | 未迁 |
| 执行器 | chromium / playwright / subprocess（33 处引用） | 未迁 |
| D1 数据 | 4,277 条 | ✅ 已迁 |
| R2 游戏产物 | 17,408 文件 / 2.03 GB | ✅ 已迁 |

云上现有的 `cloudflare/site/` 只是 2 个文件、4,991 字节的第一阶段原型登录页，**不是平台**。

---

## 2. 目标架构

```
浏览器
  │
  ▼
Workers（入口·鉴权·反代）
  ├── Static Assets ← web/（真实前端，41 文件）
  ├── Container（server.py + controlplane/，Linux Python）
  │      └── 无状态：持久化一律走 D1 / R2
  ├── D1     ← Store（records / credentials / idempotency）
  └── R2     ← Repository（不可变产物）
```

容器**必须无状态**：实例磁盘随休眠/重启丢失，任何落盘数据都必须改走 D1 或 R2。

---

## 3. 平台事实（已查官方文档，非推测）

来源：Containers [limits](https://developers.cloudflare.com/containers/platform/limits/) / [pricing](https://developers.cloudflare.com/containers/platform/pricing/)

| 项 | 值 |
| --- | --- |
| 计划要求 | **Workers Paid（$5/月）**，Free 不可用 |
| 月含额度 | 25 GiB-hours 内存 + 375 vCPU-分钟 + 200 GB-hours 磁盘 |
| 超出计费 | 内存 $0.0000025/GiB-s；vCPU $0.000020/vCPU-s；磁盘 $0.00000007/GB-s |
| 出网 | 北美/欧洲 $0.025/GB（含 1 TB），亚太 $0.04–0.05/GB |
| 停止计费 | 实例休眠后停止；可缩容到零 |
| 实例类型 | lite 1/16 vCPU·256MiB → standard-4 4 vCPU·12GiB·20GB |
| 镜像大小 | 等于实例磁盘空间 |
| 账户上限 | 6 TiB 并发内存 / 1,500 并发 vCPU / 50 GB 镜像存储 |
| 快照 | 最大 20 GB，保留 30 天 |

> chromium 这类负载至少需要 `standard-1`（1/2 vCPU·4 GiB·8 GB 磁盘）。

---

## 4. 改造面评估（实测）

### 4.1 存储层高度集中 —— 这是最大的好消息

| 文件 | 行数 | 职责 |
| --- | --- | --- |
| `controlplane/store.py` | **71** | 全部 SQL 面：`tx` / `get` / `all` / `put` / `event` 四个原语 |
| `controlplane/repository.py` | 132 | 产物文件读写（本地磁盘） |
| `controlplane/service.py:37` | 1 | `Store` **唯一**构造点 |

- `with store.tx() as db:` 共 **37 处**，分布在 9 个模块，但**模式完全一致**。
- D1 的 `batch` 本身是原子的，可用「缓冲操作 → 提交为单个 batch」实现 `tx()`，语义基本等价。
- `ORDER BY rowid DESC`（`all()`）可用：D1 的 `records` 非 `WITHOUT ROWID`，本迁移按原 rowid 顺序插入，顺序已保留。

### 4.2 需要单独处理的地方

| 位置 | 问题 | 处理 |
| --- | --- | --- |
| `discovery.py:200-205` | `SAVEPOINT automatic_dispatch` / `ROLLBACK TO` —— 嵌套回滚，D1 无 SAVEPOINT | 改为「先收集待写操作，异常则不提交」，用应用层逻辑替代 |
| `accounts.py:57` | `DELETE FROM records WHERE kind='portal_sessions'` | 直接映射为 D1 DELETE |
| `service.py:52` | `SELECT ... FROM credentials` | 同上，注意该表未迁移，需在 D1 重建 |
| `repository.py` | 产物落本地磁盘 | 改走 R2 |
| 33 处 chromium/playwright/subprocess | 容器内需真实浏览器与工具链 | 写入容器镜像 |

### 4.3 容器镜像需要什么

Python 3、Node、Git、Chromium + Playwright、`server.py` 及其依赖。镜像大小受实例磁盘限制（standard-1 为 8 GB），chromium 镜像通常可控。

---

## 5. 分阶段计划

| 阶段 | 内容 | 产出/验收 |
| --- | --- | --- |
| **P0 前置** | 升级 Workers Paid；解决镜像构建（见 §6.1） | 能构建并推送镜像 |
| **P1 容器化** | 写 Dockerfile，`server.py` 监听固定端口（如 8080） | 容器内 `python server.py` 起来、`/health` 返回 |
| **P2 存储适配** | `Store` 改为 D1 实现（batch 事务）；`Repository` 改为 R2；处理 SAVEPOINT | 容器内读写全部落在 D1/R2，重启不丢数据 |
| **P3 Worker 入口** | Worker 做鉴权 + 反代到容器；`web/` 走 Static Assets | 公网能打开真实前端并登录 |
| **P4 执行器适配** | chromium/playwright 在容器内跑通 | 能发起一次真实的转换任务 |
| **P5 公网验收** | 完整走一遍：登录 → 派发 → 转换 → 验收 → 刷新恢复 | 与原站行为一致 |
| **P6 切换** | 切流量、停原服务器 | **仅在 P5 全部通过且你确认后执行** |

---

## 6. 阻塞项与风险

### 6.1 本机没有 Docker（当前阻塞 P0/P1）

`docker: command not found`。可选：

1. **Workers Builds**：从 Git 仓库自动构建镜像并部署 —— 不依赖本机 Docker，但要求代码推到 GitHub（当前 `github.com` 在本机不可达，需你在能联网的机器上推送）。
2. 本机装 Docker Desktop（需你确认是否允许）。

### 6.2 必须付费

Containers 只在 Workers Paid 提供。同时这可能顺带解决 §7 的登录轮数问题。

### 6.3 成本不确定

chromium 转换任务是 CPU 密集型，375 vCPU-分钟/月 的包含额度可能被真实转换任务快速吃掉。建议 P4 阶段实测单次转换的 vCPU 消耗再评估。

### 6.4 D1 在美西（WNAM）

容器是 `Region:Earth`，但 D1 在美西，读写有跨区延迟。**现在改最便宜**，进入 P2 前最好定下来。

### 6.5 事务语义弱化

D1 无交互式事务与 SAVEPOINT。`tx()` 用 batch 近似后，长事务内「读-改-写」不再是同一快照，理论上存在竞态。需要评估业务是否依赖强一致（尤其是租约/派发逻辑）。

---

## 7. 顺带可回收的取舍

若升级到 Workers Paid（CPU 上限 30 s），登录的 PBKDF2 可**从 5,000 轮改回 60 万轮**，恢复 OWASP 建议强度，届时重设一次密码即可。

---

## 8. 待你确认

1. 镜像构建走 Workers Builds 还是本机装 Docker？
2. 是否现在升级 Workers Paid？
3. D1 区域是否现在从美西改到更近的区域（如 APAC）？
4. 现有 R2 桶 `gmaedate` 是否一并处理？

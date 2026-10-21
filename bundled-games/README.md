# 九款已入库游戏快照

本快照保存 2026-10-21 导出时每款最新已验收/已发布版本，状态来自原平台，不重新验收、不改变原数据库。

| 游戏 | 交付范围 |
|---|---|
| 霜原炉火 | 原创 Canvas 玩法代码和程序化画面 |
| 合成大西瓜 | Web 运行包、TypeScript 工程及 MIT 许可 |
| Frost Land - Snow Survival | Unity Web 运行包；不含 Unity 编辑器工程 |
| 跑酷小人冲冲冲 | 已有 Web 脚本与资源；不宣称恢复原作者工程 |
| 回转寿司餐厅 | 已有 Web 运行包；不宣称拥有完整编辑器源码 |
| 地铁跑酷 | 已有 Web 脚本及素材；需拆解适配后复用 |
| 几何王国 | 已验收运行版本及现有 full-restoration 源码目录；原服务端未恢复 |
| 扫雷大挑战 | 已验收运行版本及拆分的 source-modules |
| 大鱼吃小鱼2 | 已验收业务脚本、本地宿主、配置及下载素材；原在线排名不在范围内 |

manifest.json 关联游戏、版本、运行产物和相对目录；games/ 保存运行文件；projects/ 保存已有补充源码工程；delivery/ 保存原交付文档。源码工程可能对应先前开发阶段，当前验收运行入口以 manifest 为准。SHA256SUMS.json 记录逐文件哈希。

## 恢复到平台

在仓库根目录、首次启动前执行：

```powershell
python tools/game_snapshot.py verify
python tools/game_snapshot.py restore
python server.py
```

恢复仅允许空 data 目录。已有平台可指定新的目录：`python tools/game_snapshot.py restore --data-dir data-restored`，随后 `python server.py --data-dir data-restored`。九款游戏会显示在小游戏库。当前机器不需要执行恢复。

快照不包含任务历史、用量账本、登录凭据、服务端私有信息或浏览器存档，不伪造这些信息。供货配置仍需另行填写。完整生产迁移应按运维文档备份。

## 修改、复用和验证边界

可修改能力随游戏不同：有 TypeScript/JavaScript 工程的可继续修改逻辑；扫雷拆分模块和本地宿主可作为适配起点；Unity 等只有构建产物的仍属于运行包。没有把“能运行”统一标记为“已验证可复用”。各游戏 README、许可、provenance 和 delivery 文档保留依赖、来源及原验证范围，未覆盖的玩法和远程服务不因提交 Git 而变为已验证。现有第三方许可和权利状态不因本快照改变。

本次检查针对文件哈希与隔离数据库恢复，不重跑真实游戏或测试性验收。历史开发版本保存在原机，未全部重复提交。

隔离恢复检查已通过：9 款入库、9 个 HTTP 入口可读；2 项恢复工具测试通过（完整性、ZIP 展开、拒绝覆盖及路径越界）。这不是重新试玩通过的结论。旧版 web-runtime.zip 在恢复时展开，全部通过平台独立 runtime 入口提供服务，避免依赖原机临时端口。

# 微信小游戏与寒冬生存方向

调研日期：2026-10-13。下面区分代码库、运行时、辅助工具和玩法资料，避免把同名仓库误当游戏源码。

| 项目 | 证据与定位 | 本次处理 |
|---|---|---|
| [Amition/minigame-engine](https://github.com/Amition/minigame-engine) | MIT；TypeScript Canvas 引擎，包含合成大西瓜，提供 Web/微信构建目标 | 固定上游提交，构建与测试实际游戏；仓库较新，不以星数或 README 推断生产成熟度 |
| [huanGrass/HuanYouYu](https://github.com/huanGrass/HuanYouYu) | MIT；Unity/团结引擎微信小游戏合集，项目声明已上线 | 后续选品池；需要对应引擎环境，未在本轮构建 |
| [wechat-miniprogram/minigame-demo](https://github.com/wechat-miniprogram/minigame-demo) | 微信小游戏官方 API/组件示例 | 平台 API 适配参考，不是完整游戏库 |
| [batazor/whiteout-survival-autopilot](https://github.com/batazor/whiteout-survival-autopilot) | 手机屏幕/OCR/操作自动化工具 | 不是无尽冬日游戏源码，不作为游戏引擎复用 |
| [Whiteout Survival 官网](https://www.whiteoutsurvival.com/) | 商业游戏公开介绍入口 | 玩法背景参考，不提供客户端源代码或服务端实现 |

本次公开网页和 GitHub 检索没有核实到可直接复用的“无尽冬日完整游戏或核心逻辑开源库”。这只是本轮搜索结果，不代表绝对不存在。没有获得原版安装包或微信小游戏包，因此未对原版客户端执行 REA，也没有取得服务端源码。

寒冬生存方向采用独立代码实现炉火、资源、居民分工、建设和暴风雪的单机闭环。参数、视觉和关卡节奏为本次设计；英雄、联盟、世界地图、PvP、内购和线上后端不在首版范围。

微信方向先交付浏览器可试玩版本及可迁移源码。微信构建产物和微信真机验证是不同的结果；没有开发者工具/真机验证时不声称已经可上线。

# 霜原炉火 / Frost Hearth

独立原创的寒冬营地生存 Web 小游戏，重建同类作品的“供暖—资源生产—村民分工—营地升级—应对风雪”核心循环。不是《无尽冬日》完整复刻，也没有获取或反编译该商业游戏客户端；不含原作代码、名称包装、角色、美术或音频。

## 运行与操作
直接打开 index.html，或通过静态服务器提供本目录。无构建过程，无第三方依赖，无外部请求。中文桌面和手机浏览器可玩。

- 初始 6 位村民，3 伐木、3 狩猎；用加减按钮调整。
- 每次“推进 1 小时”结算生产、炉火耗材、食物消耗和健康。自动推进可随时暂停。
- 第 3、5、7 天午后有暴雪；夜间生产减半。
- 升级炉火提高温度，保温屋提高保暖，生产建筑提高产出。上限 Lv.3。
- 完整胜利：存活 168 小时并将炉火与保温屋升至 Lv.2。健康归零失败；结算可重新开始。
- 无账号、付费、后台联网、长期离线产出、联盟、英雄战斗、多人服务。未持久化存档，刷新新开一局。

## 来源与研究
检索日期：2026-10-13。官方介绍确认冰雪题材、资源争夺、建设科技等方向；Google Play 编辑介绍涉及炉火升级、生产设施与分工。具体数值、规则、视觉和代码均为本项目原创简化设计。

- 官方：https://www.centurygames.com/games/a/
- 官方站：https://whiteoutsurvival.centurygames.com/
- Google Play 官方平台编辑资料：https://play.google.com/store/apps/editorial?hl=en_US&id=mc_games_editorialevergreen_postinstall_whiteout_survival_resources_now_fcp
- 检索到的相关开源项目 https://github.com/whiteout-project 和 https://github.com/Shederator/wosbot 为辅助/自动化工具，不是游戏核心源码。
- 可借鉴的真实浏览器生存源码：https://github.com/doublespeakgames/adarkroom （MPL-2.0）；此交付未复制其代码或素材。
- “WhiteoutLib”是暴雪游戏文件格式库，与 Whiteout Survival 无关，未采用。

检索 GitHub + 公开搜索关键词：无尽冬日、Whiteout Survival game source code open source、furnace survivors resources、adarkroom license。未发现可确认的《无尽冬日》官方开源游戏核心；这不构成全网不存在的结论。

## 验证
浏览器交互测试位于工作区 qa-output/test-frost.cjs；截图与 JSON 报告同目录。该测试使用真实界面按钮推进一整个胜利局和失败局，没有修改游戏状态跳过规则。frostState() 只返回状态副本供测试读取。

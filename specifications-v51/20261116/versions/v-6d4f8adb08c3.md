# STICKMAN STRIKE on Remix – Play Now & Create Your Own Games 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：STICKMAN STRIKE on Remix – Play Now & Create Your Own Games

**玩法类型**

第一人称射击（FPS）/ 战术竞技 / 炸弹拆除

**操作方式**

键盘 WASD 移动；鼠标控制视角与准星；鼠标左键射击；B 键打开购买菜单；数字键 1-5 切换武器槽位；R 换弹、E 使用/拆弹、C 蹲下、Shift 静步、Space 跳跃；Tab 查看计分板；死亡后可按 R 或点击按钮跳过本回合观战。

**视角与布局**

第一人称

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

以低多边形/手绘线条风格的火柴人角色，在简化版 de_dust2 地图上体验快节奏的 FPS 对战；通过击杀、回合胜负与经济系统推进整场比赛。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

键盘 WASD 移动；鼠标控制视角与准星；鼠标左键射击；B 键打开购买菜单；数字键 1-5 切换武器槽位；R 换弹、E 使用/拆弹、C 蹲下、Shift 静步、Space 跳跃；Tab 查看计分板；死亡后可按 R 或点击按钮跳过本回合观战。

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

基于《反恐精英》炸弹拆除模式的 5v5 射击对战。玩家可选择 Counter-Terrorists（CT）或 Terrorists（T）阵营，与 BOT 或在线玩家进行回合制对抗：CT 目标为消灭全部 T 或拆除炸弹，T 目标为消灭全部 CT 或成功引爆炸弹。每回合开始时可用金钱购买武器与装备。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

1. 主菜单选择阵营、BOT 难度、比赛长度（Short/Competitive）与友军伤害开关；2. 点击 PLAY VS BOTS / PLAY ONLINE 进入加载；3. 回合准备阶段用 B 购买武器；4. 回合中进行移动、射击、安放/拆除炸弹；5. 回合以一方全灭或炸弹爆炸/拆除结束；6. 更新比分、发放金钱并进入下一回合；7. 先达到目标回合数的一方获胜；8. 页面刷新后回到主菜单，可重新开局。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

单场比赛内：通过击杀与回合胜利获得金钱，用于购买更强武器；比赛级别进度为回合比分。长期：每日任务（赢比赛、赢回合、安放炸弹）奖励随机箱子；库存/交易/商店系统用于皮肤收集，但本轮未验证具体解锁与交易逻辑。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

胜利条件：比赛先达到 5/9 回合（Short/Competitive）的一方获胜。回合胜利条件：CT 全灭 T、拆除炸弹或时间耗尽；T 全灭 CT 或炸弹爆炸。经济：每回合起始金钱用于购买武器，胜利/失败/击杀都会增加金钱。友军伤害可在菜单关闭。死亡后进入观战，可 Skip round 快速进入下一回合。

**已验证流程与未覆盖范围**

实机验证：离线启动成功、主菜单渲染与点击、进入 BOT 对战、CT 出生点画面、WASD 移动、鼠标射击（弹药减少）、BOT 命中/被击杀反馈、死亡面板、Skip round 进入 Round 2/9、页面刷新后恢复主菜单且 localStorage/IndexedDB 保留、重新进入对局。源码确认：index.html 包含 Three.js 引擎、设置持久化、武器/回合/购买逻辑；local-host.js 提供离线 RemixSDK 适配。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定地图：de_dust2（5v5 bomb defusal）。模式：与 BOT 对战、在线对战。武器：手枪、步枪、狙击枪、冲锋枪、霰弹枪、机枪、刀具、C4、手雷等（源码中列有 USP-S、AK-47、AWP、M4A4 等）。角色外观为火柴人，配有头盔/背包等装饰差异。每日任务与皮肤库存系统存在但本轮未深入验证。

**场景、关卡与难度设计**

单张固定地图 de_dust2，包含 CT/T 出生点、A/B 包点、中路、长 A/短 A、B 洞等经典 CS 路径；手绘线条风格建筑与碰撞体；源码中可见基于 NX/NZ/NH/NC/NM 的导航网格用于 BOT 寻路。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

移动与视角系统（WASD+鼠标）、武器与射击系统（后坐力/弹药/换弹）、伤害与命中系统（死亡面板显示伤害统计与剩余血量）、经济/购买系统（$800 起手枪局，B 键购买）、炸弹安放/拆除系统（T 安放，CT 按 E 拆除）、雷达系统（左上角小地图显示队友/敌人位置）、回合管理系统（计时、比分、回合提示）、BOT AI 系统（队友报点、旋转支援）、设置持久化系统（localStorage）、音频缓存系统（IndexedDB）。

**界面流程与反馈**

启动页→主菜单（STICKMAN STRIKE）：可切换 Team / Bots / Match / Friendly fire，按钮 PLAY VS BOTS、PLAY ONLINE、Inventory、Trading Hub、Bits Shop、Options；加载后进入第一人称 HUD：左上角雷达+地点名，顶部比分/计时/回合，左下金钱+购买按钮+血量/护甲，右下当前武器与弹药；中央显示回合提示（Round 1 / Pistol round）；死亡后显示 You are dead + Skip round (R) + 伤害统计面板；回合结束后进入下一回合或返回菜单。

**存档方式**

设置保存：localStorage 键 stickcs.settings（含灵敏度、FOV、音量、按键绑定、准星等），刷新后哈希一致。音频缓存：IndexedDB 数据库 stickcs-audio 缓存 PCM 音频，刷新后仍保留。导航缓存：localStorage 键 stickcs.nav.mnofpw.19197 缓存寻路数据。比赛进度：未观察到 mid-match 保存，刷新后回到主菜单而非恢复到某一回合，符合回合制 FPS 设计。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：CT Spawn
0
0:05
Round 1/9
0
$800
BUY · B
100
0
USP-S
12
/ 24
Round 1
Pistol round · buy with B
E

![实机图 2](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-1.png)

图 2：实际操作记录 2。画面文字：CT Spawn
0
1:55
Round 1/9
0
$800
BUY · B
100
0
USP-S
12
/ 24


E

![实机图 3](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-3.png)

图 3：实际操作记录 4。画面文字：CT Spawn
0
1:20
Round 1/9
0
gg_ez_4frog
zzzSleepy
ramen_rush
KappaKnight
L3moN Enemy spotted — B Site
L3moN Rotating to B
$800
BUY · B
100
0
USP-S
11
/ 24


E

![实机图 4](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-4.png)

图 4：实际操作记录 5。画面文字：CT Spawn
0
1:17
Round 1/9
0
ramen_rush
本地玩家
flashbang_fiona
L3moN
gg_ez_4frog
zzzSleepy
L3moN Rotating to B
$800
BUY · B
0
0


E
You are dead
Skip round (R)
Killed by
ramen_rush
DAMAGE GIVEN
0 in 0 hits
DAMAGE TAKEN
81 in 2 hits
ramen_rush has 1 HP left

![实机图 5](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-6.png)

图 5：实际操作记录 7。画面文字：Short A
1
1:21
Round 2/9
0
KappaKnight Need backup!
$2200
BUY · B
+$1400
100
0
USP-S
11
/ 24


E

![实机图 6](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-7.png)

图 6：实际操作记录 8。画面文字：STICKMAN
STRIKE
de_dust2 · 5v5 bomb defusal
Team
Counter-Terrorists
Terrorists
Random
Bots
Easy
Normal
Hard
Expert
Mixed
Match
Short · first to 5
Competitive · first to 9
Friendly fire
Off
On
PLAY VS BOTS 
PLAY ONLINE 
Inventory5
Trading Hub
Bits Shop
Options
Playing as 本地玩家
Daily quests
resets in 1h 12m
Win a match
0/1
Win 5 rounds
0/5
Plant the bomb 3 times
0/3
Finish all 3 for a random case · 0/3
Map geometry: “de_dust2 – CS map” by vrchris (CC-BY-4.0), redrawn in ink. Stickman rig from Operation Ink. Created by @LeevaiNFT · © 2026, all rights reserved.
v1.4.0

![实机图 7](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-9.png)

图 7：实际操作记录 10。画面文字：CT Spawn
0
0:05
Round 1/9
0
$800
BUY · B
100
0
USP-S
12
/ 24
Round 1
Pistol round · buy with B
E

![实机图 8](/api/versions/v-6d4f8adb08c3/specification-images/screenshots/step-10.png)

图 8：实际操作记录 11。画面文字：CT Spawn
0
1:55
Round 1/9
0
$800
BUY · B
100
0
USP-S
12
/ 24


E

## 14. 养成系统 + 经济系统

**维度定义**：成长要素和资源产出、消耗、回收机制。

**内容说明**

## 15. 角色 / 单位设定

**维度定义**：角色单位的数量、属性、能力、定位和关系。

**内容说明**

## 16. 商业化

**维度定义**：已实现的广告、内购、订阅、买断和付费点。

**内容说明**

### 事实依据与定位

本轮 runtime 报告：verification/dc6fd15c-c051-4ad9-a2ae-a0cfa22833f9-web-play.json；截图 screenshots/step-0 至 step-10；源码文件 index.html（含 Three.js 游戏逻辑、设置、购买、回合系统）、local-host.js（离线 SDK 适配）、runtime-resource-bindings.js / runtime-resource-map.js（资源映射）。

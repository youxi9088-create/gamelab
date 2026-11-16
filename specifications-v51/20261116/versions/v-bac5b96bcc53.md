# boxy-brawl 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：boxy-brawl

**玩法类型**

动作/竞技

**操作方式**

键盘WASD移动（实测w有效），鼠标点击攻击；界面有暂停按钮。

**视角与布局**

俯视斜视角固定镜头

**画面维度**

3D

**引擎**

Three.js（运行时出现 THREE.WebGLShadowMap 诊断日志）

**程序语言**

JavaScript（约1.76MB单文件 index.html 内联打包）

**结论字段**

- `game_summary` = 俯视3D方块风竞技场乱斗：玩家与3名CPU角色在围栏场地中移动对战，按回合以名次、K.O.与伤害计分，3回合累计总分决出排名。

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

**内容元素资源类型**

3D场景与角色模型内联于单文件HTML；DOM按钮/结算面板UI；字体loaded；音频未验证。

**结论字段**

- `engine_asset_system` = 单文件 index.html 内联引擎与全部资源，运行时无额外资源请求。

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**结论字段**

- `core_challenge_type` = 反应操作 / 走位与目标选择

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

键盘WASD移动（实测w有效），鼠标点击攻击；界面有暂停按钮。

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

4人竞技场乱斗：走位躲避并攻击对手，回合结束按名次+K.O.+伤害计分，累计3回合总分排名。

**结论字段**

- `core_loop` = 走位→攻击/击倒对手→回合结算（名次+K.O.+伤害）→累计总分→进入下一回合

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

启动进入竞技场→与3名CPU对战→回合结算面板→点击下一回合按钮继续→3回合后总分排名

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

回合内得分累计为整场总分；无长期养成实证。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

**目标规则反馈激励闭环**

短期目标：回合内击倒对手争名次；规则：90秒内按名次/K.O./伤害计分；反馈：HP条、星级、击倒播报（如 I'll be back...）、结算面板与奖牌；激励：总分累计与下一回合入口；中期目标：3回合总分第一。长期目标与解锁内容未实现，未填写。

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

每回合90秒、角色250 HP；结算分=名次分（第1名+10、第2+6、第3+3、第4+1）+K.O.分+伤害分；共3回合。

**已验证流程与未覆盖范围**

实机验证：启动/交互/刷新三检查点通过，第1回合结算并进入第2回合，全程零外部请求；代码确认：回合数、计分规则、设置存储键。未验证：完整3回合终局、全部角色与竞技场、音频。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

**结论字段**

- `key_numbers` = HP 250；回合90秒；回合数3；实测第1回合 Princess Vi +17（place+10·K.O.+4·dmg+3）。

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

实机可见4名角色（玩家w、Sheriff Dee、Princess Vi、Bjorn）与含木箱、TNT、木桶、奖杯台的竞技场；源码中角色表与竞技场表可核对，未逐一穷举数量。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

单人+3 CPU 对战、暂停、本地设置存储。

**界面流程与反馈**

顶部四名玩家状态卡（HP/星级）→中央回合计时与暂停按钮→回合结算面板（奖牌名次、单项分、TOTAL SCORE、下一回合按钮）。

**存档方式**

localStorage 键 boxybrawl.settings.v1 保存设置类记录并在刷新后保留；对局进度存档未验证。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

**文字与美术内容**

卡通方块小人，西部/奇幻混合角色（警长、公主、维京战士），围栏石板竞技场。

### 实际运行图解

![实机图 1](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-45.png)

图 1：实际操作记录 1。画面文字：▼ w
Sheriff Dee
Princess Vi
HAHA! Battle!
Bjorn
w
YOU
250 HP
★ 0
Sheriff Dee
CPU
250 HP
★ 0
89
ROUND 1 / 3
Princess Vi
CPU
250 HP
★ 0
Bjorn
CPU
250 HP
★ 0
❚❚

![实机图 2](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-47.png)

图 2：实际操作记录 3。画面文字：▼ w
Sheriff Dee
Shoo!
Princess Vi
OOF!
Bjorn
w
YOU
250 HP
★ 0
Sheriff Dee
CPU
127 HP
★ 0
86
ROUND 1 / 3
Princess Vi
CPU
250 HP
★ 0
Bjorn
CPU
214 HP
★ 0
❚❚

![实机图 3](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-48.png)

图 3：实际操作记录 4。画面文字：▼ w
Sheriff Dee
Shoo!
Princess Vi
OOF!
Bjorn
w
YOU
250 HP
★ 0
Sheriff Dee
CPU
127 HP
★ 0
86
ROUND 1 / 3
Princess Vi
CPU
250 HP
★ 0
Bjorn
CPU
214 HP
★ 0
❚❚
Paused
RESUME
RESTART MATCH
HELP
SETTINGS
QUIT TO MENU

![实机图 4](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-50.png)

图 4：实际操作记录 6。画面文字：▼ w
Draw!
Sheriff Dee
How DARE you!
Princess Vi
OOF!
Bjorn
w
YOU
250 HP
★ 0
Sheriff Dee
CPU
127 HP
★ 0
84
ROUND 1 / 3
Princess Vi
CPU
211 HP
★ 0
Bjorn
CPU
214 HP
★ 0
❚❚

![实机图 5](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-51.png)

图 5：实际操作记录 7。画面文字：▼ w
Draw!
Sheriff Dee
How DARE you!
Princess Vi
Catch!
Bjorn
w
YOU
250 HP
★ 0
Sheriff Dee
CPU
127 HP
★ 0
83
ROUND 1 / 3
Princess Vi
CPU
167 HP
★ 0
Bjorn
CPU
214 HP
★ 0
❚❚

![实机图 6](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-53.png)

图 6：实际操作记录 9。画面文字：Naturally ♥
Princess Vi
💫
w
YOU
0 HP
★ 3
💫
Sheriff Dee
CPU
0 HP
★ 10
45
ROUND 1 / 3
Princess Vi
CPU
154 HP
★ 17
💫
Bjorn
CPU
0 HP
★ 3
❚❚
ROUND 1 RESULT
🥇
Princess Vi
place +10 · K.O. +4 · dmg +3
+17
🥈
Sheriff Dee
place +6 · K.O. +2 · dmg +2
+10
🥉
w(you)
place +3
+3
4th
Bjorn
place +1 · dmg +2
+3
TOTAL SCORE
Princess Vi
17
Sheriff Dee
10
w
3
Bjorn
3
ROUND 2 ▶

![实机图 7](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-54.png)

图 7：实际操作记录 10。画面文字：Naturally ♥
Princess Vi
💫
w
YOU
0 HP
★ 3
💫
Sheriff Dee
CPU
0 HP
★ 10
45
ROUND 1 / 3
Princess Vi
CPU
154 HP
★ 17
💫
Bjorn
CPU
0 HP
★ 3
❚❚
ROUND 1 RESULT
🥇
Princess Vi
place +10 · K.O. +4 · dmg +3
+17
🥈
Sheriff Dee
place +6 · K.O. +2 · dmg +2
+10
🥉
w(you)
place +3
+3
4th
Bjorn
place +1 · dmg +2
+3
TOTAL SCORE
Princess Vi
17
Sheriff Dee
10
w
3
Bjorn
3
ROUND 2 ▶

![实机图 8](/api/versions/v-bac5b96bcc53/specification-images/screenshots/step-56.png)

图 8：实际操作记录 12。画面文字：I'll be back...
▼ w
Happy trails...
Sheriff Dee
Naturally ♥
Princess Vi
To Valhallaaa!
Bjorn
w
YOU
250 HP
★ 3
Sheriff Dee
CPU
250 HP
★ 10
90
ROUND 2 / 3
Princess Vi
CPU
250 HP
★ 17
Bjorn
CPU
250 HP
★ 3
❚❚
2

## 14. 养成系统 + 经济系统

**维度定义**：成长要素和资源产出、消耗、回收机制。

**内容说明**

## 15. 角色 / 单位设定

**维度定义**：角色单位的数量、属性、能力、定位和关系。

**内容说明**

**角色单位设定**

实机4名方块角色：玩家w与CPU Sheriff Dee、Princess Vi、Bjorn；技能差异未验证。

## 16. 商业化

**维度定义**：已实现的广告、内购、订阅、买断和付费点。

**内容说明**

**商业化实现**

当前交付包源码检索 payment/checkout/purchase/advertis/rewarded/showAd 均零命中，运行时零外部请求；未发现商业化实现。

### 事实依据与定位

evidence/current-runtime.json；index.html；local-host.js

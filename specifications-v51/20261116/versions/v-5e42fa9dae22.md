# Play DON’T TOUCH - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play DON’T TOUCH - Free Online Game | Rosebud

**玩法类型**

生存躲避类街机小游戏

**操作方式**

鼠标移动 → 绿点跟随指针 → 无需按键，开局即生效；移动端拖动竞技场任意位置 → 绿点跟随 → 同鼠标；START RUN/TRY AGAIN按钮 → 开始或重开一局 → 菜单或结算界面点击；POWER MODE/CLASSIC → 切换模式 → 榜单与规则提示随之切换（Power Mode为付费扩展，未验证）。

**视角与布局**

俯视固定视角，单屏竞技场

**画面维度**

2D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

规则极简、秒上手、高压力反应生存；每局尝试打破个人最佳时间。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

鼠标移动 → 绿点跟随指针 → 无需按键，开局即生效；移动端拖动竞技场任意位置 → 绿点跟随 → 同鼠标；START RUN/TRY AGAIN按钮 → 开始或重开一局 → 菜单或结算界面点击；POWER MODE/CLASSIC → 切换模式 → 榜单与规则提示随之切换（Power Mode为付费扩展，未验证）。

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

用鼠标（移动端拖动）控制绿点在竞技场中移动，躲避持续增多的红色障碍物，存活越久得分越高；碰到红色立即死亡并结算。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：菜单点START RUN进入对局；操作：移动绿点躲避红色障碍，难度随时间提升；结果：碰撞后死亡，显示生存时间与最佳成绩；继续：点TRY AGAIN重开，最佳成绩本地保留。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

进度体现为个人最佳时间（BEST）；无等级、解锁或货币系统的实机证据；Power Mode宣称提供Shield/Extra Life/Slow Time/Safe Zones等能力（仅界面文字，未验证）。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：尽可能长时间不被红色障碍碰到；失败：绿点与任意红色障碍接触即结束；计分：生存时间（秒），BEST取历史最高；无计分公式之外的数值阈值确认，难度随时间递增（界面提示Next: transform at Ns）。

**已验证流程与未覆盖范围**

实机验证：启动加载、菜单、经典模式开局、拖动移动、计时、碰撞死亡、结算、TRY AGAIN重开、最佳成绩保存与刷新恢复、排行请求被拦截时的降级提示；仅源码/界面确认：Power Mode能力描述、账号登录注册入口；未验证：Power Mode实际玩法、账号系统、在线排行提交成功路径、移动端实际触摸。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定单竞技场生存玩法，障碍行为随时间阶段性变化；无关卡数量概念；在线周榜为外部内容，离线时显示Connecting to rankings并降级。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

对象：玩家绿点、红色障碍（多种形态/移动模式）；状态：菜单/对局/暂停/结算；触发：碰撞检测触发死亡结算；系统交互：结算时尝试提交分数到在线排行（被拦截时提示降级），最佳成绩写入localStorage；辅助：RANKS排行面板、暂停、静音按钮。

**界面流程与反馈**

主菜单：标题、操作说明、可选昵称输入、START RUN、POWER MODE、登录/注册、周榜（CLASSIC/POWER/ALL-TIME LEGENDS切换）、ABOUT US与CONTACT弹窗；对局：顶部TIME与BEST；结算：CONTACT DETECTED/YOU DIED、生存与最佳时间、TRY AGAIN、周榜面板；底栏：RANKS、暂停、静音。

**存档方式**

保存内容：最佳生存时间；存储：localStorage键dontTouchBest；触发：死亡结算时写入；恢复：刷新后菜单BEST显示04.7，已实机确认；不保存项：昵称、对局中途进度（单局即死即结算）。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-5e42fa9dae22/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：DON’T TOUCH
TIME
01.3
BEST
00.0
A TINY SURVIVAL GAME
DON’T
TOUCH.

Move the green dot with your mouse.
On mobile, drag anywhere in the arena.

YOUR NAME (OPTIONAL)
 START RUN POWER MODE

Classic rules · survive as long as you can.

LOG IN · SIGN UP
WEEKLY TOP 10
CLASSIC · LOADING · RESETS MON 00:00 UTC
CLASSIC
POWER
★ ALL-TIME LEGENDS
Connecting to rankings…
ABOUT US
CONTACT
×
ACCOUNT CONFIRMATION
CONFIRMING
YOUR EMAIL...

Please wait while we verify your confirmation link.

×

ABOUT US

About DontTouch

DontTouch is a fast-paced browser survival game built around a simple challenge: don’t get

![实机图 2](/api/versions/v-5e42fa9dae22/specification-images/screenshots/step-1.png)

图 2：实际操作记录 2。画面文字：DON’T TOUCH
TIME
04.7
BEST
04.7
CONTACT DETECTED
YOU
DIED.
Couldn’t even survive the easy part.

You survived 4.7 seconds.
Best: 4.7 seconds. Ready again?

Season 1 status could not be verified, so this score was not sent to a legacy leaderboard. Please try again when rankings reconnect.
YOUR NAME (OPTIONAL)
 TRY AGAIN
WEEKLY TOP 10
CLASSIC · LOADING · RESETS MON 00:00 UTC
CLASSIC
POWER
★ ALL-TIME LEGENDS
Connecting to rankings…
POWER MODE

Classic rules · survive as long as you can.

LOG IN · SIGN UP
ABOUT US
CONTACT
×
ACCOUNT CONFIRMATION
CONFIRMING
YOUR EMAIL...

Please wait while we verify

![实机图 3](/api/versions/v-5e42fa9dae22/specification-images/screenshots/step-2.png)

图 3：实际操作记录 3。画面文字：DON’T TOUCH
TIME
04.7
BEST
04.7
CONTACT DETECTED
YOU
DIED.
Couldn’t even survive the easy part.

You survived 4.7 seconds.
Best: 4.7 seconds. Ready again?

Season 1 status could not be verified, so this score was not sent to a legacy leaderboard. Please try again when rankings reconnect.
YOUR NAME (OPTIONAL)
 TRY AGAIN
WEEKLY TOP 10
CLASSIC · LOADING · RESETS MON 00:00 UTC
CLASSIC
POWER
★ ALL-TIME LEGENDS
Connecting to rankings…
POWER MODE

Classic rules · survive as long as you can.

LOG IN · SIGN UP
ABOUT US
CONTACT
×
ACCOUNT CONFIRMATION
CONFIRMING
YOUR EMAIL...

Please wait while we verify

![实机图 4](/api/versions/v-5e42fa9dae22/specification-images/screenshots/step-3.png)

图 4：实际操作记录 4。画面文字：DON’T TOUCH
TIME
04.7
BEST
04.7
CONTACT DETECTED
YOU
DIED.
Couldn’t even survive the easy part.

You survived 4.7 seconds.
Best: 4.7 seconds. Ready again?

Season 1 status could not be verified, so this score was not sent to a legacy leaderboard. Please try again when rankings reconnect.
YOUR NAME (OPTIONAL)
 TRY AGAIN
WEEKLY TOP 10
CLASSIC · LOADING · RESETS MON 00:00 UTC
CLASSIC
POWER
★ ALL-TIME LEGENDS
Connecting to rankings…
POWER MODE

Classic rules · survive as long as you can.

LOG IN · SIGN UP
ABOUT US
CONTACT
×
ACCOUNT CONFIRMATION
CONFIRMING
YOUR EMAIL...

Please wait while we verify

![实机图 5](/api/versions/v-5e42fa9dae22/specification-images/screenshots/step-4.png)

图 5：实际操作记录 5。画面文字：DON’T TOUCH
TIME
04.7
BEST
04.7
CONTACT DETECTED
YOU
DIED.
Couldn’t even survive the easy part.

You survived 4.7 seconds.
Best: 4.7 seconds. Ready again?

Season 1 status could not be verified, so this score was not sent to a legacy leaderboard. Please try again when rankings reconnect.
YOUR NAME (OPTIONAL)
 TRY AGAIN
WEEKLY TOP 10
CLASSIC · LOADING · RESETS MON 00:00 UTC
CLASSIC
POWER
★ ALL-TIME LEGENDS
Connecting to rankings…
POWER MODE

Classic rules · survive as long as you can.

LOG IN · SIGN UP
ABOUT US
CONTACT
×
ACCOUNT CONFIRMATION
CONFIRMING
YOUR EMAIL...

Please wait while we verify

![实机图 6](/api/versions/v-5e42fa9dae22/specification-images/screenshots/step-5.png)

图 6：实际操作记录 6。画面文字：DON’T TOUCH
TIME
00.0
BEST
04.7
A TINY SURVIVAL GAME
DON’T
TOUCH.

Move the green dot with your mouse.
On mobile, drag anywhere in the arena.

YOUR NAME (OPTIONAL)
 START RUN POWER MODE

Classic rules · survive as long as you can.

LOG IN · SIGN UP
WEEKLY TOP 10
CLASSIC · LOADING · RESETS MON 00:00 UTC
CLASSIC
POWER
★ ALL-TIME LEGENDS
Connecting to rankings…
ABOUT US
CONTACT
×
ACCOUNT CONFIRMATION
CONFIRMING
YOUR EMAIL...

Please wait while we verify your confirmation link.

×

ABOUT US

About DontTouch

DontTouch is a fast-paced browser survival game built around a simple challenge: don’t get

![实机图 7](/api/versions/v-5e42fa9dae22/specification-images/screenshots/step-6.png)

图 7：实际操作记录 7。画面文字：DON’T TOUCH
TIME
00.0
BEST
04.7
A TINY SURVIVAL GAME
DON’T
TOUCH.

Move the green dot with your mouse.
On mobile, drag anywhere in the arena.

YOUR NAME (OPTIONAL)
 START RUN POWER MODE

Classic rules · survive as long as you can.

LOG IN · SIGN UP
WEEKLY TOP 10
CLASSIC · LOADING · RESETS MON 00:00 UTC
CLASSIC
POWER
★ ALL-TIME LEGENDS
Connecting to rankings…
ABOUT US
CONTACT
×
ACCOUNT CONFIRMATION
CONFIRMING
YOUR EMAIL...

Please wait while we verify your confirmation link.

×

ABOUT US

About DontTouch

DontTouch is a fast-paced browser survival game built around a simple challenge: don’t get

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

main.js与index.html（运行包）；本轮证据：screenshots/step-0至step-6、startup.png，runtime步骤中localStorage dontTouchBest记录及storage_before_reload对比，结算界面降级提示文本。

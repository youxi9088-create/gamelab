# Last Minute 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Last Minute

**玩法类型**

解谜 / 密室逃脱（点击式）

**操作方式**

鼠标点击物件 → 检查/打开密码盘 → 游戏进行中；点击背包槽或按1/2 → 选中/收起对应道具 → 道具已在背包；数字键或点击密码盘 → 输入密码 → 密码盘打开时；Enter → 提交密码；Backspace → 删除一位；Escape → 关闭密码盘；H → 分层提示；M → 静音切换（以上均实机验证）

**视角与布局**

固定单房间正视视角，DOM热点覆盖在场景图上

**画面维度**

2D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

限时压力下的观察、推理与道具使用；错误操作直接扣时间，节奏紧张

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

鼠标点击物件 → 检查/打开密码盘 → 游戏进行中；点击背包槽或按1/2 → 选中/收起对应道具 → 道具已在背包；数字键或点击密码盘 → 输入密码 → 密码盘打开时；Enter → 提交密码；Backspace → 删除一位；Escape → 关闭密码盘；H → 分层提示；M → 静音切换（以上均实机验证）

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

三分钟倒计时内点击检查房间物件，串联线索得出两组4位密码，取得UV手电与黄铜钥匙并开门逃脱

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：BEGIN COUNTDOWN启动180秒倒计时；操作：点击热点收集线索，解书桌密码得UV手电，照画框读图形，结合通风口规则解保险箱得钥匙；结果：选中钥匙点击门则逃脱结算，倒计时归零则失败；继续：PLAY AGAIN/RESTART TIMER重开一局

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

线性线索链：停摆时钟10:35→书桌密码1035→获得UV手电→UV下画框显示三角/菱形/圆/方块→通风口提示“数角、圆算0”→保险箱密码3404→黄铜钥匙→开门

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：180秒内开门逃脱；成功条件：保险箱已开且选中黄铜钥匙后点击出口门；失败条件：倒计时归零；惩罚：每次错误密码扣5秒并震屏提示；结算显示剩余时间与错误次数（无分数公式）

**已验证流程与未覆盖范围**

实机验证：完整逃脱闭环、错误密码拒开抽屉、超时失败与重试、提示/静音键、刷新后回到开始界面且全程无外部请求；仅源码确认：无；未验证：无其他关卡（游戏仅含一个房间，已完整覆盖）

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定内容：1个房间、6个可交互热点（时钟、书桌、通风口、画框、保险箱、出口门）、2组固定密码、2件道具、分层提示文本；无程序生成内容

**场景、关卡与难度设计**

单房间固定布局，热点位置固定；线索相互依赖构成单链解谜，必须先书桌后保险箱再开门

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

倒计时系统（实时递减、30秒变红警示）；热点交互系统（按游戏状态返回不同文案）；密码盘系统（书桌与保险箱共用弹窗UI）；背包系统（两槽、点击或数字键选中、UV模式切换场景表现）；提示系统（按进度给出下一层线索）；音效系统（背景循环音乐、解锁/警报/按键音、静音开关）；结算与重开系统

**界面流程与反馈**

开始覆盖层（标题、玩法说明、BEGIN COUNTDOWN）→游戏HUD（房间编号、计时、当前目标、消息栏、背包、提示与静音按钮）→密码盘弹窗（4位输入、CLR/OK）→结算覆盖层（YOU ESCAPED/TIME EXPIRED、剩余时间或失败文案、PLAY AGAIN/RESTART TIMER）

**存档方式**

无存档机制：进度仅存当局内存；刷新后回到开始界面；实机确认localStorage/sessionStorage/IndexedDB全部为空；不保存任何进度

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-ab672fb4ebed/specification-images/screenshots/step-45.png)

图 1：实际操作记录 1。画面文字：LAST MINUTE
ROOM 01 / CONTAINMENT
01:39
?
×
CURRENT OBJECTIVE
Use the brass key on the exit door.
The safe is empty. The key is in your inventory.
INVENTORY
1
2
EXIT UNSEALED
YOU ESCAPED

You cleared the room with 01:39 remaining.

PLAY AGAIN
INCORRECT · −00:05

![实机图 2](/api/versions/v-ab672fb4ebed/specification-images/screenshots/step-46.png)

图 2：实际操作记录 2。画面文字：LAST MINUTE
ROOM 01 / CONTAINMENT
03:00
?
♪
CURRENT OBJECTIVE
Search the room for a way out.
Click objects to inspect them. Useful details are recorded automatically.
INVENTORY
1
2
SYSTEM LOCKDOWN
LAST MINUTE

A CONNECTED-CLUE ESCAPE ROOM

The door seals in three minutes. Inspect the room, connect the clues, and use what you find. Wrong codes cost 5 seconds.

CLICK · INSPECT
H · HINT
M · MUTE
BEGIN COUNTDOWN
INCORRECT · −00:05

![实机图 3](/api/versions/v-ab672fb4ebed/specification-images/screenshots/step-47.png)

图 3：实际操作记录 3。画面文字：LAST MINUTE
ROOM 01 / CONTAINMENT
03:00
?
♪
CURRENT OBJECTIVE
Search the room for a way out.
Click objects to inspect them. Useful details are recorded automatically.
INVENTORY
1
2
SYSTEM LOCKDOWN
LAST MINUTE

A CONNECTED-CLUE ESCAPE ROOM

The door seals in three minutes. Inspect the room, connect the clues, and use what you find. Wrong codes cost 5 seconds.

CLICK · INSPECT
H · HINT
M · MUTE
BEGIN COUNTDOWN
INCORRECT · −00:05

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

main.js逻辑（source-analysis/js-2.16.0-8dc00c51…/readable.js）；本轮runtime steps与截图：screenshots/step-45.png（YOU ESCAPED结算）、step-46/47.png（刷新后开始界面）；storage摘要刷新前后均为空

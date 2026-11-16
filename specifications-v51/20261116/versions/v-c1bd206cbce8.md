# Play Neon Apex - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play Neon Apex - Free Online Game | Rosebud

**玩法类型**

竞速 / 计时赛（Time Trial）

**操作方式**

W或↑ → 油门加速 → 比赛进行中
S或↓ → 刹车/低速倒车 → 比赛进行中
A/D或←/→ → 左右转向 → 比赛进行中
Space → 手刹快速甩尾 → 比赛进行中
BEGIN TIME TRIAL按钮 → 开始比赛 → 主菜单
OPTIONS & KEYBOARD/⚙ → 打开选项 → 任意界面
选项内点击绑定按钮后按任意键 → 改键并写入本地存档
♪按钮 → 静音/恢复音乐与引擎声

**视角与布局**

第三人称追尾视角，相机跟随车辆并随速度扩展视野

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

街机化易上手驾驶：转向/刹车/稳定辅助可开关，出界即减速，专注走线与刹车点。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

W或↑ → 油门加速 → 比赛进行中
S或↓ → 刹车/低速倒车 → 比赛进行中
A/D或←/→ → 左右转向 → 比赛进行中
Space → 手刹快速甩尾 → 比赛进行中
BEGIN TIME TRIAL按钮 → 开始比赛 → 主菜单
OPTIONS & KEYBOARD/⚙ → 打开选项 → 任意界面
选项内点击绑定按钮后按任意键 → 改键并写入本地存档
♪按钮 → 静音/恢复音乐与引擎声

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

在封闭赛道上进行两圈单人计时赛，掌握刹车区，目标总成绩快于01:20.000。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：主菜单点BEGIN TIME TRIAL→3-2-1倒计时；操作：沿赛道驾驶两圈，依次通过4个分段点；结果：完赛弹出SESSION COMPLETE结算，显示总成绩、与目标差值、最佳圈速及是否官方成绩；继续：RACE AGAIN可重开一局。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

单局进度为圈数1/2→2/2与最佳圈速；无跨局成长体系。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：两圈总时间≤01:20.000判定TARGET BEATEN，否则TIME RECORDED；每圈分4段，过分段点显示SECTOR n CLEAR，过终点记录LAP时间并更新BEST LAP；出赛道界限显示TRACK LIMITS警告并强制减速；启用任一驾驶辅助则该局记为PRACTICE RUN，不计官方纪录。

**已验证流程与未覆盖范围**

实机验证：启动菜单、倒计时起跑、两圈完整驾驶、分段/圈速/完赛结算、RACE AGAIN、选项开关、改键写入与两次刷新恢复、静音按钮；仅源码确认：官方/练习成绩判定文案、TARGET_BEATEN阈值01:20.000；未验证：达到TARGET BEATEN的获胜文案（本轮成绩05:48超出目标）。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定一条封闭赛道、固定两圈赛制、固定目标时间01:20.000；无程序生成关卡，无额外车辆或对手。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

对象：赛车（油门/刹车/转向/手刹物理）、赛道样条与分段点、HUD计时器；状态：menu→countdown→racing→finished；触发：分段点检测、圈数推进、完赛结算、出界减速；系统交互：辅助开关影响车辆操控与成绩资格，键位绑定实时生效并持久化。

**界面流程与反馈**

主菜单（标题/操作说明/开始/选项）→比赛HUD（圈数、总时间、最佳圈、车速、警告、分段提示、倒计时）→结算界面（成绩判定、最终时间、说明、RACE AGAIN）；选项界面含5个辅助开关与5个键位绑定，可从菜单或HUD齿轮打开。

**存档方式**

保存内容：仅自定义键位绑定（localStorage键velocity-bindings）；触发：选项中改键即写入；恢复：刷新后选项界面显示已改键位（实测油门改为I并两次刷新保留）；不保存：比赛成绩、最佳圈速，源码未见持久化。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-35.png)

图 1：实际操作记录 1。画面文字：LAP
1 / 2
TIME
01:09.750
BEST LAP
--:--.---
⚙
♪
SECTOR 3 CLEAR
TRACK LIMITS — SPEED REDUCED
GO
041
KM/H

![实机图 2](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-39.png)

图 2：实际操作记录 5。画面文字：LAP
2 / 2
TIME
01:57.283
BEST LAP
01:13.166
⚙
♪
LAP 1 // 01:13.166
TRACK LIMITS — SPEED REDUCED
GO
052
KM/H

![实机图 3](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-43.png)

图 3：实际操作记录 9。画面文字：LAP
2 / 2
TIME
03:31.333
BEST LAP
01:13.166
⚙
♪
SECTOR 1 CLEAR
TRACK LIMITS — SPEED REDUCED
GO
044
KM/H

![实机图 4](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-47.png)

图 4：实际操作记录 13。画面文字：LAP
2 / 2
TIME
04:52.299
BEST LAP
01:13.166
⚙
♪
SECTOR 2 CLEAR
TRACK LIMITS — SPEED REDUCED
GO
045
KM/H

![实机图 5](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-50.png)

图 5：实际操作记录 16。画面文字：LAP
2 / 2
TIME
04:56.350
BEST LAP
01:13.166
⚙
♪
SECTOR 3 CLEAR
TRACK LIMITS — SPEED REDUCED
GO
045
KM/H

![实机图 6](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-54.png)

图 6：实际操作记录 20。画面文字：LAP
2 / 2
TIME
05:48.666
BEST LAP
01:13.166
⚙
♪
SECTOR 3 CLEAR
TRACK LIMITS — SPEED REDUCED
GO
064
KM/H

![实机图 7](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-58.png)

图 7：实际操作记录 24。画面文字：LAP
1 / 2
TIME
00:00.000
BEST LAP
--:--.---
⚙
♪
SECTOR CLEAR
TRACK LIMITS — SPEED REDUCED
000
KM/H
CLOSED CIRCUIT // TIME TRIAL
VELOCITY
PROTOCOL

Two laps. No rivals. Master the braking zones and beat the 01:20.000 race target.

W / ↑ THROTTLE
S / ↓ BRAKE
A D / ← → STEER
SPACE HANDBRAKE
BEGIN TIME TRIAL
OPTIONS & KEYBOARD
DRIVING OPTIONS
CLOSE

Tune the assistance layer to your comfort. Driving assists preserve the same circuit and are always shown in the result; steering, braking, or stability help makes a lap practice-only. Camera and HUD accessibility options never affect record eligibilit

![实机图 8](/api/versions/v-c1bd206cbce8/specification-images/screenshots/step-62.png)

图 8：实际操作记录 28。画面文字：LAP
1 / 2
TIME
00:00.000
BEST LAP
--:--.---
⚙
♪
SECTOR CLEAR
TRACK LIMITS — SPEED REDUCED
000
KM/H
CLOSED CIRCUIT // TIME TRIAL
VELOCITY
PROTOCOL

Two laps. No rivals. Master the braking zones and beat the 01:20.000 race target.

W / ↑ THROTTLE
S / ↓ BRAKE
A D / ← → STEER
SPACE HANDBRAKE
BEGIN TIME TRIAL
OPTIONS & KEYBOARD

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

源码：main.js（startRace/handleCheckpoints/finishRace/键位绑定持久化）、index.html；运行证据：runtime steps含SECTOR 1-3 CLEAR、LAP 1 01:13.166、结算与localStorage条目velocity-bindings，截图screenshots/step-35至step-62。

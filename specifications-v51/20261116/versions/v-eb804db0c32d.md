# Play Shedoku - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play Shedoku - Free Online Game | Rosebud

**玩法类型**

益智解谜（数独）

**操作方式**

鼠标点击空格 → 选中格子 → 棋盘已生成（实机验证）
键盘1–9或点数字键 → 填入数字 → 已选中空格（实机验证）
方向键 → 移动选中格 → 已有选中格（界面提示确认）
⌫或CLEAR → 清除所选已填格 → 选中非给定格（界面提示确认）
M或SOUND按钮 → 切换静音 → 音频解锁后（界面提示确认）
难度按钮 → 切换难度并重开新题 → 无前置（仅源码确认）
NEW PUZZLE → 生成新题 → 无前置（仅源码确认）

**视角与布局**

固定平视界面，左侧情景插画、右侧棋盘面板

**画面维度**

2D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

英伦棚屋氛围的休闲数独：角色Knott陪伴吐槽，配SHED FM电子乐与随机器情景小事件

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

鼠标点击空格 → 选中格子 → 棋盘已生成（实机验证）
键盘1–9或点数字键 → 填入数字 → 已选中空格（实机验证）
方向键 → 移动选中格 → 已有选中格（界面提示确认）
⌫或CLEAR → 清除所选已填格 → 选中非给定格（界面提示确认）
M或SOUND按钮 → 切换静音 → 音频解锁后（界面提示确认）
难度按钮 → 切换难度并重开新题 → 无前置（仅源码确认）
NEW PUZZLE → 生成新题 → 无前置（仅源码确认）

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

在9×9数独棋盘上选格并填入1–9，遵循行列宫不重复规则完成题目

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：自动生成当前难度题目；操作：选格填数，对错即时反馈；结果：正确填入加分并更新最高分，错误标红可改；继续：继续填同一题，刷新后分数与最高分恢复、题目重新生成

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

题号随已完成数递增，默认难度随完成数提升；累计分数、最高分与最佳时间跨局保留（最佳时间记录未实机验证）

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：填满全部空格且每行每列每宫1–9不重复；成功：完成整盘（未实机完成）；失败：无硬失败，错误填入标红且可修改；计分：正确填入加分（实证单题内10→22），具体公式与连击阈值未确认

**已验证流程与未覆盖范围**

实机验证：无输入启动、选格、错误填入红字反馈、两次正确填入与计分、角色表情反馈、存档记录变化、刷新后分数恢复；仅源码确认：唯一解生成、难度切换重开、音乐轮换；未验证：完成整盘、最佳时间写入、高档位难度、音频实际播放

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定数量：4档难度（EASY/MEDIUM/HARD/EXPERT）；程序生成：棋盘题目由生成器实时产出，Easy界面标注36个空格；无固定关卡表

**场景、关卡与难度设计**

无手工关卡，程序生成；难度通过空格数量区分，Easy为36空（界面实证），其余档位具体空格数未确认

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

题目生成与唯一解校验系统；格子选中与行列宫/同数高亮；正误判定与红绿反馈；计分与连击；计时；本地存档；Knott情景事件系统（干扰弹窗、茶杯、烟灰缸互动）；SHED FM音乐轮换与音量/静音控制

**界面流程与反馈**

主界面：左栏标题、PB、收音机与角色，右栏难度、计时/分数/最高分/已解、棋盘、数字键盘与状态行；干扰事件以弹窗覆盖，点Back to Sudoku返回棋盘

**存档方式**

保存内容：完成数、最佳时间、分数、最高分、所选难度；触发：正确填入与切换难度时写入localStorage；恢复：刷新后分数与最高分恢复（实机验证）；不保存：进行中的棋盘与计时（刷新后生成新题）

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
😤
I have nearly got this. Probably.
DISTRACTION!

Is this the fun phone game with all the little squares?

Knott: It’s a puzzle. There are rules. Sort of.

Back to Sudoku
The rain has started absolutely hammering down.
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
1:34
SCORE
0
HIGH SCORE
0
SOLVED
0
Personal best time: — · Easy · Puzzle 1
3
1
6
1
6
8
7
3
9
9
2
3
4
8
1
7
6
4
2
5
3
9
8
1
7
4
6
9
7
3
2
5
7
9
3
6
1
9
6
2
4
9
2
7
8
1
2
3
4
5
6
7
8
9
⌫ CLEAR
E

![实机图 2](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-1.png)

图 2：实际操作记录 2。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
😤
I have nearly got this. Probably.
DISTRACTION!

Is this the fun phone game with all the little squares?

Knott: It’s a puzzle. There are rules. Sort of.

Back to Sudoku
The rain has started absolutely hammering down.
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
1:34
SCORE
0
HIGH SCORE
0
SOLVED
0
Personal best time: — · Easy · Puzzle 1
3
1
6
1
6
8
7
3
9
9
2
3
4
8
1
7
6
4
2
5
3
9
8
1
7
4
6
9
7
3
2
5
7
9
3
6
1
9
6
2
4
9
2
7
8
1
2
3
4
5
6
7
8
9
⌫ CLEAR
E

![实机图 3](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-2.png)

图 3：实际操作记录 3。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
😖
That's definitely not right.
DISTRACTION!

Is this the fun phone game with all the little squares?

Knott: It’s a puzzle. There are rules. Sort of.

Back to Sudoku
The rain has started absolutely hammering down.
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
1:36
SCORE
0
HIGH SCORE
0
SOLVED
0
Personal best time: — · Easy · Puzzle 1
5
3
1
6
1
6
8
7
3
9
9
2
3
4
8
1
7
6
4
2
5
3
9
8
1
7
4
6
9
7
3
2
5
7
9
3
6
1
9
6
2
4
9
2
7
8
1
2
3
4
5
6
7
8
9
⌫ CLEAR
That

![实机图 4](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-3.png)

图 4：实际操作记录 4。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
🤓
That was obvious.
DISTRACTION!

Is this the fun phone game with all the little squares?

Knott: It’s a puzzle. There are rules. Sort of.

Back to Sudoku
The rain has started absolutely hammering down.
KNOTT! I can hear that radio!
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
3:24
SCORE
10
HIGH SCORE
10
SOLVED
0
Personal best time: — · Easy · Puzzle 1
7
3
1
6
1
6
8
7
3
9
9
2
3
4
8
1
7
6
4
2
5
3
9
8
1
7
4
6
9
7
3
2
5
7
9
3
6
1
9
6
2
4
9
2
7
8
1
2
3
4
5

![实机图 5](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-5.png)

图 5：实际操作记录 6。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
✨
Absolute genius.
DISTRACTION!

Is this the fun phone game with all the little squares?

Knott: It’s a puzzle. There are rules. Sort of.

Back to Sudoku
The rain has started absolutely hammering down.
KNOTT! I can hear that radio!
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
3:25
SCORE
22
HIGH SCORE
22
SOLVED
0
Personal best time: — · Easy · Puzzle 1
7
3
1
6
1
6
8
7
3
9
9
2
3
4
8
1
8
7
6
4
2
5
3
9
8
1
7
4
6
9
7
3
2
5
7
9
3
6
1
9
6
2
4
9
2
7
8
1
2
3
4

![实机图 6](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-6.png)

图 6：实际操作记录 7。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
✨
Absolute genius.
DISTRACTION!

Is this the fun phone game with all the little squares?

Knott: It’s a puzzle. There are rules. Sort of.

Back to Sudoku
The rain has started absolutely hammering down.
KNOTT! I can hear that radio!
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
3:26
SCORE
22
HIGH SCORE
22
SOLVED
0
Personal best time: — · Easy · Puzzle 1
7
3
1
6
1
6
8
7
3
9
9
2
3
4
8
1
8
7
6
4
2
5
3
9
8
1
7
4
6
9
7
3
2
5
7
9
3
6
1
9
6
2
4
9
2
7
8
1
2
3
4

![实机图 7](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-7.png)

图 7：实际操作记录 8。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
DISTRACTION!

Back to Sudoku
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
0:06
SCORE
22
HIGH SCORE
22
SOLVED
0
Personal best time: — · Easy · Puzzle 1
3
2
1
9
8
7
5
7
4
3
1
9
5
6
1
7
1
8
9
3
7
6
7
9
1
4
9
3
6
5
9
8
4
6
2
1
2
6
9
8
4
5
8
2
7
1
2
3
4
5
6
7
8
9
⌫ CLEAR
Easy puzzle: 36 empty squares.
Keys 1–9 · arrows move · ⌫ clears · M mutes
Ready when you are, Knott.

![实机图 8](/api/versions/v-eb804db0c32d/specification-images/screenshots/step-8.png)

图 8：实际操作记录 9。画面文字：SHEDOKU

SUDOKU IN THE SHED

Puzzles: 0 · PB: —
♫ SHED FM · 1999
SOUND ON
MUSIC
SFX
SHED FM
98.6
☕
DISTRACTION!

Back to Sudoku
MUM SAID DO SOMETHING USEFUL
SHEDOKU
NEW PUZZLE ↻
DIFFICULTY
EASY
MEDIUM
HARD
EXPERT
TIME
0:09
SCORE
22
HIGH SCORE
22
SOLVED
0
Personal best time: — · Easy · Puzzle 1
3
2
1
9
8
7
5
7
4
3
1
9
5
6
1
7
1
8
9
3
7
6
7
9
1
4
9
3
6
5
9
8
4
6
2
1
2
6
9
8
4
5
8
2
7
1
2
3
4
5
6
7
8
9
⌫ CLEAR
Easy puzzle: 36 empty squares.
Keys 1–9 · arrows move · ⌫ clears · M mutes
Ready when you are, Knott.

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

main.js（题目生成、存档读写、渲染与反馈逻辑）；index.html（界面结构）；runtime运行报告steps与screenshots/startup.png、step-0至step-8；localStorage键shedoku内容哈希随计分更新且刷新后保留

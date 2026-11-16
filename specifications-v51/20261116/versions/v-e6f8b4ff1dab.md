# No Limit Poker 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：No Limit Poker

**玩法类型**

棋牌 / 德州扑克

**操作方式**

鼠标点击“Fold”弃牌 → 立即结束本手参与
鼠标点击“Call $X”跟注 → 投入等额筹码继续
鼠标点击“Raise to $X”加注 → 拖动滑块或点击预设按钮调整金额后确认
鼠标点击“All in”全押 → 投入全部筹码
鼠标点击顶部“$ / BB” → 切换筹码显示单位
鼠标点击“Online tables / Solo practice” → 切换在线/单人模式

**视角与布局**

俯视固定视角（扑克桌平面图）

**画面维度**

2D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

以练习为主的solo牌桌，也可进入在线俱乐部参与每周重置的虚拟筹码排行。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

鼠标点击“Fold”弃牌 → 立即结束本手参与
鼠标点击“Call $X”跟注 → 投入等额筹码继续
鼠标点击“Raise to $X”加注 → 拖动滑块或点击预设按钮调整金额后确认
鼠标点击“All in”全押 → 投入全部筹码
鼠标点击顶部“$ / BB” → 切换筹码显示单位
鼠标点击“Online tables / Solo practice” → 切换在线/单人模式

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

无限制德州扑克现金局，玩家在8人桌与AI对手进行押注、跟注、加注、弃牌等决策，争夺底池筹码。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

1. 进入主菜单选择Play solo或Back to solo table；2. 系统发牌并进入Preflop；3. 玩家轮到自己时选择Fold/Call/Raise；4. AI依次行动， Streets依次推进（Flop→Turn→River）；5. 到达Showdown或仅剩一家时结算底池；6. 自动进入下一手并保存当前桌状态。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

以虚拟筹码数量作为当前对局进度，每周（在线模式）重置为$1,000；solo模式通过localStorage持久化当前桌状态。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：在每手中通过最佳五张牌组合或迫使对手弃牌赢得底池。成功：摊牌牌力最大或对手全部弃牌。失败：弃牌或摊牌牌力较小失去已下注筹码。计分：筹码余额变化，本局未验证额外计分公式。

**已验证流程与未覆盖范围**

实机验证：启动、solo模式进入、玩家操作响应、 Streets推进、底池与余额更新、刷新后存档恢复。仅源码确认：胜负判定与AI策略细节。未验证：在线多人模式、每周排行榜、完整一手从发牌到Showdown的全程操作。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

单一扑克桌场景；固定8名AI对手（不同头像与姓名）；牌局无限循环，无传统关卡。

**场景、关卡与难度设计**

无多关卡设计，仅一张8人扑克桌，通过不断发牌形成持续对局。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

牌局引擎：管理发牌、 Streets、底池、边池与胜负判定；AI系统：8名bot按预设策略行动；UI系统：根据牌局状态渲染按钮、提示、余额与动画；存档系统：将solo桌序列化写入localStorage并通过SDK回传。

**界面流程与反馈**

主界面：标题、模式切换、Join a Game（在线，离线不可用）、solo对手数选择、Play solo/Back to solo table按钮；牌桌界面：顶部盲注/模式/座位数、中央公共牌与底池、周围玩家头像与筹码、底部操作面板与快捷动作；结算提示：Hand results弹层显示赢家与金额。

**存档方式**

通过localStorage的gamelab-remix:/与holdem-hero:solo-v1:local键保存solo牌局序列化状态；刷新后可通过“Back to solo table”按钮恢复至最近一手。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Online tables
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
SOLO · 8 / 8 SEATED

SOLO PRACTICE

Shuffling up.

Your next hand is being dealt.

The table is ready. Dealing shortly…
TAB HOLD FOR ALL BALANCES
SOLO TABLE · PRACTICE
SOLO TABLE
SOUND ON
Waiting for players.
The first hand starts with two players.

![实机图 2](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-1.png)

图 2：实际操作记录 2。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Online tables
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
SOLO · 8 / 8 SEATED
POT:
$7
▾
Hand 1 · $2 / $5 no-limit hold’em
TAB HOLD FOR ALL BALANCES
HAND 001 · PREFLOP
SOLO TABLE
SOUND ON

QUICK ACTIONS · set before your turn

Fold
Call $5
Call any

![实机图 3](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-3.png)

图 3：实际操作记录 4。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Online tables
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
SOLO · 8 / 8 SEATED
Hand results
▾
Mateo wins $12
TAB HOLD FOR ALL BALANCES
HAND 001 · SHOWDOWN
SOLO TABLE
SOUND ON
The pot has spoken.
The next hand begins shortly.

![实机图 4](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-4.png)

图 4：实际操作记录 5。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Solo practice
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
THE CLUB · 4 TABLES
Pull up a chair.

Everyone starts the week with $1,000 and the biggest stack when it ends is crowned champion.

Join a Game

Online tables need a connection to Remix.

OR PRACTICE SOLO
−
7 opponents
+
Back to solo table
Online tables need a connection to Remix.
TAB HOLD FOR WEEKLY STANDINGS
THE CLUB · WEEKLY STANDINGS
OFFLINE
SOUND ON
Join the club.
Four tables, one weekly leaderboard.

![实机图 5](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-5.png)

图 5：实际操作记录 6。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Solo practice
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
THE CLUB · 4 TABLES
Pull up a chair.

Everyone starts the week with $1,000 and the biggest stack when it ends is crowned champion.

Join a Game

Online tables need a connection to Remix.

OR PRACTICE SOLO
−
7 opponents
+
Back to solo table
Online tables need a connection to Remix.
TAB HOLD FOR WEEKLY STANDINGS
THE CLUB · WEEKLY STANDINGS
OFFLINE
SOUND ON
Join the club.
Four tables, one weekly leaderboard.

![实机图 6](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-6.png)

图 6：实际操作记录 7。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Online tables
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
SOLO · 8 / 8 SEATED
POT:
$7
▾
Hand 3 · $2 / $5 no-limit hold’em
TAB HOLD FOR ALL BALANCES
HAND 003 · PREFLOP
SOLO TABLE
SOUND ON

QUICK ACTIONS · set before your turn

Fold
Call $5
Call any

![实机图 7](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-8.png)

图 7：实际操作记录 9。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Online tables
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
SOLO · 8 / 8 SEATED
POT:
$52
▾
Hand 3 · $2 / $5 no-limit hold’em
TAB HOLD FOR ALL BALANCES
HAND 003 · PREFLOP
SOLO TABLE
SOUND ON
Watch the action.
Kaito is thinking…

![实机图 8](/api/versions/v-e6f8b4ff1dab/specification-images/screenshots/step-9.png)

图 8：实际操作记录 10。画面文字：♠
No Limit Poker

FOUR TABLES. ONE WEEKLY CHAMPION.

$
BB
Online tables
☰
NO LIMIT HOLD’EM
$2 / $5 BLINDS
SOLO · 8 / 8 SEATED
POT:
$52
▾
Flop
TAB HOLD FOR ALL BALANCES
HAND 003 · FLOP
SOLO TABLE
SOUND ON
Watch the action.
Tova is thinking…

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

runtime steps 0-9及对应截图；localStorage中gamelab-remix:/与holdem-hero:solo-v1:local条目在刷新前后均存在且内容哈希变化；源码readable.js中saveSolo/writeAccountSave/playSolo相关逻辑。

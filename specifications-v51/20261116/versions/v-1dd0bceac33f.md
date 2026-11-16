# Play Clear It! - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play Clear It! - Free Online Game | Rosebud

**玩法类型**

益智解谜（箭头路径消除）

**操作方式**

点击/触摸箭支 → 尝试发射该箭 → 路径通畅即消除，被阻则抖动提示；键盘：聚焦棋盘后 ←/→ 或 ↑/↓ 切换选中箭 → Enter/空格 发射；HOW TO PLAY 按钮 → 显示规则与当前通畅箭数量；NEW BOARD 按钮 → 重新生成当前关棋盘；Music/Rain/Fire 按钮 → 开关对应环境音层。

**视角与布局**

俯视固定棋盘视角

**画面维度**

2D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

温馨氛围中的观察判断解谜：识别通畅路径逐支消除，被阻时获得提示重试，无失败惩罚。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

点击/触摸箭支 → 尝试发射该箭 → 路径通畅即消除，被阻则抖动提示；键盘：聚焦棋盘后 ←/→ 或 ↑/↓ 切换选中箭 → Enter/空格 发射；HOW TO PLAY 按钮 → 显示规则与当前通畅箭数量；NEW BOARD 按钮 → 重新生成当前关棋盘；Music/Rain/Fire 按钮 → 开关对应环境音层。

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

观察棋盘上发光箭头的朝向，点选路径通畅（前方无其他箭阻挡、可直达边缘）的箭将其发射消除；全部清除后过关并自动进入下一关。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：载入即生成当前关棋盘；操作：逐一点击通畅箭消除并得分（每箭 60+8×关卡）；结果：清空棋盘获得 100+20×关卡 奖励并提示结算；继续：约1.8秒后自动生成下一关更大棋盘继续。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

关卡数与积分持续增长，棋盘支数随关卡递增；通关即自动进入下一关，无解锁或分支。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：清空棋盘全部箭支。成功：点击的箭前方射线无其他箭阻挡即可飞出消除；失败：无失败状态，被阻仅提示不扣分。计分：单箭 60+8×关卡，过关奖励 100+20×关卡（第1关实证 +120）。棋盘规模：8支起，每3关+1支，上限14支；每关保证存在通畅箭且整体可解。

**已验证流程与未覆盖范围**

实机验证：启动加载、点击消除、被阻提示、计分递增、过关结算、自动进入第2关、音效开关与按钮可用、刷新后关卡积分恢复、三阶段导航检查点全部通过。仅源码确认：棋盘规模公式、四类布局轮换、计分公式、保存字段。未验证：第3关及以后的更高关卡与上限规模、音效实际听感。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

无固定关卡库：棋盘按四类布局程序化生成并记录已见布局哈希避免重复；音频资源为本地音乐、雨声、炉火与过关和弦；关卡数量无上限（难度随关卡递增封顶14支）。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

棋盘生成系统：按关卡轮换环形/网格/螺旋/缺环四类布局，候选需通过几何校验与可解性搜索，失败时退化为保证可玩的外向布局；阻挡判定系统：以箭头射线与其他箭杆/箭头的碰撞判定通畅；计分与关卡系统；氛围音频系统：音乐/雨声/炉火三层独立开关，首次点击解锁播放；粒子与动效反馈系统。

**界面流程与反馈**

单屏界面：顶部标题与三个音效开关，ROUND/POINTS 面板，中央棋盘含进度条与剩余箭数，底部 HOW TO PLAY 与 NEW BOARD 按钮，底部状态栏输出操作反馈。过关时状态栏显示奖励后自动切新棋盘，无独立结算页。

**存档方式**

保存内容：当前关卡、积分、已见棋盘哈希、生成序列号；触发：每关生成与过关时写入 localStorage，页面隐藏时亦保存；恢复：刷新后读取并恢复到对应关卡与积分（实证刷新后回到第2关1072分）；不保存：进行中的半局棋盘状态，刷新后按当前关卡重新生成棋盘。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-25.png)

图 1：实际操作记录 1。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
01
POINTS
476
FIND AN OPEN PATH
7 arrows left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

A little more breathing room.

![实机图 2](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-27.png)

图 2：实际操作记录 3。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
01
POINTS
612
FIND AN OPEN PATH
5 arrows left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

One path opens.

![实机图 3](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-29.png)

图 3：实际操作记录 5。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
01
POINTS
612
FIND AN OPEN PATH
5 arrows left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

That path is blocked for now. Try a different arrow.

![实机图 4](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-31.png)

图 4：实际操作记录 7。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
01
POINTS
612
FIND AN OPEN PATH
5 arrows left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

That path is blocked for now. Try a different arrow.

![实机图 5](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-32.png)

图 5：实际操作记录 8。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
01
POINTS
680
FIND AN OPEN PATH
4 arrows left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

Smoothly cleared.

![实机图 6](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-34.png)

图 6：实际操作记录 10。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
01
POINTS
748
FIND AN OPEN PATH
3 arrows left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

A little more breathing room.

![实机图 7](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-36.png)

图 7：实际操作记录 12。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
01
POINTS
884
FIND AN OPEN PATH
1 arrow left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

One path opens.

![实机图 8](/api/versions/v-1dd0bceac33f/specification-images/screenshots/step-38.png)

图 8：实际操作记录 14。画面文字：Clear It!
♫
Music
☂
Rain
♨
Fire
ROUND
02
POINTS
1,072
FIND AN OPEN PATH
8 arrows left
Keyboard: focus the puzzle board, use the left or right arrow keys to choose an arrow, then press Enter to launch it.
✦
HOW TO PLAY
↻
NEW BOARD

Tap an arrow with a clear path to the edge.

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

源码 main.js（棋盘生成、阻挡判定、计分、保存逻辑）与本轮运行报告 verification/89b528fb-ee7d-42b6-bb39-d0473c341c4c-web-play.json 及 screenshots/step-25 至 step-38。

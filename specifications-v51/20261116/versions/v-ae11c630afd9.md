# BALL BONK 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：BALL BONK

**玩法类型**

多人/单人休闲竞技网页游戏（ clay / toy 风格 3D 竞技场击球淘汰）

**操作方式**

键盘：A/D 或 ←/→ 左右移动，Space 抓取/投掷，Esc 暂停/恢复；触屏：按住 ◀/▶ 移动，点击 BONK 抓取/投掷。

**视角与布局**

俯视固定视角（等距/微透视），竞技场四角/四边各一名角色

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

快节奏、卡通黏土风格的轻竞技派对游戏，强调移动走位、抓投时机与防御反击。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

键盘：A/D 或 ←/→ 左右移动，Space 抓取/投掷，Esc 暂停/恢复；触屏：按住 ◀/▶ 移动，点击 BONK 抓取/投掷。

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

四名“Bonker”在方形竞技场中守护各自球门，用载具撞击、抓取并投掷球体，将球打进对手球门使其扣血；HP归零即淘汰，最后存活的玩家获胜。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

1) 主菜单选择 SINGLE PLAYER；2) 角色选择（4选1）与命名；3) 地图选择（5选1）；4) 3秒倒计时后进入对局；5) 移动、击球、防守、扣血、淘汰；6) 最后存活者触发结算，显示得分明细；7) PLAY AGAIN 重开本局或返回主菜单。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

单局内进度：HP 15→0 淘汰、进球数、实时得分；跨局无角色升级、解锁或战役进度，属于街机式单场循环。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：成为最后存活的 Bonker。成功：其他三名角色全部淘汰。失败：自身 HP 归零。计分公式（单机）：进球得分 Bn×1000 + 剩余 HP×200 + 胜利奖励 5000（若获胜）。

**已验证流程与未覆盖范围**

实机验证：启动、主菜单、角色/地图选择、花园与沙漠两场完整对局、移动/抓投/击球/扣血/淘汰/胜负结算、暂停/恢复、再玩一次、页面刷新、390×844竖屏。源码确认：地图列表、角色定义、计分公式、HP与球体系统。未验证：在线多人对战、后3张地图实机、TOY FACTORY/VOLCANO/SNOW 特殊机制（若有）。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定内容：5张竞技场地图、4名可玩角色、单局玩法；无程序生成关卡或叙事内容。

**场景、关卡与难度设计**

5张固定竞技场：CLAY GARDEN、CLAY DESERT、CLAY SNOW、CLAY TOY FACTORY、CLAY VOLCANO；每张地图有独立天空、雾、地面色调与装饰元素；已实机验证前两张。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

对象系统：4名玩家角色（含本地/CPU状态、HP、alive、holding等）；球体系统：多球管理（active/held/ignore/lastHit）；球门/发射器系统：li[] 控制球的生成与充能；物理/碰撞系统：Three.js 场景内基于位置与速度的简化物理；AI系统：CPU 在 play 阶段由 qd() 驱动；网络系统：RemixSDK 在线房间（本验证仅使用本地单机分支）。

**界面流程与反馈**

主菜单（SINGLE PLAYER / PLAY WITH FRIENDS）→ 角色选择（名称输入、左右切换、NEXT）→ 地图选择（5张地图、START MATCH）→ HUD（角色卡、HP、SCORE、球数、NEXT BALL、操作提示）→ 暂停面板（RESUME/MAIN MENU）→ 结算面板（胜者、得分明细、PLAY AGAIN/MAIN MENU）。

**存档方式**

游戏本体不调用 saveGameState/持久化存档；local-host.js 仅在 gameOver 时接收本局分数并展示“再玩一次”弹窗。刷新页面后回到主菜单，重新开始新单局。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：CHOOSE YOUR BONKER
YOUR NAME  PLAYER 1
ZIGGY
RIDES THE BUZZ BUMPER
Hyper antenna-bug pilot. Goggles on, scarf flapping, claw ready to grab.
SPEED
POWER
STYLE
◀
▶
ZIGGY
LUMPY
BOPSY
GRITTY
◀ BACK
NEXT ▶

![实机图 2](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-3.png)

图 2：实际操作记录 4。画面文字：PLAYER 1
P1 ▼
HP13
ELIMINATED
LUMPY
P2 ▲
HP14
ELIMINATED
BOPSY
P3 ◀
HP15
ELIMINATED
GRITTY
P4 ▶
HP13
ELIMINATED
SCORE 2,600
● × 0
NEXT BALL 6
A / D or ◀ ▶ MOVE  ·  SPACE: GRAB · THROW  ·  ESC PAUSE
-1 HP

![实机图 3](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-6.png)

图 3：实际操作记录 7。画面文字：PLAYER 1
P1 ▼
HP0
ELIMINATED
LUMPY
P2 ▲
HP11
ELIMINATED
BOPSY
P3 ◀
HP11
ELIMINATED
GRITTY
P4 ▶
HP8
ELIMINATED
SCORE 3,000
● × 3
NEXT BALL 7
A / D or ◀ ▶ MOVE  ·  SPACE: GRAB · THROW  ·  ESC PAUSE

![实机图 4](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-9.png)

图 4：实际操作记录 10。画面文字：PLAYER 1
P1 ▼
HP15
ELIMINATED
LUMPY
P2 ▲
HP15
ELIMINATED
BOPSY
P3 ◀
HP15
ELIMINATED
GRITTY
P4 ▶
HP15
ELIMINATED
SCORE 3,000
● × 1
NEXT BALL 25
A / D or ◀ ▶ MOVE  ·  SPACE: GRAB · THROW  ·  ESC PAUSE

![实机图 5](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-12.png)

图 5：实际操作记录 13。画面文字：CHOOSE YOUR BONKER
YOUR NAME  PLAYER 1
ZIGGY
RIDES THE BUZZ BUMPER
Hyper antenna-bug pilot. Goggles on, scarf flapping, claw ready to grab.
SPEED
POWER
STYLE
◀
▶
ZIGGY
LUMPY
BOPSY
GRITTY
◀ BACK
NEXT ▶

![实机图 6](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-15.png)

图 6：实际操作记录 16。画面文字：PLAYER 1
P1 ▼
HP15
ELIMINATED
LUMPY
P2 ▲
HP15
ELIMINATED
BOPSY
P3 ◀
HP15
ELIMINATED
GRITTY
P4 ▶
HP15
ELIMINATED
SCORE 3,000
● × 1
NEXT BALL 28
A / D or ◀ ▶ MOVE  ·  SPACE: GRAB · THROW  ·  ESC PAUSE

![实机图 7](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-18.png)

图 7：实际操作记录 19。画面文字：PLAYER 1
P1 ▼
HP12
ELIMINATED
LUMPY
P2 ▲
HP14
ELIMINATED
BOPSY
P3 ◀
HP12
ELIMINATED
GRITTY
P4 ▶
HP11
ELIMINATED
SCORE 2,400
● × 2
NEXT BALL 19
A / D or ◀ ▶ MOVE  ·  SPACE: GRAB · THROW  ·  ESC PAUSE

![实机图 8](/api/versions/v-ae11c630afd9/specification-images/screenshots/step-21.png)

图 8：实际操作记录 22。画面文字：PLAYER 1
P1 ▼
HP0
ELIMINATED
LUMPY
P2 ▲
HP1
ELIMINATED
BOPSY
P3 ◀
HP0
ELIMINATED
GRITTY
P4 ▶
HP0
ELIMINATED
SCORE 3,000
● × 4
NEXT BALL 30
LUMPY
LAST PLAYER STANDING!
MATCH SCORE BREAKDOWN
GOALS SCORED (3)
+3,000 PTS
REMAINING HP (0 / 15)
+0 PTS
VICTORY BONUS
+0 PTS
FINAL SCORE
3,000 PTS
PLAY AGAIN
MAIN MENU
本局结束

得分：3000

再玩一次

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

源码文件 index.html（主程序，含 $i 地图数组、et 角色表、Gx/Vx/Wx 状态快照、op 结算、hp 渲染循环）；local-host.js（本地 Remix SDK stub，gameOver/再玩一次弹窗）。本轮证据：runtime.steps 0-21 截图与文本、screenshots/step-*.png。

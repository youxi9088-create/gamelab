# Coffin Coaster on Remix – Play Now & Create Your Own Games 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Coffin Coaster on Remix – Play Now & Create Your Own Games

**玩法类型**

3D · 过山车特技竞速

**操作方式**

W/Sthrottlebrake,A/Dsteer,Spacehop,ShiftNitro,Rcheckpoint; airborneWSflip/ADspin/QEroll; Escpause; titlemaps/riders.

**视角与布局**

第三人称追尾视角

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

卡通哥特风格的快节奏特技竞速，强调速度感、连续特技得分、赛道起伏与隧道翻转带来的视觉冲击

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

W/Sthrottlebrake,A/Dsteer,Spacehop,ShiftNitro,Rcheckpoint; airborneWSflip/ADspin/QEroll; Escpause; titlemaps/riders.

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

Originalfour-maprocketcoffin/trackdriving/airflip/combo/orb/solo and3AIrace. ActualSnowycomplete69.3s37631fourth only.

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：主菜单选择地图/载具/模式 → 操作：驾驶穿越赛道，收集ORB、触发加速垫、完成特技 → 结果：根据时间、得分、收集物生成本局成绩 → 继续：返回菜单或再玩一次

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

单局内通过收集光球和特技动作累积分数与连击倍率；跨局高分记录由本地存储保存，具体排行榜或成就系统未验证

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：在赛道中获得尽可能高的分数并尽量收集全部ORB；成功：完成赛道或超越PAR时间获得好成绩；失败：坠毁或速度过低可通过R重生；得分公式=基础分×连击倍率，具体阈值未验证；PAR 1:50为实机观察

**已验证流程与未覆盖范围**

退役RemixSDK、联机房间/匹配/模拟器/全局成绩提交和宿主服务，不伪造SDK或奖励；原个人状态形状适配localStorage，原结算继续回原标题，延后一任务避免同一Enter穿透。保留2251个函数/方法语义SHA（含内置THREE及原物理/赛道/计分/AI/输入/结算），仅六个SDK边界/个人存储方法变动。实际Haunted Carnival单人驾驶/翻转/光球14of50/12905分/R检查点/暂停/EndGame，雪地图Pumpkin三AI原完整完赛1:09.3、37598原基础+33时间=37631、第四名、19of35、0碰撞、1完美落地、4of4加速垫/1of1螺旋和翻转隧道，三AI真实成绩可见；不宣称冠军或全光球。该自然完赛发生于继续键延后修复之前，2251保留方法包括物理计分结算未变，旧网络/截图保留。最终包独立完整启动/雪图三AI/15260分12of35/手动EndGame回原标题/重载，25与35音量、Snowy地图与Pumpkin角色刷新恢复；不宣称最终回调版本重新自然完赛或本地高分持久化。未验证其余两图/全部角色/全特技/移动听觉。原四图/原AI/物理/计分/奖励保持，无服务器联机、无伪榜单。最终6请求无外部/失败/HTTP错误/异常/控制台错误/截断。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

已验证：Haunted Carnival地图、Bones/Rocket Coffin载具、RIDE SOLO模式、RACE THE DEAD模式入口；完整关卡数量、可解锁内容、商店项目未验证

**场景、关卡与难度设计**

过山车式起伏木质轨道，包含陡坡、环形/翻转隧道（Topsy-Turvy Tunnel）、Boost Pad加速区、可收集光球、黄昏天空与摩天轮背景

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

物理驾驶系统：载具受重力、加速度和赛道曲率影响；氮气系统：Shift触发加速，NITRO HUD显示余量；连击倍率系统：连续特技维持倍率条，中断则重置；收集系统：ORB计数与分数加成；检查点系统：R重生至最近检查点；UI HUD系统：实时显示分数、时间、速度、倍率、收集进度

**界面流程与反馈**

主菜单：显示标题、当前地图Haunted Carnival、当前载具Bones Rocket Coffin、模式选择按钮RIDE SOLO/RACE THE DEAD、帮助按钮？；玩法HUD：顶部SCORE/TIME/PAR、左侧倍率条、右侧ORB进度、底部速度/氮气/暂停；结算：local-host.js提供gameOver覆盖层显示得分与再玩一次按钮（源码确认）

**存档方式**

Originalpersonalstate shape localStorage, actualmapSnowy/riderPumpkin/music25/sfx35refresh. No midrace orhighscorepersistenceclaim.

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：SCORE
0
0
x1
0:00.000
PAR 1:50
ORBS 0/50
58
KM/H
NITRO
HOLD W TO ACCELERATE · AD STEER
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn

![实机图 2](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-1.png)

图 2：实际操作记录 2。画面文字：SCORE
3,675
3,675
x3.5
Boost Pad
0:22.749
PAR 1:50
ORBS 5/50
29
KM/H
NITRO
CHAIN TRICKS BEFORE THE BAR RUNS OUT FOR A BIGGER MULTIPLIER
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn

![实机图 3](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-2.png)

图 3：实际操作记录 3。画面文字：SCORE
3,675
300
x1
Boost Pad
0:27.882
PAR 1:50
ORBS 5/50
141
KM/H
NITRO
KEEP YOUR SPEED UP FOR THE LOOP
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn

![实机图 4](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-3.png)

图 4：实际操作记录 4。画面文字：SCORE
25,891
4,200
x1.5
Boost Pad
Topsy-Turvy
1:29.796
PAR 1:50
ORBS 5/50
108
KM/H
NITRO
TOPSY-TURVY TUNNEL — HOLD ON!
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn
COMBO BANKED+4,200

![实机图 5](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-5.png)

图 5：实际操作记录 6。画面文字：SCORE
25,891
900
x2
1:33.664
PAR 1:50
ORBS 8/50
159
KM/H
NITRO
TOPSY-TURVY TUNNEL — HOLD ON!
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn

![实机图 6](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-6.png)

图 6：实际操作记录 7。画面文字：SCORE
25,891
900
x2
1:35.480
PAR 1:50
ORBS 8/50
93
KM/H
NITRO
R RESPAWN AT CHECKPOINT · LAND LEVEL TO AVOID CRASHES
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn

![实机图 7](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-7.png)

图 7：实际操作记录 8。画面文字：SCORE
0
0
x1
0:00.000
PAR 1:50
ORBS 0/50
0
KM/H
NITRO
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn
COFFIN
COASTER
RIDE THE ROCKET COFFIN. SURVIVE THE TOPSY-TURVY TUNNEL.
MAP
HAUNTED CARNIVAL
Striped tents, ferris wheels and a purple dusk.
BONES
ROCKET COFFIN
RIDE SOLO
CHASE THE HIGH SCORE
RACE THE DEAD
3 AI RIVALS
Q/E MAP  ·  A/D RIDER
W/S CHOOSE  ·  ENTER RIDE
?

![实机图 8](/api/versions/v-ec4ce479c35e/specification-images/screenshots/step-8.png)

图 8：实际操作记录 9。画面文字：SCORE
0
0
x1
0:00.000
PAR 1:50
ORBS 0/50
0
KM/H
NITRO
W/S throttle/brake   A/D steer   SPACE hop
W/S/A/D/Q/E flip, spin, roll in air   SHIFT nitro   R respawn
COFFIN
COASTER
RIDE THE ROCKET COFFIN. SURVIVE THE TOPSY-TURVY TUNNEL.
MAP
HAUNTED CARNIVAL
Striped tents, ferris wheels and a purple dusk.
BONES
ROCKET COFFIN
RIDE SOLO
CHASE THE HIGH SCORE
RACE THE DEAD
3 AI RIVALS
Q/E MAP  ·  A/D RIDER
W/S CHOOSE  ·  ENTER RIDE
?

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

runtime steps 0-8与对应screenshots/step-*.png、local-host.js（SDK与本地存储实现）、index.html（Three.js运行时与网络守卫）

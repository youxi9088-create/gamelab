# Play Turbo Lane 3D - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play Turbo Lane 3D - Free Online Game | Rosebud

**玩法类型**

竞速/驾驶

**操作方式**

WASD/方向键 → 转向与加减速 → 实机验证有效；Space → 跳跃/开始 → 实机验证；C → 切换追尾/高位镜头；M → 静音开关；P/Esc → 暂停与恢复；Q → 暂停中返回菜单；触屏摇杆与JUMP按钮 → 移动端驾驶与跳跃。

**视角与布局**

第三人称追尾视角（可切换高位街机视角）

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

街机式高速躲避与资源管理：燃油持续消耗、受损可缓慢恢复，速度越快风险越高，追逐更远里程与本地高分。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

WASD/方向键 → 转向与加减速 → 实机验证有效；Space → 跳跃/开始 → 实机验证；C → 切换追尾/高位镜头；M → 静音开关；P/Esc → 暂停与恢复；Q → 暂停中返回菜单；触屏摇杆与JUMP按钮 → 移动端驾驶与跳跃。

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

驾驶改装车在六车道高速公路上不断前进，躲避交通车辆与路面障碍，拾取燃油、修理、金币与涡轮增压，坚持更远距离。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：菜单按Space或点击开始；操作：驾驶躲避并拾取补给，累计距离与金币；结果：燃油耗尽或损毁进入结算，可输入名字保存本地高分；继续：TRY AGAIN重开或回菜单。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

距离推进解锁车库升级（节油、护甲、引擎、轮胎、修理、油箱六类可叠加），每3000m一次；阶段随车库访问循环切换。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标为尽可能远行驶；燃油归零或耐久归零即失败；撞击车辆/路障扣耐久并减速，油污导致打滑，坡道跳跃奖励+50金币，Turbo状态可撞飞车辆得分；高速无碰撞时耐久缓慢恢复。

**已验证流程与未覆盖范围**

实机验证：启动、驾驶、跳跃、碰撞与燃尽结算、保存高分、刷新恢复、竖屏390×844玩法；仅源码确认：升级具体数值与阶段参数；未验证：3000m后车库实操、全部升级叠加效果。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

4个循环时间带场景（日落、午夜霓虹、黎明、正午），7类交通车辆与多种障碍/道具，障碍与车辆为程序生成，数量不设上限；每3000m进入车库三选一升级。

**场景、关卡与难度设计**

无固定关卡；公路为无限程序生成，里程碑与施工区按距离触发，场景随阶段循环。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

车辆生成与AI速度差、碰撞与击退、燃油消耗与补给、Turbo与跳跃、施工区车道变窄警告、昼夜阶段切换、车库升级、名人堂本地排行均在本机运行。

**界面流程与反馈**

加载→菜单（操作说明/名人堂/CREDITS）→HUD行驶（燃油/损伤/距离/金币/速度表）→车库三选一→结算（距离/金币/高分名单/保存/重试）→回菜单或重开。

**存档方式**

localStorage保存本地前五名高分（键turbolane3d_scores）与镜头偏好；结算时输入名字触发保存，刷新后名人堂保留；进行中的单局进度不保存。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-84ce3ce6cdd4/specification-images/screenshots/step-30.png)

图 1：实际操作记录 1。画面文字：FUEL
SPACE - JUMP [READY]
DISTANCE: 1522m
COINS: 0
STAGE 1 · GARAGE IN 1478m
DAMAGE
CAM
SND
II
85 MPH
STAGE 1 · SUNSET BOULEVARD
FAST GRAPHICS

![实机图 2](/api/versions/v-84ce3ce6cdd4/specification-images/screenshots/step-31.png)

图 2：实际操作记录 2。画面文字：TURBO LANE
3D
ARCADE HIGHWAY MAYHEM
WASD / ARROWS - DRIVE
SPACE - JUMP
DODGE TRAFFIC & OIL
COLLECT FUEL & REPAIRS
HIT TOW-TRUCK RAMPS FOR AIR!
C - CAMERA   M - SOUND   P - PAUSE
HALL OF FAME
1. ROSEBUD. 12000M
2. RAMP.... 8000M
3. TURBO... 5000M
4. LANE.... 3000M
5. AAA..... 1812M
PRESS SPACE OR TAP TO START
CREDITS
OUT OF FUEL!
FAST GRAPHICS

![实机图 3](/api/versions/v-84ce3ce6cdd4/specification-images/screenshots/step-32.png)

图 3：实际操作记录 3。画面文字：TURBO LANE
3D
ARCADE HIGHWAY MAYHEM
WASD / ARROWS - DRIVE
SPACE - JUMP
DODGE TRAFFIC & OIL
COLLECT FUEL & REPAIRS
HIT TOW-TRUCK RAMPS FOR AIR!
C - CAMERA   M - SOUND   P - PAUSE
HALL OF FAME
1. ROSEBUD. 12000M
2. RAMP.... 8000M
3. TURBO... 5000M
4. LANE.... 3000M
5. AAA..... 1812M
PRESS SPACE OR TAP TO START
CREDITS
OUT OF FUEL!
FAST GRAPHICS

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

源码：game.js、config.js、ui.js、main.js、index.html；运行证据：verification/24ad095f-d1f7-403a-9838-89e261958926-web-play.json及对应截图与storage摘要。

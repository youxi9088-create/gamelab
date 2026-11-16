# DuoLogic 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：DuoLogic

**玩法类型**

解谜

**操作方式**

WASD/方向键移动，E与键盘及接线盒交互，Q或点击进行ping，Enter聊天（启动界面操作说明）。

**视角与布局**

双视角：Agent房间视角与Navigator蓝图俯视/手册视图

**画面维度**

3D

**引擎**

Three.js 0.185（WebGL，importmap映射到本地vendor模块）

**程序语言**

JavaScript（ES Module，打包内联于index.html）

**结论字段**

- `game_summary` = DuoLogic是非对称信息合作解谜游戏：一人在设施房间内行动（Agent），一人看蓝图与手册指挥（Navigator）；Solo practice模式可同时看到两侧。

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

**内容元素资源类型**

场景/角色/道具：GLTF二进制模型（本地assets，GLTFLoader加载）；UI：HTML/CSS；文本：内联于index.html；音频：本轮未观察到。

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**结论字段**

- `core_challenge_type` = 信息解谜 / 协作沟通 / 走位避障

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

WASD/方向键移动，E与键盘及接线盒交互，Q或点击进行ping，Enter聊天（启动界面操作说明）。

**操控构成要素**

键盘（WASD/方向键/E/Q/Enter）与鼠标点击（ping、UI按钮）。

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

非对称信息协作解谜：Navigator依据蓝图识别陷阱地砖、解读符号与线路、提示激光时序并点击ping；Agent在房间内移动、与键盘/接线盒交互，解除全部EXIT锁后开门。

**结论字段**

- `core_loop` = 查看蓝图与手册→ping标记危险/目标→Agent移动并交互解谜→解除EXIT锁→出口开启→进入下一房间

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

启动→主菜单选Solo practice→进入Room 01教学房→双视角协作操作→开门推进；三次警报触发封锁并重置当前房间。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

逐房间推进，每房间Agent/Navigator角色互换；三次警报触发封锁并重置当前房间。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

**目标规则反馈激励闭环**

短期目标：当前房间内避开陷阱、解开符号键盘/激光时序并解除全部标记EXIT的锁；规则：仅Navigator可见危险地砖，三次警报即封锁重置；反馈：ping可视标记、ALARMS 0/3计数、门锁与出口状态变化；奖励与下一目标：出口开启进入下一房间且双角色互换；长期目标（总房间数与终局）未遍历验证。

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

红色地砖为陷阱且仅Navigator可见；点击蓝图可在Agent地面投放ping；解除所有EXIT锁开启出口；三次警报触发封锁并重置房间。

**已验证流程与未覆盖范围**

实机验证：启动、菜单、Solo practice进入Room 01、WASD移动、ping与手册翻页、启动/交互/刷新三阶段导航检查通过；刷新后存储为空（该流程未触发存档写入）。后续房间、结算与跨房间进度未覆盖。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

**结论字段**

- `key_numbers` = 警报上限3次（界面ALARMS 0/3及手册文本）；手册至少2页（p. 1 of 2）。

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

房间制关卡；Room 01 Orientation（教学房）已实测，后续房间数量与内容未遍历。

**结论字段**

- `level_structure` = 房间制：已验证Room 01 Orientation；总房间数未验证。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

双角色（Agent/Navigator）、蓝图ping标记、分页手册（FIELD MANUAL · REV C）、聊天输入、警报计数（0/3）、每房角色互换。

**界面流程与反馈**

标题菜单（Solo practice）→房间HUD：Brief/Floor按钮切换手册与蓝图、手册翻页（‹[ / ]›）、ALARMS计数、Chat输入。

**存档方式**

本轮运行localStorage/sessionStorage/IndexedDB均为空，未观察到存档写入；存档机制未验证。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

**文字与美术内容**

特工潜入设施主题：Field Operations Brief、HQ、FIELD MANUAL · REV C等军事简报包装。

### 实际运行图解

![实机图 1](/api/versions/v-9c45ee1c6cf6/specification-images/screenshots/step-39.png)

图 1：实际操作记录 1。画面文字：Brief
Floor
Field Operations Brief
NEW
‹
[
1/2
]
›
HQ
Red plates are rigged. Click a tile to ping it on the Agent's floor.

You are the Navigator. The Agent is inside the facility and sees the room with their own eyes — but not the security systems. You see the blueprint and this manual — but not the room.

Talk them through it. Click the blueprint to drop a ping they can see on their floor.

Your Agent
A ping (yours or theirs)
Exit door — opens when every lock marked EXIT is solved
Interior security door
Furniture — blocks the way

Three alarms trigger lockdown and the room resets.

p. 1 of 2

![实机图 2](/api/versions/v-9c45ee1c6cf6/specification-images/screenshots/step-40.png)

图 2：实际操作记录 2。画面文字：Brief
Floor
Field Operations Brief
NEW
‹
[
1/2
]
›
HQ
Red plates are rigged. Click a tile to ping it on the Agent's floor.

You are the Navigator. The Agent is inside the facility and sees the room with their own eyes — but not the security systems. You see the blueprint and this manual — but not the room.

Talk them through it. Click the blueprint to drop a ping they can see on their floor.

Your Agent
A ping (yours or theirs)
Exit door — opens when every lock marked EXIT is solved
Interior security door
Furniture — blocks the way

Three alarms trigger lockdown and the room resets.

p. 1 of 2

## 14. 养成系统 + 经济系统

**维度定义**：成长要素和资源产出、消耗、回收机制。

**内容说明**

**养成与经济机制**

未发现虚拟货币、商店或经济系统。

## 15. 角色 / 单位设定

**维度定义**：角色单位的数量、属性、能力、定位和关系。

**内容说明**

**角色单位设定**

Agent：在房间内移动、与装置交互；Navigator：查看蓝图与手册、ping指挥；每房间互换。

## 16. 商业化

**维度定义**：已实现的广告、内购、订阅、买断和付费点。

**内容说明**

**商业化实现**

源码搜索payment/showAd/leaderboard均零命中，实测无相关入口与请求。

**结论字段**

- `monetization` = 未发现广告、充值或真实货币付费入口。

### 事实依据与定位

converted/index.html；evidence/current-runtime.json（本轮运行观察与三阶段导航检查点）。

# BALL BONK 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：BALL BONK

**玩法类型**

3D · 单人对三CPU竞技击球

**操作方式**

A/D orarrowsmove,Spacenativegrabthrow,Escpause; originaltouchpad retainednotactualtouchvalidated.

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

A/D orarrowsmove,Spacenativegrabthrow,Escpause; originaltouchpad retainednotactualtouchvalidated.

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

Originalfourbonkers/fivearenas, defendgoal/grabthrowball/15HPelimination/lastsurvivor. ActualGardenplayerloss5goals5000 andDesertLumpyactualstart.

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

原单人和三CPU、四角色、五场地、15HP、球物理/AI/伤害/进球奖励不变。退役旧RemixSDK/联机房间/好友UI/全局成绩提交，无SDK或房间桩、无假对手/假奖励。1254函数/方法语义SHA保留（含内置THREE），Ma/Hd/Zd/Yd/qd/Hn物理AI生成原函数均不变；11函数仅单人条件折叠/移除在线调用及渲染像素上限，源控制器逐项说明。仅渲染降低主抗锯齿/像素比上限1/阴影2048到1024，原场景模型材质和模拟步长不变；显示页面后仍慢，渲染限制后实际10秒已开局受伤，不伪报CPU/FPS百分比。原Garden实际A/D移动、Space抓投、得分3200/HP6，完整终局5进球5000/HP0/胜利奖励0，Bopsy原最后存活3HP，玩家失败；PlayAgain重置15HP和3000基础生命分、暂停/菜单正常。原换Lumpy与Desert实际开局15HP/暂停。刷新回原主菜单/默认Ziggy，原版无持久化，不添加存档、不称保留得分。旧首次启动Is声明误删异常和渲染限制前网络原样保留，已修正并新窗口最终完整21请求无外部/失败/HTTP错误/异常/控制台错/截断。未验证冠军/其余三场地完整对局/四角色完整对局/真实触控/听觉。

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

Originalno persistent save, refreshmenu/defaultZiggy; no fabricatedsave.

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-5fedf1fdcba7/specification-images/screenshots/startup.png)

图 1：本轮启动画面；仅证明已记录画面，验证范围见正文。

![实机图 2](/api/versions/v-5fedf1fdcba7/specification-images/screenshots/current.png)

图 2：本轮最终观察画面；仅证明已记录画面，验证范围见正文。

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

# Play Pearlfall Mania - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play Pearlfall Mania - Free Online Game | Rosebud

**玩法类型**

射击/休闲

**操作方式**

按住球体拖拽 → 瞄准 → 关卡进行中（实机验证）
松开拖拽 → 发射当前彩球 → 瞄准后（实机验证）
点击关卡圆点 → 进入对应关卡 → 主菜单（实机验证）
点击TRY AGAIN → 重置当前关 → 失败结算弹窗（实机验证）
点击+5 SHOTS·FREE → 金币续5发 → 失败弹窗（按钮可见，点击未实测）
点按TAP TO SWAP → 交换当前/下一发球 → 关卡内（按钮可见，交换未实测）
点击齿轮 → 设置（音效/音乐/振动）→ 任意界面（仅源码确认）

**视角与布局**

固定正面视角：相机正对悬浮多层珍珠球与下方收集桶，不可旋转；球体自身缓慢旋转

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

短关卡、单指操作的物理弹射消除体验，节奏轻快；搭配合成音效与生成音乐（音频为仅源码确认）。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

按住球体拖拽 → 瞄准 → 关卡进行中（实机验证）
松开拖拽 → 发射当前彩球 → 瞄准后（实机验证）
点击关卡圆点 → 进入对应关卡 → 主菜单（实机验证）
点击TRY AGAIN → 重置当前关 → 失败结算弹窗（实机验证）
点击+5 SHOTS·FREE → 金币续5发 → 失败弹窗（按钮可见，点击未实测）
点按TAP TO SWAP → 交换当前/下一发球 → 关卡内（按钮可见，交换未实测）
点击齿轮 → 设置（音效/音乐/振动）→ 任意界面（仅源码确认）

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

单指在球体上拖拽瞄准、松开发射彩球，命中悬浮多层珍珠球逐层消除挖掘，在子弹耗尽前挖穿全部层并命中中心★过关；失败可用金币续5发或重试。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：主菜单点关卡圆点进入；操作：有限子弹内拖拽瞄准发射，逐层挖掘；结果：命中★胜利或弹尽失败，弹出结算；继续：胜利进下一关，失败金币续币或TRY AGAIN重试，可回主菜单。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

过关解锁后续关卡圆点；积累PEARLS货币、星星评价与助推器（rain/bomb/shots）库存；失败不丢进度可直接重试；整体规模未穷举。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

**目标机制**

明确目标：有限子弹内挖穿全部层命中中心★，首关教学文案直接说明（实测可见）。

**玩法达成机制**

操作（拖拽发射）→规则（命中消除/嵌入、层数递减）→目标（清层命中★）→结算（胜利或OUT OF SHOTS弹窗），链条完整（converted/index.html+实测）。

**反馈机制**

实时反馈：SHOTS逐发减少、LAYER进度条推进、PEARLS计数增长、球体消除与旋转动画（实测）；合成音效与生成音乐为仅源码确认。

**驱动力机制**

本地PEARLS货币、星星评价、关卡解锁与助推器收集构成重玩驱动（converted/index.html的stars/boosters/level结构；未穷举实测）。

**延续机制**

过关解锁下一关圆点、失败可续币或重试，新关卡新层数与图案构成后续目标（主菜单实测+converted/index.html）。

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：子弹耗尽前挖穿全部珍珠层并命中中心★；成功：命中★过关（未实测达成）；失败：SHOTS归0未清完层，弹出OUT OF SHOTS（实测）；计分：消除珍珠获得PEARLS（实测单关512）；阈值：LEVEL 1为2层6发（实测），后续关卡未穷举。

**已验证流程与未覆盖范围**

实机验证：启动、进LEVEL 1、拖拽发射、分层消除与PEARLS计分、弹尽失败弹窗（无广告入口）、TRY AGAIN重置、刷新回主菜单；仅源码确认：存档写入条件、助推器效果、设置面板；未验证：LEVEL 2及以后关卡、胜利结算流程、存档实际恢复。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定内容：WORLD 1含多个手工配置关卡（主菜单可见LEVEL 1等圆点，总数未穷举）；球体分层颜色图案按关固定；无程序生成证据。

**场景、关卡与难度设计**

每关为悬浮多层珍珠球，层数与颜色图案按关配置；LEVEL 1两层并附教学；难度递进未验证。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

对象：多层珍珠球、发射台与当前/下一球、收集桶、中心★；状态：SHOTS、LAYER进度、PEARLS、关卡；触发：发射命中→消除/嵌入，层清除→进度推进，弹尽→失败结算，命中★→胜利；交互：PEARLS用于续币与助推器商店，星星记录评价。

**界面流程与反馈**

主菜单：标题、WORLD 1·SUNNY GARDEN、关卡圆点、齿轮→进关；关卡HUD：PEARLS、LEVEL、LAYER进度条、SHOTS、TAP TO SWAP、齿轮，首关有拖拽教学提示条（实测）；失败弹窗：OUT OF SHOTS文案、+5 SHOTS·FREE、TRY AGAIN→重进关卡（实测）；胜利弹窗与商店界面未实测。

**存档方式**

localStorage键pearlpeel3保存关卡进度、金币、助推器、星星、教程标记与音频开关（仅源码确认）；本轮未完成关卡，存储实测为空，刷新后回主菜单LEVEL 1；局内分层状态不跨刷新恢复（实测）。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-d90afffe4504/specification-images/screenshots/step-22.png)

图 1：实际操作记录 1。画面文字：PEARLS
0
LEVEL 1
LAYER 1 / 2
SHOTS
6
TAP TO SWAP
Drag on the ball to aim, release to shoot. Dig through the layers and hit the ★ in the center!

![实机图 2](/api/versions/v-d90afffe4504/specification-images/screenshots/step-25.png)

图 2：实际操作记录 4。画面文字：0
WORLD 1 · SUNNY GARDEN
LEVEL 1

![实机图 3](/api/versions/v-d90afffe4504/specification-images/screenshots/step-28.png)

图 3：实际操作记录 7。画面文字：PEARLS
0
LEVEL 1
LAYER 1 / 2
SHOTS
5
TAP TO SWAP

![实机图 4](/api/versions/v-d90afffe4504/specification-images/screenshots/step-31.png)

图 4：实际操作记录 10。画面文字：PEARLS
512
LEVEL 1
LAYER 2 / 2
SHOTS
3
TAP TO SWAP

![实机图 5](/api/versions/v-d90afffe4504/specification-images/screenshots/step-33.png)

图 5：实际操作记录 12。画面文字：PEARLS
512
LEVEL 1
LAYER 2 / 2
SHOTS
2
TAP TO SWAP

![实机图 6](/api/versions/v-d90afffe4504/specification-images/screenshots/step-36.png)

图 6：实际操作记录 15。画面文字：PEARLS
512
LEVEL 1
LAYER 2 / 2
SHOTS
1
TAP TO SWAP

![实机图 7](/api/versions/v-d90afffe4504/specification-images/screenshots/step-39.png)

图 7：实际操作记录 18。画面文字：PEARLS
512
LEVEL 1
LAYER 2 / 2
SHOTS
0
TAP TO SWAP
OUT OF SHOTS!

So close! One layer left.

+5 SHOTS · FREE
TRY AGAIN

![实机图 8](/api/versions/v-d90afffe4504/specification-images/screenshots/step-42.png)

图 8：实际操作记录 21。画面文字：PEARLS
0
LEVEL 1
LAYER 1 / 2
SHOTS
6
TAP TO SWAP
Drag on the ball to aim, release to shoot. Dig through the layers and hit the ★ in the center!

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

converted/index.html（玩法、UI与存档逻辑）；evidence/current-runtime.json（本轮补丁后三阶段实测）；verification/6572f986-b804-4492-8540-13c0629b4cec-web-play.json（基线三阶段）。

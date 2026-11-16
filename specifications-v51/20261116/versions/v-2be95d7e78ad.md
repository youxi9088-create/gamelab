# Glow Maze 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Glow Maze

**玩法类型**

益智动作 · 3D迷宫吃点

**操作方式**

WASD/arrows normal movement/steering; F at InsertCoin to play or leave, scroll camera.

**视角与布局**

第三人称越肩/尾随视角，支持滚轮缩放

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

快节奏的复古街机体验，结合 Three.js 霓虹视觉、发光 shader、动态摄像机与 Pac-Man 式追逐 AI。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

WASD/arrows normal movement/steering; F at InsertCoin to play or leave, scroll camera.

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

Original maze chase, dot scoring/ghosts/lives/power/bonus and level progression; no victory claim in actual sample.

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

大厅待机 → 接近 INSERT COIN 平台并按 F → 3-2-1 倒计时 → 驾驶光荚吃光点 → 撞到幽灵失去生命/被吃 → 生命耗尽则游戏结束返回大厅；吃完所有光点进入下一关。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

完成当前关卡所有光点后进入下一关；关卡提升会加快幽灵与玩家速度；累计 10000 分奖励额外生命；最高分持久化。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：吃掉关卡内所有光点。成功：光点清零进入下一关。失败：被幽灵抓到减少 1 条生命，生命为 0 时游戏结束。计分：普通光点基础分，能量豆更高，惊吓期间吃幽灵分数递增。额外生命阈值 10000 分。

**已验证流程与未覆盖范围**

Desktop1280x720 actual original GlowMaze. Ordinary walking to InsertCoin and F starts original3-life countdown; actual scoring190 then600, ghost collisions lives3to2to1, later native lobby High600 (GameOver label transition not screenshot-captured; no victory claimed). Original restart resets0/3lives retaining600. Latest source removes inert host menu entry; final reload restored600, actual steering/countdown/190score and F exit returned InsertCoin-high600. All53 original game functions canonical SHA unchanged, only inter-game portal placement list retired. Original maze/pellets/ghostAI/lives/scoring/level data retained. Complete final reload/play/exit network window no truncation/external/missing/errors. Full-maze victory/later levels, power/ghost-eating/gem bonuses, achievements, mobile/controller/audio hearing not exhausted.

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定关卡：当前验证到 1 个霓虹迷宫（31×28 网格镜像布局）。含普通光点、4 颗能量豆、Bonus 宝石、4 种幽灵、多个跨世界传送门（源码定义，未实机访问）。

**场景、关卡与难度设计**

迷宫采用经典吃豆布局的 3D 霓虹重制：对称墙体、中央幽灵巢穴、左右隧道、四周传送门出口；墙体使用发光 shader，地面为网格与点光源。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

光点系统：InstancedMesh 渲染，被吃后缩放到 0。幽灵 AI：scatter/chase/frightened/wisp/house 五种状态，按 Pac-Man 规则选目标格。能量豆系统：触发幽灵 frightened 状态并改变外观。摄像机系统：跟随光荚并平滑插值。碰撞系统：墙体阻挡、幽灵触发掉命。保存系统：本地记录最高分。

**界面流程与反馈**

启动画面 → 霓虹大厅（显示 HIGH SCORE）→ 接近 INSERT COIN 平台 → 按 F 进入载具 → 倒计时 → HUD（LEVEL/分数/生命/最高分/进度）→ 按 F/Esc 退出 → 返回大厅。

**存档方式**

Native original standalone localStorage record path, actual High600 restored; no mid-run restore claim.

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 2](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-5.png)

图 2：实际操作记录 6。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 3](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-11.png)

图 3：实际操作记录 12。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 4](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-16.png)

图 4：实际操作记录 17。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 5](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-22.png)

图 5：实际操作记录 23。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 6](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-27.png)

图 6：实际操作记录 28。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 7](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-33.png)

图 7：实际操作记录 34。画面文字：LEVEL 1
220
♥ High 220
F
Esc
Get out

![实机图 8](/api/versions/v-2be95d7e78ad/specification-images/screenshots/step-38.png)

图 8：实际操作记录 39。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

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

源码：source-analysis/js-2.16.0-7f76cb31ebe.../readable.js（Glow Maze 主逻辑），vendor/004-15e95a6cf14...js（PortalWorld 宿主与输入）。运行证据：screenshots/step-29 至 step-38，runtime.json 中 localStorage 'remix-portal-save:glow-maze' 条目及刷新前后最高分 220。

# Tunnel Rush - 免费在线玩! | Poki (宝玩) 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Tunnel Rush - 免费在线玩! | Poki (宝玩)

**玩法类型**

街机 · 隧道闪避

**操作方式**

Classic arrows; same-device2P A/D and arrows; P/Escape pause, native menus/settings.

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

Classic arrows; same-device2P A/D and arrows; P/Escape pause, native menus/settings.

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

Original tunnel rotation/obstacles/acceleration/collision/distance/levels retained. Native classic loss and same-device2P winner/loser observed.

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**已验证流程与未覆盖范围**

Desktop1280x720 native Babylon tunnel runner. Original defaultMED and rules retained. Ordinary arrows rotate, native collision first346m defeat; latest-source classic420mGameOver, ordinary restart with immediateEscape guard actualnew54.4m/61.7m/s, later575.9m pause panel and native home. Same-device2P A/D and arrows separate viewports, actual347mGameOver P1WINNER/P2LOSER. Settings mute persisted after reload. SDKmanager/13calls and rewardedrevive method/button retired; four ordinary restart/menu native continuations direct. Causal fix: ignore pause while original menu fade inTransition to avoid menu-less pause, normal pause remains. Original8core declarations and37image/audio assets exactcanonical/byteSHA unchanged. No classic levelclear/progressunlock claimed; full100levels/all difficulties/mobile/hearing not exhausted. Final complete network no external/failed/missing/exception/truncation.

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

固定数量：包含多个 UI 贴图（按钮、图标）和音频文件（ButtonPress.mp3, Explosion.mp3 等）。程序生成：未确认。

**场景、关卡与难度设计**

仅源码确认：包含 textures/tunnel.jpg，暗示存在隧道或轨道类关卡设计。具体关卡布局和难度曲线未实机验证。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

对象：UI 按钮（ButtonSquare, ButtonRound）、音频播放器。状态：启动加载、菜单、游戏进行中、暂停。触发：点击按钮、键盘输入。系统交互：UI 系统与音频系统（按钮音效）、存储系统（SaveData）与游戏进度系统。

**存档方式**

Original SaveData localStorage level/scores/difficulty/audio. Only mute persistence verified; no fabricated levelunlock or midrun save.

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-2da56efd39f9/specification-images/screenshots/startup.png)

图 1：本轮启动画面；仅证明已记录画面，验证范围见正文。

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

源码文件：main.js, _runtime_resources/d077b3a3ba7dfb87a0e1afd7.js。本轮证据：runtime.json (startup phase), localStorage 快照, 资源请求列表, Babylon.js 渲染诊断。

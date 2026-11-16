# Fresbee Frenzy 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Fresbee Frenzy

**玩法类型**

休闲体育投掷（飞盘/踢球式弹射）

**操作方式**

鼠标/触摸按住飞盘 → 拖动蓄力并瞄准方向 → 松开掷出；拖动距离决定力度，方向决定轨迹（实机验证）
再玩一次按钮 → 结算后点击重新开始（实机验证）
键盘操作未验证，未发现键位提示

**视角与布局**

第三人称尾随视角，镜头位于发球台后上方俯瞰球道

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

单手拖拽即可进行的快节奏投掷挑战，追求连击与高分

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

鼠标/触摸按住飞盘 → 拖动蓄力并瞄准方向 → 松开掷出；拖动距离决定力度，方向决定轨迹（实机验证）
再玩一次按钮 → 结算后点击重新开始（实机验证）
键盘操作未验证，未发现键位提示

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

按住飞盘向后拖动蓄力瞄准，松手掷出，击中旗帜目标得分并避开紫色柱状障碍，连续命中触发连击

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：飞盘置于发球台，3条生命，计分0；操作：拖拽掷出飞盘命中目标或撞障碍/失误；结果：命中加分并显示连击评语，失误扣1条生命；继续：生命耗尽弹出“本局结束+得分”面板，可点再玩一次开启新局

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

得分随命中递增，连击显示×2 COMBO等评语（BOOM/BULLSEYE/NICE CATCH/SAVAGE/ON FIRE等）；生命3条，失误递减；未验证分数上限与难度递增规则

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：掷出飞盘击中旗杆目标得分；成功：命中加分并触发连击评语；失败：未命中或撞障碍扣1生命，3条耗尽本局结束；计分公式具体数值未确认

**已验证流程与未覆盖范围**

Final build: score 0 to 3, three actual collisions, native game-over 3 and PLAY AGAIN reset to 0/three lives. Prior build before visibility-class correction reached score 8 and saved it; final build restores best=8 in original hidden DOM label. Hidden best label is functional DOM evidence, not visible HUD verification. Original 49 functions including throw/flight remain unchanged. No cosmetic unlock/mobile interaction verification. Desktop IAB 1280x720; infinite game has no full campaign ending. Original hidden best label checked as DOM state, not claimed visible HUD. Original native procedural scene and music retained; no fabricated cloud asset or leaderboard.

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

单一循环球道场景：绿色球场、双侧看台彩色观众、树木与旗帜装饰；障碍为紫色层叠柱，随进度前压；关卡数量为程序循环未设独立关卡（实机范围）

**场景、关卡与难度设计**

单条纵深球道，障碍位置随投掷轮次前移增加压迫感；固定场景+程序排布障碍，无独立关卡切换（实机范围）

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

投掷系统：拖拽向量映射力度与方向；碰撞系统：飞盘与目标/障碍判定；计分与连击系统：命中计数与评语弹出；生命系统：3星递减；结算系统：生命归零弹出宿主结算面板并可重开

**界面流程与反馈**

Original native stadium -> swipe or Space throws -> catches/combo or collision/life loss -> local GAME OVER -> PLAY AGAIN reset. Global leaderboard removed.

**存档方式**

Native localStorage key frisbee-loop-state retains original bestScore and selectedFrisbee format. Best 8 restored in hidden DOM; active match does not persist.

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：0
×2 COMBO!

![实机图 2](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-3.png)

图 2：实际操作记录 4。画面文字：3
NICE CATCH!

![实机图 3](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-5.png)

图 3：实际操作记录 6。画面文字：3
WIPEOUT!

![实机图 4](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-8.png)

图 4：实际操作记录 9。画面文字：3
CRASH!

![实机图 5](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-10.png)

图 5：实际操作记录 11。画面文字：4
SAVAGE!

![实机图 6](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-13.png)

图 6：实际操作记录 14。画面文字：0
CRASH!

![实机图 7](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-15.png)

图 7：实际操作记录 16。画面文字：0
×2 COMBO!

![实机图 8](/api/versions/v-5a3ccb272ddd/specification-images/screenshots/step-18.png)

图 8：实际操作记录 19。画面文字：1
ON FIRE!

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

本轮截图screenshots/step-0至step-18及startup/current；运行报告steps含计分文本与结算labels；storage记录frisbee-loop-state刷新前后哈希一致；源码index.html内联游戏逻辑与local-host.js宿主保存接口

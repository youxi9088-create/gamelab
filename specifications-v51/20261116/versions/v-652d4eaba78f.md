# Play Starwing - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play Starwing - Free Online Game | Rosebud

**玩法类型**

街机 · 太空射击

**操作方式**

Mouse steer/hold left fire; P/Escape pause, original resume button and mute.

**视角与布局**

竖版俯视固定视角，玩家位于屏幕底部向上射击

**画面维度**

2D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

经典街机快节奏射击：走位躲避、连续命中得分、营救双机强化火力、逐关挑战刷新最高分。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

Mouse steer/hold left fire; P/Escape pause, original resume button and mute.

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

Original insect-wave shooter, mouse steering/hold fire, original boss capture/rescue and stage definitions retained; actual Stage1defeat, no victory claim.

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：标题页点击开始 → 操作：移动射击清除编队敌机，躲避俯冲与敌弹 → 结果：清关进入下一关，每3关为奖励关；被击中失去生命，生命耗尽游戏结束 → 继续：重新开始挑战更高分。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

阶段（STAGE）逐关递增显示于右上；分数与最高分实时显示；营救战机获得双机火力（双机被击损失一半）。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：击落敌机得分并存活。计分：击落敌机得分（画面显示100等分值），奖励关按命中数结算；失败：被敌机或敌弹命中损失生命，生命归零游戏结束；被俘战机可被击坠蜘蛛救回（阈值细节未逐项确认）。

**已验证流程与未覆盖范围**

Desktop1280x720 actual unchanged original StarWing main.js. Ordinary mouse steering and hold-to-fire, formation/dive/hit/score/life-loss feedback, actual Ppause/resume overlay. Intermediate run transitions not all captured, only explicit final Stage1 GAMEOVER2540 claimed. Original click restart score0/3reserve-life icons/HI2540, reload titleHI2540 restored. No stage-clear/victory claim. Original rules/difficulty/score/weapons/capture/rescue/boss/stages/local score preserved. Boss capture-rescue/dual-fighter, challenging/later stages, mobile touch and audio hearing not exhausted. Complete final window startup/shooting/pause/resume/GameOver/restart/reload27requests local, no truncation/missing/external/errors.

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

敌机含蜘蛛（boss）、蝴蝶、蜜蜂三类编队；关卡循环推进、每3关奖励关；具体总关卡数为程序循环生成，无固定上限（源码确认）。

**场景、关卡与难度设计**

固定编队槽位（顶行蜘蛛、中两行蝴蝶、底两行蜜蜂），敌人按侧向入场路径飞入就位；关数程序递增，难度递进方式未完整验证。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

对象：玩家机、双机、子弹、敌弹、三类敌机、粒子、飘字、星空；状态：title/play/paused/over；交互：入场路径→编队摆动→俯冲攻击；俘获/营救系统；暂停菜单含SOUND与RESUME。

**界面流程与反馈**

标题页（操作说明+HI分）→点击开始→战斗HUD（SCORE/HI/STAGE/SOUND/PAUSE）→P或按钮→PAUSED页（RESUME恢复）→生命耗尽→结束页→回标题。

**存档方式**

Original swarmHi localStorage highscore, actualHI2540 reload proved; no mid-run save.

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 2](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-2.png)

图 2：实际操作记录 3。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 3](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-3.png)

图 3：实际操作记录 4。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 4](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-5.png)

图 4：实际操作记录 6。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 5](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-6.png)

图 5：实际操作记录 7。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 6](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-8.png)

图 6：实际操作记录 9。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 7](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-9.png)

图 7：实际操作记录 10。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

![实机图 8](/api/versions/v-652d4eaba78f/specification-images/screenshots/step-11.png)

图 8：实际操作记录 12。画面文字：无可提取文字；仅记录实际画面，不据此推断通关。

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

源码：main.js（startGame/update/loseLife等）；本轮证据：verification/79ed81e7-288b-43d1-9f92-ed3be128e781-web-play.json，screenshots/step-0至step-11。

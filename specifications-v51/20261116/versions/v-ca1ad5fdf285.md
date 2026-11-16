# Play Gulf Champions - أبطال الخليج - Free Online Game | Rosebud 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Play Gulf Champions - أبطال الخليج - Free Online Game | Rosebud

**玩法类型**

体育

**操作方式**

W/A/S/D 或方向键 → 控制当前球员移动 → 对局中（W/A 实机验证有反馈）
Shift 按住 → 冲刺并消耗体力 → 有移动输入时生效（源码确认）
屏幕按钮 PASS → 传球 → 己方持球时
屏幕按钮 SHOOT → 射门 → 己方持球时
屏幕按钮 SWITCH → 切换受控球员 → 对局中
屏幕按钮 TACKLE → 铲球 → 对方持球且在射程内（源码确认判定）
屏幕按钮 ABILITY → 释放角色技能 → 冷却结束
屏幕按钮 SOUND → 声音开关

**视角与布局**

斜上方俯视跟随受控球员的透视视角（实机画面+源码相机设置）

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

快节奏卡通足球对抗，强调短传配合、铲抢时机与技能释放的街机手感

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

W/A/S/D 或方向键 → 控制当前球员移动 → 对局中（W/A 实机验证有反馈）
Shift 按住 → 冲刺并消耗体力 → 有移动输入时生效（源码确认）
屏幕按钮 PASS → 传球 → 己方持球时
屏幕按钮 SHOOT → 射门 → 己方持球时
屏幕按钮 SWITCH → 切换受控球员 → 对局中
屏幕按钮 TACKLE → 铲球 → 对方持球且在射程内（源码确认判定）
屏幕按钮 ABILITY → 释放角色技能 → 冷却结束
屏幕按钮 SOUND → 声音开关

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

3对3吉祥物街机足球：玩家控制一名吉祥物球员，在90秒比赛中通过移动、传球、射门、铲球与角色技能攻破 AI 对手球门；含体力、冲刺、节奏与势头等即时状态管理

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：启动页→菜单/选人→赛前战术提示后开赛；操作：90秒内移动、传射、铲抢与 AI 对手对抗；结果：计时结束按比分出胜/负结算（本轮实测 Defeat 0:1）；继续：Try Again 重开同一对手

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

小组赛逐场推进，界面显示 Group Stage 与对手战术卡；本轮仅实测首场负局与重试，晋级后续未实测

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

**目标机制**

限时内进球数超过对手即胜，否则负（源码规则+实机 Defeat 结算）

**玩法达成机制**

移动/传球/铲球/射门 → 按规则夺取球权并进球 → 比分领先 → 赢得比赛晋级（源码规则+实机对局）

**反馈机制**

实时比分与计时、体力状态提示条、铲球/进球动态文字反馈、角色动作与硬直表现（实机+源码）

**驱动力机制**

以小组赛推进和战胜不同战术对手为驱动；未见本地最高分记录（源码 main.js 对手战术配置；本地最高分未确认）

**延续机制**

胜后进入下一场小组赛（界面 Group Stage 与对手战术卡）；本轮未实测晋级（源码确认）

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：90秒（源码 MATCH_TIME=90）内进球数多于对手；成功：比分领先获胜；失败：落后进入 Defeat 结算。铲球命中夺得球权，失误自身短暂硬直（源码）；比分即进球数，无其他加分公式

**已验证流程与未覆盖范围**

实机验证：启动、菜单/选人、整场比赛至 Defeat 结算、Try Again 重试、刷新后恢复可玩、全程零外部请求、无本地存储写入。仅源码确认：铲球判定数值、体力/节奏系数、对手列表规模。未验证：取胜晋级路径与后续场次

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

6名可选吉祥物球员（各有速度/传球/射门属性与专属技能，源码固定数量）；小组赛对手各带战术说明（如高压反抢）；球员模型与球场为固定资源；对手总数未验证

**场景、关卡与难度设计**

固定尺寸球场（源码半场长22、宽14、球门宽3.5）；对手按小组赛顺序登场并附战术说明文本；关卡总数未验证

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

球员对象：位置/速度/体力/硬直/技能冷却；铲球系统：距离与朝向判定、命中夺球、失误自硬直与冷却；体力系统：冲刺消耗、低体力减速；节奏与势头系统：随表现给出状态提示；AI 系统：对手按战术跑位逼抢；换人系统：切换受控球员

**界面流程与反馈**

启动 Logo 页 → 主菜单/选人（属性卡）→ 赛前战术提示 → 对局 HUD（比分、计时、体力提示、动作按钮）→ 结算页（胜/负标题、比分、Try Again）→ 重开对局

**存档方式**

不保存任何进度：实测 localStorage/sessionStorage/IndexedDB 均为空，源码无存储调用；刷新后回到初始流程并可正常重玩

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-64.png)

图 1：实际操作记录 1。画面文字：Mascots 0 - 0 Cheetahs ⏱ 0:22
Group Stage
SHOT CHARGE · RELEASE TO FIRE
ABILITY READY · Silk pass · R
TACKLE READY · F
STAMINA · FRESH
100%
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

PASS
SHOOT
SWITCH
SPRINT
TACKLE
ABILITY
SOUND

![实机图 2](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-66.png)

图 2：实际操作记录 3。画面文字：Mascots 0 - 0 Cheetahs ⏱ 0:14
Group Stage
SHOT CHARGE · RELEASE TO FIRE
ABILITY READY · Silk pass · R
TACKLE READY · F
STAMINA · FRESH
100%
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

PASS
SHOOT
SWITCH
SPRINT
TACKLE
ABILITY
SOUND

![实机图 3](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-68.png)

图 3：实际操作记录 5。画面文字：Mascots 0 - 0 Cheetahs ⏱ 0:01
Group Stage
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

Draw - Replay!

Mascots 0 - 0 Cheetahs

Try Again

![实机图 4](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-70.png)

图 4：实际操作记录 7。画面文字：Mascots 0 - 0 Cheetahs ⏱ 0:01
Group Stage
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

Draw - Replay!

Mascots 0 - 0 Cheetahs

Try Again

![实机图 5](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-71.png)

图 5：实际操作记录 8。画面文字：Mascots 0 - 0 Cheetahs ⏱ 0:01
Group Stage
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

Draw - Replay!

Mascots 0 - 0 Cheetahs

Try Again

![实机图 6](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-73.png)

图 6：实际操作记录 10。画面文字：Mascots 0 - 1 Cheetahs ⏱ 0:38
Group Stage
SHOT CHARGE · RELEASE TO FIRE
ABILITY READY · Falcon burst · R
TACKLE READY · F
STAMINA · FRESH
100%
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

PASS
SHOOT
SWITCH
SPRINT
TACKLE
ABILITY
SOUND

![实机图 7](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-75.png)

图 7：实际操作记录 12。画面文字：Mascots 0 - 1 Cheetahs ⏱ 0:01
Group Stage
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

Defeat

Mascots 0 - 1 Cheetahs

Try Again

![实机图 8](/api/versions/v-ca1ad5fdf285/specification-images/screenshots/step-77.png)

图 8：实际操作记录 14。画面文字：Mascots 0 - 1 Cheetahs ⏱ 0:01
Group Stage
CHEETAHS · PRESS & COUNTER

They hunt the ball high, then burst forward on the counter. Move it quickly to play through the press.

Defeat

Mascots 0 - 1 Cheetahs

Try Again

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

main.js（规则与系统源码）、index.html（界面与入口）、evidence/current-runtime.json（本轮运行记录）、screenshots/step-75.png 至 step-77.png（结算画面）

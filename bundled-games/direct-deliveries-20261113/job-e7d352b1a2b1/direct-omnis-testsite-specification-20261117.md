# Play OMNIS Global Initiative - Free Online Game | Rosebud 游戏规格说明书

规格标准：V5.1

## 1. 基础事实

**维度定义**：让读者第一眼知道“这是什么类型、什么操控体验的游戏”，以及它的技术栈。

**内容说明**

Phaser 3.70.0＋JavaScript的原生回合卡牌策略单机AI模式，Tone 14.7.77音频。原本地AI与玩法保留，联机数据库和宿主工具退役。52实测原结束回合、AI卡牌效果并返回玩家第2回合；未验证胜局。来源：main.js、gameLogic.js、evidence/direct-repair/runtime.json。

## 2. 资源类型

**维度定义**：游戏中游戏内容元素的资源类型是什么——即在哪个引擎运行下的资源格式。

**内容说明**

原WebP/PNG卡牌/阵营插画、MP3、WOFF2；173项缺失原图音素材和8份字体按原URL取得并留SHA。原ES模块22个、导入58条均本地闭合。来源：evidence/direct-repair/material-intake-20261116.json、pack-preparation.json、dependency-closure.json。

## 3. 核心挑战维度

**维度定义**：游戏核心玩法主要挑战 / 满足人的什么。

**内容说明**

规则要求管理行动、BTC收入及卡牌效果，在连接图争夺中立群组，原攻击/对齐/竞价规则存在。来源：gameLogic.js、GameGraph.js；玩家主动进攻与竞价未实测。

## 4. 操控方式

**维度定义**：操控本身的复杂度 + 需要玩家判断的时机 / 策略复杂度。

**内容说明**

原鼠标选择模式/阵营/卡牌/节点与结束回合按钮；GameGraph原WASD/方向键或空白拖动视野为源码确认。实测仅菜单选择和PASS & END TURN，不称全部控制已测。来源：main.js、GameGraph.js、ui-ledger.json。

## 5. 行为路径

**维度定义**：玩家一局里重复做什么。

**内容说明**

原路径为选择本地AI模拟→默认AI配置→选阵营→玩家行动→结束回合→原AI行动→下一玩家回合。实测玩家选择PASS，观察原AI卡牌和效果后页面已出现第2回合玩家阶段文本；未实测玩家攻击分支。来源：main.js及runtime.json。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从开始到结束的流程 + 每个关键节点的潜在流失风险点。

**内容说明**

原标题→AI Simulation Setup→6阵营选择→原棋盘/手牌→回合阶段；原胜利检查与教学保留。实测至第2回合，未抵达胜利。没有实测耗时/流失风险数据。来源：main.js、tutorial.js、gameLogic.js及截图。

## 7. 成长路径

**维度定义**：玩家如何推进变强。

**内容说明**

本局按原群组控制、收入/资金、行动及阵营特殊胜利条件推进；未添加跨局成长。原本地模式无整局断点存档，仅教学偏好写localStorage。来源：gameLogic.js、main.js。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：游戏是否具备“明确目标 → 明确规则 → 达成反馈 → 奖励激励 → 下一目标”的完整闭环。

**内容说明**

目标：按原通用或阵营胜利条件推进。规则：玩家与本地AI依原回合收入、行动、卡牌/攻击/竞价运作。反馈：原卡牌展示、战况与节点数值。激励/下一目标：原群组/资金和胜利条件。实测有限闭环为玩家PASS→AI原卡牌→抵抗4降0→玩家Round2；未验证完整胜负闭环。来源：gameLogic.js、main.js、runtime.json。

## 9. 玩法规则

**维度定义**：核心循环、玩法规则、目标与进度。

**内容说明**

原DECK、ACTION_CARDS、连接图、攻击/对齐修正、竞价、收入与原本地AI保留。真实InstantDB、房间/聊天/联机初始化退役，采用原isMultiplayer=false路径，不伪造真人对手或服务器数据。来源：gameLogic.js、main.js、source-preservation.json。

## 10. 数值配置

**维度定义**：影响玩法的关键数值。

**内容说明**

原每回合2行动、2次免费转账；默认3个AI。实测Algorithmic初回合资金13、收入3、力量8；六阵营界面存在。AI Outrage Supernova本轮实际将目标抵抗4降0；页面全文ROUND 2 — CHOOSE YOUR ACTION (2 available)只读查找1/1。来源：gameLogic.js、step-9.png、ai-national-security-effect.png、round2-human-full-find.png。

## 11. 关卡配置

**维度定义**：关卡结构、递进规律、难度曲线。

**内容说明**

原完整模拟对局及脚本教学，不是固定5关版本；教学源码7回合与控制3群组的独立条件保留。实测为默认3AI模拟至Round2，未完成教学或全局胜利。来源：tutorial.js、gameLogic.js及ui-ledger.json。

## 12. 系统设计

**维度定义**：功能系统清单、UI 流程。

**内容说明**

原模式、AI设置、阵营、棋盘、手牌、竞价、资产、战况/规则界面保留；实际联机入口不可启动，相关数据库链移出。没有改变原单机设置或强制通关。来源：index.html、main.js及source-preservation.json。

## 13. 主题化包装

**维度定义**：游戏的题材 / 世界观包装。

**内容说明**

原OMNIS Global Initiative阵营权力网络题材，使用原卡牌插画、阵营标识和文字。来源：gameLogic.js的FACTIONS/DECK及assets/；没有生成替代美术。

## 14. 养成系统 + 经济系统

**维度定义**：玩家如何成长、经济如何循环。

**内容说明**

BTC为原本局游戏资源，含收入、投入、转移、控制和摧毁规则；不是实际链上支付。实测初回合收入与AI效果；未验证玩家竞价和完整经济平衡。原无整局保存实现，刷新继续未实测。来源：gameLogic.js、main.js。

## 15. 角色 / 单位设定

**维度定义**：有哪些角色/单位、各自定位（玩法层面）。

**内容说明**

原6阵营：Algorithmic Overlords、Corporate Megabloc、National Security Apparatus、Culture-War Architects、The Crypto Cult、The Hidden Hand，各自原power/income/resistance/能力/胜利定义保留。实测选Algorithmic，对手Crypto Cult及National Security原卡牌行动可见；未逐阵营试玩。来源：gameLogic.js的FACTIONS与截图。

## 16. 商业化

**维度定义**：靠什么变现。

**内容说明**

当前运行包无真实货币支付或广告奖励逻辑；未加购买/奖励替身。外部宿主工具和InstantDB实际启动依赖退役。原卡牌BTC为本局数值。来源：main.js、index.html、gameLogic.js及OFFLINE_DELIVERY_CHECKS.json。

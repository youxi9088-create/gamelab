# Squadron 游戏规格说明书

格式版本：V5.1

仅记录有依据的实现层事实；字段非必填。空白表示代码未披露或未登记，不代表不存在、不可玩或验收通过。

## 1. 基础事实

**维度定义**：游戏类型、操控体验和技术栈。

**内容说明**

- 游戏名称：Squadron

**玩法类型**

太空飞行射击 / 动作

**操作方式**

鼠标移动 → 转向（需 pointer lock）
W / 上箭头 → 增加油门
S / 下箭头 → 减少油门
A / 左箭头 → 左滚转
D / 右箭头 → 右滚转
Shift → 加速推进
左键 / Space → 激光射击
右键 / E → 锁定并发射导弹
Escape → 释放鼠标指针
手柄左摇杆 → 转向；右摇杆/肩键 → 油门/滚转；A → 加速；RT → 激光；LT → 导弹（源码确认，实机未接手柄）

**视角与布局**

第三人称追尾视角（可切换 cinematics）

**画面维度**

3D

## 2. 资源类型

**维度定义**：内容元素类别及其引擎资源格式。

**内容说明**

## 3. 核心挑战维度

**维度定义**：核心玩法所涉及的挑战类型及主次。

**内容说明**

**核心体验**

快节奏太空缠斗、小队配合氛围、倒计时压力下的目标优先级决策。

## 4. 操控方式

**维度定义**：输入方式、输入元素和操控构成。

**内容说明**

**操作方式**

鼠标移动 → 转向（需 pointer lock）
W / 上箭头 → 增加油门
S / 下箭头 → 减少油门
A / 左箭头 → 左滚转
D / 右箭头 → 右滚转
Shift → 加速推进
左键 / Space → 激光射击
右键 / E → 锁定并发射导弹
Escape → 释放鼠标指针
手柄左摇杆 → 转向；右摇杆/肩键 → 油门/滚转；A → 加速；RT → 激光；LT → 导弹（源码确认，实机未接手柄）

## 5. 行为路径

**维度定义**：玩家在一次核心循环中重复执行的动作顺序。

**内容说明**

**核心玩法**

驾驶星际战斗机攻击巨型战舰 dreadnought 的关键系统：先摧毁两个护盾穹顶解除护盾，再摧毁机库与舰桥，最后攻击暴露的反应堆核心；同时抵御来袭敌机与炮塔。

## 6. 游戏路径（关键节点 + 流失风险）

**维度定义**：从启动到结束的流程节点及已披露的风险。

**内容说明**

**游戏流程**

开始：标题菜单选择 Fly Solo 进入任务；操作：驾驶战机按目标提示攻击护盾穹顶/机库/舰桥/反应堆，同时躲避敌机；结果：战舰被毁则胜利，战舰跃迁或玩家被全灭则 MISSION FAILED；继续：结算面板显示分数，点击“再玩一次”重启任务。

## 7. 成长路径

**维度定义**：玩家推进和变强的途径。

**内容说明**

**奖励与成长**

任务内无角色成长，以波次与目标阶段推进；计分依据击杀、炮塔与系统破坏，结算后分数归零重来。

## 8. 核心闭环（目标-规则-反馈-激励）

**维度定义**：目标、规则、反馈、激励和下一目标。

**内容说明**

## 9. 玩法规则

**维度定义**：核心循环、操作、胜负和结算规则。

**内容说明**

**目标、规则与结算数值**

目标：在倒计时 10 分钟 dreadnought 跃迁前，依次摧毁两个护盾穹顶→两个机库与舰桥→反应堆核心。
成功：反应堆被摧毁，显示 DREADNOUGHT DESTROYED。
失败：倒计时归零战舰跃迁、玩家 reserve ships 耗尽且被全灭、或主动放弃。
计分：源码显示结算表含 Kills、Turrets、Systems、Score 四项，实机结算得分为 0。

**已验证流程与未覆盖范围**

实机验证：标题菜单加载、Fly Solo 进入任务、飞行控制反馈、战斗反馈、失败结算、再玩一次重启、无外部请求。
仅源码确认：手柄控制映射、多人房间/大厅逻辑、invertStick 保存路径、胜利结算界面。
未验证：在线多人联机、手柄实机操作、完整任务胜利流程、长期存档跨刷新恢复、后续关卡或额外内容。

## 10. 数值配置

**维度定义**：影响玩法的生命、概率、时长、速度和经济等数值。

**内容说明**

## 11. 关卡配置

**维度定义**：关卡布局、目标、数量、递进和难度参数。

**内容说明**

**内容规模**

单一任务场景：围绕 dreadnought 的固定战场，包含护盾穹顶、机库、舰桥、反应堆、炮塔与多波敌机；未验证关卡数量或后续任务。

**场景、关卡与难度设计**

开放 3D 战场 centered on dreadnought；关键目标按距离与方位标记；战场存在边界，飞出边界会被自动转向拉回。

## 12. 系统设计

**维度定义**：功能系统及界面流程。

**内容说明**

**玩法系统与相互作用**

飞行系统：基于油门、滚转、俯仰/偏航的六自由度运动，含加速能量管理。
战斗系统：激光即时命中、导弹需锁定（HUD 显示 LOCKED — FIRE MISSILE）。
伤害系统：飞船 HP 归零后消耗 reserve ship 重生，reserve 耗尽则任务失败。
目标系统：护盾穹顶保护其他系统，按阶段更新目标文本。
网络系统： multiplayer 通过 WebSocket 连接游戏服务器，solo 流程不启用。

**界面流程与反馈**

标题菜单：STARFIGHTER STRIKE / SQUADRON，两个主按钮 Fly with friends / Fly solo，下方任务简报。
任务 HUD：顶部目标与倒计时，左上小队列表，右上分数/备用船/波次，左下船体/加速条，右下导弹锁定指示，底部操作提示。
结算界面：MISSION FAILED / DREADNOUGHT DESTROYED、原因、分数表、你的分数。
本地宿主浮层：本局结束 / 得分 / 再玩一次。

**存档方式**

保存内容：仅 invertStick（手柄反转 Y 轴）设置通过 localStorage 持久化；源码确认 local-host.js 的 saveGameState 会写入 localStorage。
触发：切换“Controller · invert stick”时调用 Q.saveState。
恢复：启动时读取 initialGameState.gameState.invertStick 应用到 P.invertY。
不保存项：任务进度、分数、战机状态不在本地保存，死亡或任务结束后从任务起点重来。

## 13. 主题化包装

**维度定义**：文字、叙事、命名及美术内容。

**内容说明**

### 实际运行图解

![实机图 1](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-0.png)

图 1：实际操作记录 1。画面文字：DESTROY THE SHIELD DOMES (2 LEFT)
AFT DECK, FLANKING THE BRIDGE · THE DEFLECTOR PROTECTS EVERY OTHER SYSTEM
HYPERSPACE JUMP IN 9:58
SQUAD
本地玩家 ◂
0
SCORE 0
RESERVE SHIPS 4
WAVE 0
HULL
BOOST
SPEED 64 · THROTTLE 70%
LOCK-ON MISSILES
MOUSE STEER   WS THROTTLE   AD ROLL   SHIFT BOOST
LEFT CLICK/SPACE LASERS   RIGHT CLICK/E LOCK-ON MISSILE   (ARROW KEYS WORK TOO)
STRIKE BEGINS
TAKE DOWN THE SHIELD DOMES ON THE AFT DECK

![实机图 2](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-1.png)

图 2：实际操作记录 2。画面文字：DESTROY THE SHIELD DOMES (2 LEFT)
AFT DECK, FLANKING THE BRIDGE · THE DEFLECTOR PROTECTS EVERY OTHER SYSTEM
HYPERSPACE JUMP IN 8:50
SQUAD
本地玩家 ◂
0
SCORE 0
RESERVE SHIPS 0
WAVE 2
HULL
BOOST
SPEED 82 · THROTTLE 100%
LOCK-ON MISSILES
ACQUIRING LOCK…
ENEMY WAVE 2
FIGHTERS INBOUND

![实机图 3](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-2.png)

图 3：实际操作记录 3。画面文字：DESTROY THE SHIELD DOMES (2 LEFT)
AFT DECK, FLANKING THE BRIDGE · THE DEFLECTOR PROTECTS EVERY OTHER SYSTEM
HYPERSPACE JUMP IN 8:46
SQUAD
本地玩家 ◂
0
SCORE 0
RESERVE SHIPS 0
WAVE 2
HULL
BOOST
SPEED 82 · THROTTLE 100%
LOCK-ON MISSILES
LOCKED — FIRE MISSILE
HULL CRITICAL
ENEMY WAVE 2
FIGHTERS INBOUND

![实机图 4](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-3.png)

图 4：实际操作记录 4。画面文字：DESTROY THE SHIELD DOMES (2 LEFT)
AFT DECK, FLANKING THE BRIDGE · THE DEFLECTOR PROTECTS EVERY OTHER SYSTEM
HYPERSPACE JUMP IN 8:44
SQUAD
本地玩家 ◂
0
SCORE 0
RESERVE SHIPS 0
WAVE 2
HULL
BOOST
SPEED 0 · THROTTLE 100%
LOCK-ON MISSILES
LOCKED — FIRE MISSILE
SHIP DESTROYED · RESERVE SHIP LAUNCHING IN 2
ENEMY WAVE 2
FIGHTERS INBOUND

![实机图 5](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-4.png)

图 5：实际操作记录 5。画面文字：MISSION FAILED
HYPERSPACE JUMP IN 8:43
SQUAD
本地玩家 ◂
0
SCORE 0
RESERVE SHIPS 0
WAVE 2
HULL
BOOST
SPEED 0 · THROTTLE 100%
LOCK-ON MISSILES
LOCKED — FIRE MISSILE
ENEMY WAVE 2
FIGHTERS INBOUND

![实机图 6](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-5.png)

图 6：实际操作记录 6。画面文字：ENEMY WAVE 2
FIGHTERS INBOUND
MISSION FAILED
THE SQUAD WAS WIPED OUT
Pilot	Kills	Turrets	Systems	Score
本地玩家	0	0	0	0
YOUR SCORE 0
本局结束

得分：0

再玩一次

![实机图 7](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-6.png)

图 7：实际操作记录 7。画面文字：ENEMY WAVE 2
FIGHTERS INBOUND
MISSION FAILED
THE SQUAD WAS WIPED OUT
Pilot	Kills	Turrets	Systems	Score
本地玩家	0	0	0	0
YOUR SCORE 0
本局结束

得分：0

再玩一次

![实机图 8](/api/versions/v-e1b5bff5dc47/specification-images/screenshots/step-7.png)

图 8：实际操作记录 8。画面文字：DESTROY THE SHIELD DOMES (2 LEFT)
AFT DECK, FLANKING THE BRIDGE · THE DEFLECTOR PROTECTS EVERY OTHER SYSTEM
HYPERSPACE JUMP IN 9:57
SQUAD
本地玩家 ◂
0
SCORE 0
RESERVE SHIPS 4
WAVE 0
HULL
BOOST
SPEED 64 · THROTTLE 70%
LOCK-ON MISSILES
STRIKE BEGINS
TAKE DOWN THE SHIELD DOMES ON THE AFT DECK

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

源码：source-analysis/js-2.16.0-3049e171.../readable.js 中的 Es/UI 类、ls 飞船 step、mission 状态机、Q SDK 封装；local-host.js 本地宿主实现。
本轮证据：runtime steps 0-7 截图与文本反馈，包含 STRIKE BEGINS、MISSION FAILED、本局结束面板；runtime.external=[] 表示无外部请求。

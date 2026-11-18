原HTML5发布源码，不是作者React工程。game/assets/pile-up-poker.js仍含原Redux发牌/牌型/拖牌组件，可解析拆分，移植需解耦React/store与原样式；原字体、音效和规则文档保留。
累计5次真实玩家输入：首载原生牌局→拖方块6至第一行第一格→拖黑桃6至第二格→拖黑桃K至第三格→拖梅花9至第四格。第3步起原PAIR/得分$5，第5步原下一轮10♥→Discard按钮出现；原生round仍0、弃牌数0、完成false，没有点击下一轮。五张原截图已打开核对，5份原生状态与真实鼠标轨迹保留。未修改牌堆、随机种子、分数、时间或存档，未调用业务handler。
原MSN宿主、Puzzmo鉴权/每日题/GraphQL/提交/bonus/外站跳转及宿主触觉消费者退役，不加载宿主JS或msn-package.json；不伪造SDK、PuzzleStateDTO、用户/令牌/服务器响应。原ac(state,undefined)本就调用原Math.random→Xs生成本地牌堆，沿原Hs/tc真实输入串保存/恢复逻辑；不指定随机种子或牌序。33处真实Howler音频URL改为同源原MP3。
远端52实际Chromium观察41个同源请求/41响应均HTTP200，外联/失败/脚本错误0，10条原Howler音频自动播放warning保留；46个运行文件另逐项HTTP和SHA通过。自有浏览器实际退出0，原closed日志5步且Node30396已不存在。
未验证下一轮弃牌、整局结算、刷新恢复、新牌局、说明弹窗、声音开关和幻想模式。原DOM包含未显示的Game Complete及背面牌文本，不能作为可见完成或操作依据；本次仅按已打开截图与原生face-up visibleDraw选择当前明牌。真实完成标志始终false，不把第一行得分冒称整局胜利。
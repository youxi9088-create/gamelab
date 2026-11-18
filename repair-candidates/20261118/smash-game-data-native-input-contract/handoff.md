# A组交接：GameData真实协议已核清，本地事务尚未实现


### 2026-11-18 Smash GameData真实冷启动协议和七个原生预设核清

上轮v9r2属于实际源码进展，212文件候选与GitHub均已核对。本轮继续纯静态核查，不重启游戏、不扣步，不重复同一锁屏观察或催促。测试站2026-11-18T03:23:09Z直连绕过代理仍A35completed/1review/45blocked/9queued/3failed，57未达，无本轮新增待验收；SSH94663当前仍有活跃控制句柄，继续只复用真实连接。

确认真实链路：SKServicesLoader.euv12611先原GameData.Init101051，再调用26067传实际UserService.field68本地UID；26067写GameData.field20 UID并调用8457，8457的第二参数实际bool，不能把它错当UID。GameData.Init/fyd43613将GameModeConstants.DEFAULT_PLAY_OPTIONS赋给field12；该字段真实类型PlayOptionsData，不是一个完整GameData或物品目录。原默认静态field offset120，4个default+3个special由原105580、44974、7298构造，包含地图名/模式/武器/队伍等真实字段，不得用4个空对象或擅自减少关卡来代替。7个预设不是7关，更不等于7图已运行。

原RVA严格解码7个源地图名：default1 Smash Island、default2 Smash Fort、default3 Lava Pit、default4 Steky's Speedway；special1 Sky Arena - Tunnels、special2 Graveyard CTF、special3 Slick 'n Slide。保留全部原162资源包、44场景变体；不把原默认预设当成完整玩法/地图菜单实测。原规则位掩码及构造逻辑保留原源码，没有执行或重新编造规则数值。

GameData实际云桥为FirebaseDatabaseBridge，原43611调用43638构造请求/登记回调并走云函数，挑战更新43637也走云桥；未请求这些API。GameSettings5302返回实际原参数类型，不能当作ready布尔。原17602要求Dictionary<string,object>；dayId字符串写field92，原43610对playOptions.ToString写field68并做真实类型/数据应用，原10177等待这两个实际内容。38个真实键已按原RVA/函数体逐项解码，包括dayId、playOptions、countryCode、fetchUserData、seasonData、dailyChallenges、seasonChallenges、uncollectedRewards、spinHighlights等。6173的真实常量是DEFAULT，不是错误文字；原DEFAULT特殊路径确实存在，但不能直接给field68/92填DEFAULT或造云端JSON来让门禁通过。原奖励/赛季/挑战消费仍有副作用，未完成退役或本地化审计。

已独立绑定原JsonConvert.DeserializeObject<Dictionary<string,object>>(string)为methodSpec85852、method71098、metadata-use5690372，原初始化调用者100493/100755/100756，shared native2114。8个原数据方法的参数核对并纠正首轮语义猜测；当前源审计共9个方法，包含原GameData consumer17602。这个绑定只说明真实类型入口存在，不等于可以喂假后端响应或调用成功。原完整C仅阅读，从未在开发机编译/运行原游戏函数。

下一步需要实现真正的本地GameData事务：读取原生实际默认预设和已加载的原目录，与真实本地身份/状态绑定，先验证并持久化真实输入，再沿原类型解析/数据应用/完成事件接入；不能只改ready，不能捏造云端dayId、赛季、奖励、权限。尤其应继续确认原17602/43610所有副作用及不适用于本地来源的消费者，保留原门禁和原字节证据。尚没有该本地数据适配器，不把这份源协议审计写成v10已修复或已激活。

当前运行候选仍v9r2，候选212文件和原任务blocked/round3/versionnull保持；上次实际玩家运行仍v4，3/5剩2，未启动观察器/预留第4步。桌面恢复和RustyPick/Craig额外额度请求仍待回复；B组、其它人工暂停、跳过/取消、Cow/采集及下游保持。V5.1运行包不因静态理解增加就覆盖；新原版事实单独归档，实际耗时/Token/费用未知null。

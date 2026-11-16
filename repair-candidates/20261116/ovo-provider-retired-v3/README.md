# OvO 外联退役修订 v3（未实机验收）

基线为 GameLab 已验收版本 v-b19969c5d859 的独立 v2 修订。相对 v2 仅改 adconfig.json 与 c2runtime.js：广告配置选择原生无 provider 分支，统计插件的移动/浏览器初始化调用退役。原 wrapper/vendor 未改，没有 SDK 替身、假广告成功或免费奖励。

隔离 VM 核对原 wrapper enabled=false、hasAds=0、rewarded/interstitial=false；未初始化的原统计 vendor 四类事件不发 XHR/fetch。295 个候选文件与远端隔离目录逐摘要一致。此目录只归档修订的两份源码与证据，不是完整可运行包，也未增加已交付数量。

该款累计 5 步已用完。v2 首关截图不验证 v3，ProUI 错误、后续关卡及完整未截断网络证据仍待核实。本修订未注册新版本、未推送游戏平台、未改变原版本验收或人工暂停。

逐款 Codex Token、实付费用与独占处理工时没有可核对账单，保留未知；测试夹具不计玩家实机操作。

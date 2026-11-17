# Smash Karts · 原生数据服务和内嵌原始目录（源码材料，未交付）

当前job-3db06205247a仍blocked、version为空、非人工暂停。没有新运行候选或游戏输入，保留0/5；没有安装、自动接续、入库或恢复下游供货。

7类原生服务共235原函数有完整指令材料，其中233可结构化读取。两个复杂函数26015/43610导致初始WABT内存越界，两次失败原分析视图保留本地；它们在本证据只使用原始完整指令，不将分析用unreachable片段冒充原函数或交付代码。所有分析切片均NOT-RUNTIME，绝不执行或打入游戏。

原UnityFS另由纯数据读取器解析404块/12成员，跟UnityPy得到的原resources.assets对象字节精确交叉核对。原GZIP里恢复1493条物品（8类）与48组内容，保留原数据/价格/解锁声明。可编辑数据不是全部prefab已取得或游戏已完成。ftueItems原文为空；global与tallTeamCustom为词表，不能误认完整游戏设置。

实际设置链：原GameConstants初始化gameSettingsUrls/，字段13指向该路径；原GameSettingsService注册common/节点，通过FirebaseDatabaseBridge.fug、JavascriptMessageSender.gfb、原Md/_GetValueJS调用getValueTT。JS真实读取Firebase child后才传实际值回Unity，后续原函数26016对返回的两个URL执行UnityWebRequest.Get。因此日志“from CDN”不是直接CDN地址证据。本轮没有数据库/登录/网络请求、地址猜测或返回成功替代。原GameSettingsData构造器含原默认值，也不等于完整服务初始化。

支持包在52逐SHA核对，并从52原WASM重新核对250个实际函数体；52重新解原容器并验证两个原对象的名字/字节范围/GZIP校验/原JSON，物品1493和内容组48。对象path_id来自本地UnityPy，52未完整重解析序列化对象表，回执明确区分。原源码、运行包、SDK/provider/账号/物品收益均不变。本地房间、角色和AI初始化及实际玩法仍待实现和验证。

源码工具和原始数据可用于后续二次修改，不是完整作者工程；V5.1仅记录可证事实，未知耗时/Token/缓存/费用为null。

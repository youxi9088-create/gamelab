# Smash Karts · 资源本地化未交付候选

仅完成资源连接阶段：两原目录各83条资源URL本地化，162原包保持；原桌面/移动metadata的资源前缀换成等长相对路径，其余原生数据和代码保持。原已解压的构建文件使用.data/.wasm/.js扩展名，原HTML配置同步；4个字体源文件补齐。原源码和失败准备目录均保留，不覆盖历史。

原两份配套.hash已真实取得，均不同于m_BuildResultHash，也不同于目录MD5。工具按Unity使用的SpookyHash V2重算，2个Unity公开向量与2份原目录实际.hash全部匹配；改写后的目录/hash一致，m_BuildResultHash与资源哈希保持。没有禁用或绕过引擎校验。

Unity官方目录说明：https://docs.unity3d.com/kr/Packages/com.unity.addressables%401.21/api/UnityEngine.AddressableAssets.Addressables.LoadContentCatalogAsync.html
Hash128官方定义与向量：https://docs.unity.com/en-us/engine/6000.3/script-reference/unityengine/hash128/compute
公开SpookyHash V2原算法（Bob Jenkins，public domain）：https://burtleburtle.net/bob/c/SpookyV2.h

当前SDK/Firebase账号、数据库、广告等仍是原在线代码；只是原静态脚本已映射到捕获的原本地文件，不代表服务已退役。没有本地房间/玩家/AI启动适配，没有SDK/provider假成功或奖励。其他动态StreamingAssets/资源闭包及真实Unity相对URI加载尚未核对。

本候选没有启动或试玩，0/5额度保持，不安装/接续/入库/推送下游。V5.1只记录当前事实，未知独占耗时/Token/缓存/费用null。资源阶段不能冒充整款离线通过或待验收。


## 启动配置补齐v2

本修订按原metadata token、Wasm方法表和原入口HTML逐级确认StreamingAssets/aa/settings.json，原站启动配置、空初始目录及声明hash均HTTP200。初始目录Hash128与源hash一致，保留原目录字节；仅将settings中的远程hash指向同源RuntimePath/catalog.hash，其他设置/缓存键/禁用开关/SDK行为保持。它不同于后续桌面和移动目录，不替代游戏资源。尚未启动和实机观察。

完整候选205文件逐SHA；v1不可变基座见Git ad9cd7866e9214ec7a414c50867cba64c098dbf8。本包仅包含增量及复现配方，不是假称完整游戏ZIP。52新candidate包含完整文件。原UI账本0/5保持；不得按候选修订重置。等待52解锁后，观察器candidate根改用D:/GameLab/temp/direct-smash-startup-settings-v2-20261118/candidate，实时账本继续原v1/validation-resources-v1-20261118，勿用不可变observation-materials/初始台账覆盖。未知耗时、Token、费用沿原null，未入库/未接续/无下游。

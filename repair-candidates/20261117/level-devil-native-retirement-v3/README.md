# Level Devil 原生服务退役修订 · 尚未交付

本目录为真实原草稿v-1f8b04b1ee19的静态源码候选，不是待验收，也没有启动过新修订。原job-ca75d464d2d7仍failed/round6，任务/版本/预算未变。原5次累计界面动作已用尽，不重置。

52不可变阶段D:/GameLab/temp/direct-leveldevil-native-retirement-20261117-v3，45候选文件、17份配套工具/证据已逐SHA验证，并与当前原artifact的7个WASM/归档输入SHA匹配。完整转移清单88ec3ac9b1922205a0fc3679b9436eefb7cd5d40c63b80afac77fd9eb3b12f08。

实际修复：原生构造器2356→PokiSdk注册void717的7实参调用替换为7个平衡drop，其他4420函数体不变；原JS14个导入仅留异常守卫，SDK对象和旧本地领取弹框实际删除，185原引擎JS函数语义保持。145原Lua中15份仅移除真实HTTP/上传/分享/统计与广告成功边界，130份保持原字节；803资源中788份解码内容不变。原三章关卡、物理、碰撞、陷阱、角色、本地编辑和原存档保留，没有改站点/许可检查或全局平台标志，没有伪造服务/支付/广告成功或免费跳关。

原资源查找标识、dmanifest/projectc和原校验/签名逻辑保留，不修改验证逻辑。新归档是否被实际引擎接受仍须实机；WASM格式、全部资源重读SHA、Lua语法及5个自编夹具通过不代替真实运行。旧SDK共享脚本与旧截图/旧运行证据均有历史来源，不套用成新修订通过。

V5.1完整16维度，区分旧首房间观察与新修订未测；独占处理耗时/Token/费用未知仍null。静态单机finding0、证据路径完整，offline_status仍pending/runtime_verified=false。support/为非运行工具，正式游戏只取work/，不能把Python工具混入供货zip。

工具读取格式参考 [Defold resource_archive.cpp](https://github.com/defold/defold/blob/dev/engine/resource/src/resource_archive.cpp)、[resource_util.cpp](https://github.com/defold/defold/blob/dev/engine/resource/src/resource_util.cpp)；源码解析使用[luaparser 4.2.0](https://pypi.org/project/luaparser/4.2.0/)。隔离测试只运行自编夹具，不运行真实游戏。没有启动供货或模板抽取。

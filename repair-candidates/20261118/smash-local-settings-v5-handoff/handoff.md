# A组交接：原生默认配置已适配，本地存档与对局仍待完成


### 2026-11-18 Smash原生默认配置消费者v5与本地存档ABI

上轮实际v4第3步已证明目录加载及ByteBrew/FirebaseAnalytics启动消费者退役，但加载页仍被真实Firebase匿名认证失败等阻断。本轮没有新增玩家操作，3/5剩2台账未改。测试站直连2026-11-18T01:30:29Z仍A35completed/1review/45blocked/9queued/3failed，57未达目标，无新增待验收。此前完整库存无变化，不重复403/404、采集或已失败策略。

v5已把原GameSettingsService.gbs43424中common/platform远端URL查询消费者改为调用原gbx26015(this,null,null,MethodInfo=null)。原方法自行分配空字典，进入完整应用事务：原GameSettingsData构造43254、字段应用、其自身合法ready及其余字段/事件均由原方法完成。不是构造假的Firebase/URL/下载成功，也没有在适配器中直接写ready或吞异常。采用原构建内置默认配置这一转换设计，不宣称取得原服务器实时配置；原应用函数和8468字节默认构造函数SHA均保持。原消费者117字节body的哈希先核对再替换，完整Wasm静态校验exit0，不执行真实游戏代码。

相对v4只改消费者43424，其他138242函数体逐SHA不变；相对最初原版总计35469/106283/43424三处改变，其他138240保持。网页、真实Firebase认证代码、框架、162bundle、角色/关卡/经济逻辑字节保持。真实52独立D:\GameLab\temp\direct-smash-local-settings-v5-20261118/candidate206文件全部SHA，候选清单093665e9025a4d7254b8167c66b3a7e36b86d629697a8ea584632f1920e47a65、增量清单80d07a1337b02770b5c6aa6e834a38c3bcd4fe0cd870b18db3d041e9bd149a1c；正常work-log幂等记录，原blocked/round3/versionnull任务整行/暂停/历史及3/5账本保持，没有激活进当前任务、观察服务、接续、入库或下游。GitHub 1bcca079b8d079ae4dd97128da6c4d447279ec2f已17blob核对/push0/ls-remote一致。v5未运行，不能继承v4局部实测成当前候选玩法通过。

为接通真实本地用户生命周期，已从原metadata→真实模块方法指针→Wasm元素表逐项恢复54方法，并对PlayerPrefs与字符串/Guid关键函数补核实际ABI：SetString2875、GetString3224/7968、HasKey1698、Save6197；JsonConvert.SerializeObject1526与泛型共享解析2114；String.Ctor67864为char*+start+length+MethodInfo→managedstring；Guid.NewGuid1794为out结构体指针+MethodInfo→void，ToString1998消费结构体引用。没有把结构体返回当int。原GetString/SetString/Save均转入原Unity内部调用，SetString失败原本抛异常，后续不能吞错或清档重置。

原UserService.Init中字段104/par实际类型FriendRequests，17525为其bpj清理方法，不是本地存档器。UserData/ReadOnly初始化仍原17870/25900/43206/43161/43198。泛型DeserializeObject声明没有直接方法指针，必须保留原共享body2114及各自MethodInfo，不以普通DeserializeObject/字典强塞代替。54方法、各参数指针/数组元素类型及nativeABI、10段原存档/JSON/字符串/Guid可读源已移交；仍是源码证据，不是已写好的本地用户/房间/AI，不计游戏完成。

pendingstatus备份后指向v5，分开记“上一v4已实测”与“当前v5未运行”。独占时间/输入/缓存/输出Token/费用未知null。下一步可使用上述原生序列化、真实本地存取及原构造器完成可失败、保留旧档的本地用户事务，再接离线房间/玩家/AI；不得造UID认证、直接ready、免费解锁、支付/广告成功或静默丢弃坏档。剩2步不为局部配置改动盲目消耗。MergeDefense补读确认menu_demo是世界选择/后续进度入口，非纯推广，缺源403未变，未删除原跳转。B组、其他实际暂停、跳过/取消、Cow/采集/下游均保持。总目标仍未完成，保持active。

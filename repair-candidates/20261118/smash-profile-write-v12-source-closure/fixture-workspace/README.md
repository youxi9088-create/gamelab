# 自编上传消费者隔离复现

运行 `node test_smash_profile_write_fixture_v12_20261118.cjs`。这里只实例化两份自编fixture Wasm，没有原游戏函数/资产；期望3类分支保持参数副作用、本地数据/基线与事件次数，上传入口未调用。不是52实机验证。

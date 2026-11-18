# 自编认证消费者隔离复现

运行 `node test_smash_auth_consumer_fixture_v13_20261118.cjs`。仅实例化本目录两个自编Wasm与mock，预期3类：原基类执行一次、pause/focus本地记录保持、不调用云认证恢复。没有原游戏函数/资产执行，不是52实机通过。

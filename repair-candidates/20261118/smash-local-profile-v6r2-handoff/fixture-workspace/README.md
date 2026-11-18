# 自编隔离验证复现

此目录全部WAT、Wasm及数据替身均为自编测试，不含原游戏函数体。需要Node与Python，以及wabt1.0.39；安装在当前目录下native-analysis-tools，不改全局依赖。

```text
npm --prefix native-analysis-tools install --ignore-scripts
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_bridge_20261118.wat -o smash_local_profile_bridge_20261118.wasm
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_fixture_20261118.wat -o smash_local_profile_fixture_20261118.wasm
python test_smash_profile_native_linker_20261118.py
node test_smash_local_profile_20261118.cjs
```

期望：链接器ABI不匹配被拒绝、旧自编函数字节不变，14项本地档案检查通过。勿把这些隔离通过当原游戏/原数据/真实浏览器存档通过，也不要在开发机运行完整原游戏Wasm。

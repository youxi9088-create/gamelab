# 17项自编隔离检查复现

只运行本目录自编WAT、JS及数据替身，不含原游戏函数体或真实存档。依赖Node/Python/wabt1.0.39，局部安装不改全局。

```text
npm --prefix native-analysis-tools install --ignore-scripts
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_bridge_20261118.wat -o smash_local_profile_bridge_20261118.wasm
node native-analysis-tools/node_modules/wabt/bin/wat2wasm smash_local_profile_fixture_20261118.wat -o smash_local_profile_fixture_20261118.wasm
python test_smash_profile_native_linker_20261118.py
node test_smash_local_profile_20261118.cjs
```

期望链接器ABI拒绝检查和17项隔离通过；这不是原生游戏或真实浏览器持久化通过。不得在开发机运行完整原游戏Wasm。

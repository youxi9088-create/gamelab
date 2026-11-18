# 本地原生内容事务隔离复现

只运行自编WAT/JS和mock数据，不运行原游戏函数/资产或真实档案。依赖Node、Python与局部wabt1.0.39。

```text
npm --prefix native-analysis-tools install --ignore-scripts
python direct_smash_local_game_data_v10_fixture_20261118.py
```

期望10类检查通过；不是52的原生菜单/比赛/玩家/AI或持久化通过。

Game Lab 本地平台 —— 运行包
=====================================

【怎么用】
  双击 start.bat     启动平台，约 10 秒后浏览器自动打开
  双击 stop.bat      停止平台
  双击 scan_now.bat  立即执行一次采集扫描（平台需已在运行）

  启动后不要关那个黑色窗口，关掉就等于停服务。


【启动后有什么】
  管理界面   http://127.0.0.1:8765
  试玩服务   http://127.0.0.1:8766

  以下三项都已包含在平台进程内，不需要另外启动：
    - 转换执行器   自动拉起 executors/worker.py，父进程退出时随之退出
    - 采集调度     每天 09:00 自动扫描一次；每 30 秒检查一次任务
    - AI 模型      kimi-k2.7-code（配置在 data/services.json，改完立即生效）


【数据在哪】
  平台数据   F://youxi//door//data//platform.sqlite3
  游戏产物   F://youxi//door//data//artifacts      （89 个，2.65 GB）
  游戏仓库   F://youxi//door//game-library

  合并前的备份在 data\backups\platform-before-cloud-merge-20261027-161644.sqlite3


【注意】
  1. 这个包只是启动器，不含源码。源码在 F://youxi//door，不要移动或删除。
  2. Python 用的是 C://Users//Administrator//.workbuddy//binaries//python//versions//3.13.12//python.exe
     如果这个路径不存在，会回退到系统 python（可能缺依赖）。
  3. 平台只监听 127.0.0.1，局域网内其他机器访问不了。要对外访问请用云端站点。
  4. 采集一天只自动跑一次（09:00）。当天已跑过就不会再跑，需要更多就双击 scan_now.bat。
  5. 数据库可写性已验证。若看到 "readonly database" 报错，检查 data 目录权限。


【出问题怎么看】
  启动窗口里会直接打印请求日志和报错，例如：
    [POST] /api/v1/jobs/claim 200     执行器在轮询，正常
    [GET]  /api/state 200             页面在取数据，正常
  采集相关报错会带 discovery 标记，写进平台的事件记录里。

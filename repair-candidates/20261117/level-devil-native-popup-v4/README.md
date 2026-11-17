# Level Devil v3 三步结果及 v4 原生推广退役修订

用户明确追加3步，仅绑定v3。原累计10步保留，第11预约曾被桌面访问拒绝而未发送，现仅执行该同一预约：单次原生右方向键未观察到确定水平位移；第12次原生上键即时角色姿态和离地约8px，随后站立，不把两帧当完整跳跃/通关；第13次浏览器刷新重新进入章节地图，实际出现 New levels to cry over / New player-created levels just dropped 在线社区推广。累计13/13已用尽，不能重置或用旧授权运行v4。

v4只修本次明确复现的退役遗漏：原Lua79 popups函数仍会在非首次启动时延时显示INFINITEMODE，Lua244 YES仍调用在线无限关卡服务。本次删除该延时推广分支，保留原最后的延时acquire_input_focus；YES走原取消close_popup，不造关卡、成功响应或保存数据。相对v3仅79/244两份资源解码字节改变/801不变，WASM/JS/入口完全不变；相对原版16份服务Lua修改、129份Lua/787资源不变，原dmanifest/projectc和完整性逻辑保留。

47个候选文件已构建，803资源重读和16个修改Lua语法检查通过，静态离线检查finding0，但runtime_verified=false/ready_review=false。V5.1十六维文档按实际新旧边界填写，不能借父v3截图称v4通过。水平移动、出口结算和已取得进度恢复仍未确认。本包不启动游戏、模型、任务、观察器、供货，不改原任务状态/版本/预算/暂停。独占耗时、Token和价格未知仍null。

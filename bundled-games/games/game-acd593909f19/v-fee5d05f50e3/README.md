# 原资源 Three.js 跑酷

用静态 HTTP 服务器启动本目录，打开 index.html。无需构建，Three.js 与选用资源均为本地文件。

方向键/WASD、触屏滑动和底部按钮控制换道、跳跃、滑行；碰撞后可重开，右上角控制声音。

使用原 Jake 网格/骨架/贴图及解码动画，原列车、金币、轨道、地面、楼塔、障碍模型和音频。来源清单见 assets/provenance.json。

运行和玩法以 Three.js 重写，并非完整恢复原 Unity 程序；没有原版全部关卡、任务、商店、联网和账号系统。供学习使用。

## 场景资源更新

房屋、地面、轨道、低栏和高栏已替换为用户提供的“小女孩跑酷”Unity 项目素材；角色、列车、金币、音频和玩法继续使用此前版本。选用文件、来源哈希与尺寸适配见 `original-web/assets/runner-scenery/provenance.json`（发布目录内为 `assets/runner-scenery/provenance.json`）。低栏跳跃、高栏滑行已通过实际交互验证，其他素材保存在独立资源库备用。

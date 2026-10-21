# 合成大西瓜源码迁移说明

来源：https://github.com/Amition/minigame-engine ，固定 commit `2b0b8125309f1394d15206cd1b5b043981a7f4e3`。MIT 许可见 LICENSE。本目录保留上游跟踪的完整源码、引擎、构建工具、测试和 pnpm 锁文件，没有 node_modules 或上游 .git。源项目还含 archer/sandbox 演示，保留以避免上游 typecheck/test 引用缺失。

## 构建

安装 Node.js 与 pnpm 后在本目录运行：

```
pnpm install --frozen-lockfile --ignore-scripts
pnpm typecheck
pnpm exec vitest run game
pnpm build --target "web,wx" --minify
python library-adapter/embed-web.py
```

`dist/web/` 用于复刻中心或静态网站，`dist/wx/` 是微信构建包。后者使用 touristappid，只通过构建检查；尚未在微信开发者工具/真机验证，更不代表上架。替换 app.json 的微信 appid 后重新构建，再进行开发者工具和真机验证。

与上游的源码差异仅为 engine/platform/web.ts 增加可选嵌入资源响应，避免试玩平台 `connect-src none` 禁止音频/manifest fetch。`library-adapter/embed-web.py` 在构建后生成资源字节脚本并插入 HTML。无网络请求代理，无登录/广告服务接入。沙箱环境本地存档自动降级会话内存。

验证证据：TypeScript 通过、112 项游戏测试通过，真实 Edge 浏览器开始、落子、合成计分、暂停/继续、构造溢出失败/重开；最终 release 无调试控制入口。平台项目 qa-output/wechat-browser-report.json 有详细边界。

微信包和 Web 包来自同一游戏源码，不是商业线上小游戏反编译。这个上游项目较新，不作大规模生产稳定性承诺。

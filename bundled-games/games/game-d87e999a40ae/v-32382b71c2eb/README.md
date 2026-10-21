# 合成大西瓜 · 开源微信双端移植

真实上游游戏：Amition/minigame-engine，MIT，commit 2b0b8125309f1394d15206cd1b5b043981a7f4e3。
来源：https://github.com/Amition/minigame-engine 。保留 LICENSE；非商业游戏线上反编译成果。

玩法：点击开始，按住/滑动瞄准后松手投下水果，同级水果接触合成更大的水果并计分；堆积超过警戒线持续一段时间后结束，可暂停、继续或重新开始。

## 包内容
- index.html、game.js：Web release IIFE 试玩；assets/ 与 embedded-assets.js：本地音频和清单（嵌入字节兼容 connect-src none）。
- wechat/：微信 release 构建包，开发者工具可导入；目前 touristappid，未在微信开发者工具或真机验证，不代表已上架。
- 完整可编辑 TypeScript、引擎、构建工具、测试、锁文件和许可集中在 game-library/projects/wechat-fruit/；本运行包不重复携带源码归档。

## 重新构建
进入 game-library/projects/wechat-fruit/；安装 Node 和 pnpm；执行 pnpm install --frozen-lockfile --ignore-scripts，再执行 pnpm build --target "web,wx" --minify。Web 音频需要按 library-adapter/embed-web.py 的嵌入步骤生成 embedded-assets.js，或在不限制 fetch 的常规静态部署中直接使用 dist/web。

改动仅在 engine/platform/web.ts 增加本地嵌入资源读取，避免不透明 sandbox 对音频 fetch 的限制。保留原游戏核心、程序化美术、声音与规则。没有采用商用游戏代码或美术。

验证：TypeScript 通过，112 项上游游戏测试通过；构建 Web 与微信均成功。浏览器实测证据在平台 qa-output/wechat-* 文件。沙箱里最高分存档为会话内存，离开试玩不保留。

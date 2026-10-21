# 微信小游戏 → Web 转换服务 v0.1

独立部署的 HTTP API。上传游戏主包、分包与匹配的引擎插件包，取得异步任务，下载静态 Web 游戏 ZIP 与兼容性报告。服务发行包不包含寿司游戏的代码、美术、原始包或用户存档。

## 能力边界

- 首版适配 Cocos Creator **3.5.1**、微信 `define` 打包格式、`V1MMWX` 或明文 wxapkg。已从回转寿司餐厅流程抽取；其他游戏需要实际运行验收。
- 包括解密、目录还原、JavaScript 模块恢复、引擎模块检查、资源重排、浏览器启动、触控/键盘、音频与本地存储兼容。
- 游戏包和匹配的引擎包由调用方提交。本服务不接受网页链接代替游戏包，也不访问客户设备上的微信缓存。
- 专用无广告适配仅接受已确认的寿司业务脚本 SHA-256；不匹配会失败，不能声称自动识别任意游戏广告。
- 微信登录、支付、云存档、在线对战及远程资源不自动迁移。远程资源未收齐、引擎不匹配或未知包装格式会失败并提供原因。
- `built_unverified` 表示构建完成，**不表示玩法已经验收**。没有自动通关、全流程浏览器测试或恢复原始 TypeScript 工程的承诺。

## 启动

需要 Python 3.11+、Node.js 20+；不需要 pip/npm install。代码携带 MIT 许可的 Acorn 解析器，其许可位于 `vendor/ACORN-LICENSE`。

```powershell
./start.ps1
# 或 python server.py
```

文档：http://127.0.0.1:8770/ 。默认仅监听本机。首次启动生成 `data/local-api-key.txt`；将该 key 给需要使用本实例的调用方，不要把 data 打进发行包。

给不同团队发独立 key，配置环境变量（每个 key 至少 24 字符，以下为占位符）：

```text
CONVERTER_KEYS_JSON={"team-a":"<random-team-a-key>","team-b":"<random-team-b-key>"}
CONVERTER_HOST=127.0.0.1
PORT=8770
CONVERTER_DATA=/path/to/private/data
NODE_BIN=/path/to/node
```

各 key 只能查询、下载自己的任务。暂不提供账号登录、计费、在线 key 管理或公网多租户运营后台。对外部署需要 TLS/反向代理及请求速率限制；私有上传资料和 key 持久化目录独立保存。

## 输入 ZIP

```text
input.zip
├── manifest.json
├── game/
│   ├── main.wxapkg
│   └── resources.wxapkg
└── engine/
    └── cocos.wxapkg
```

`manifest.json`：

```json
{"appid":"wx0029cb0cdba90cd6","engine_appid":"wx0446ba2621dda60a","ad_free":true}
```

这两个 appid 仅为已验证案例。其他游戏填自己的 appid，并从其插件配置取得 engine_appid；`ad_free` 默认 false。

## API

所有 `/v1/` 接口使用 `Authorization: Bearer <key>`。OpenAPI 描述：`/openapi.json`。

```bash
curl -X POST http://127.0.0.1:8770/v1/jobs \
  -H "Authorization: Bearer $CONVERTER_KEY" \
  -H "Content-Type: application/zip" --data-binary @input.zip

curl http://127.0.0.1:8770/v1/jobs/JOB_ID \
  -H "Authorization: Bearer $CONVERTER_KEY"

curl http://127.0.0.1:8770/v1/jobs/JOB_ID/download \
  -H "Authorization: Bearer $CONVERTER_KEY" -o web-game.zip
```

创建返回 HTTP 202 和任务 id。状态：`queued → running → built_unverified / failed`；服务重启时尚未完成的任务标为 `interrupted`，不会默默丢失。客户端每 2–5 秒轮询即可。相同上传会创建新任务，没有幂等提交或自动重试。

下载包解压后运行 `node server.cjs`，浏览器访问 `http://127.0.0.1:5760/`，或部署到独立静态站点。不要在 API 管理域名直接执行客户游戏；API 故意不托管游戏预览。查看 `conversion-report.json` 中的验证范围和输入包哈希。

## 运维与配额

单 ZIP 128 MiB、展开 256 MiB，最多 130 个 ZIP 条目；wxapkg 展开限制 30,000 个文件/512 MiB。转换单 worker、最多 4 个已接受任务并发/排队、单任务 180 秒。最多保留 100 个任务，达到上限后停止接收。发行版没有自动删除功能，管理员停服备份后归档旧任务。

Node worker 只执行服务自己的解包与转换程序，不 require/eval 上传脚本；`vm.Script` 仅检查语法。仍建议将服务运行在有 CPU、内存和磁盘限额的容器里。内置超时及尺寸检查不是完整操作系统隔离。

```bash
docker build -t wechat-web-converter .
docker run --rm -p 127.0.0.1:8770:8770 --memory=2g --cpus=2 \
  -v converter-data:/data wechat-web-converter
```

Docker 配置已提供，是否通过容器测试见 `VALIDATION.md`。将镜像或本目录（排除 data、test-output、ZIP）交给别人即可独立部署，无需原寿司项目或 F: 盘目录。

## 测试

```text
python -m unittest discover -s tests -v
python tests/integration.py <原游戏项目路径>
```

集成测试仅在显式传入测试包目录时读取本地游戏包，不随发行版携带该游戏。新增引擎或广告适配器应通过自己的样本验证后再加入支持列表。

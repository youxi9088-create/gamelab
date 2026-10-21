# 问题码表与错误码表

两张表共用一套 `code`：同一个码在两处含义一致，你方只需维护一份映射。码表**只增不改语义**——平台新增结论时会加新码，不会改旧码的意思；遇到不认识的码，按 `severity` 与 `suggestion` 原样展示即可。

## 一、问题清单 `extraction/issues` 的 `code`

`severity`：`blocker` = 不改收不了；`warning` = 能收但有风险或缺证据；`info` = 告知，不影响收录。每条都带 `suggestion`（该怎么办），`PLATFORM_ERROR` 除外。

| code | severity | 什么意思 | 你该怎么办 |
|---|---|---|---|
| `ARCHIVE_UNSAFE` | blocker | 压缩包没通过安全解包检查：路径穿越（`../`）、符号链接、超过 2000 个文件、解压后超过 500MB、异常高压缩比，或含可执行 / 脚本类文件（.exe .sh .bat .py .php 等） | 去掉这些文件后重推 |
| `ARCHIVE_TOO_LARGE` | blocker | 包超过 100MB | 剔除未使用的素材、源码映射文件（.map）与原始素材工程 |
| `ARCHIVE_HASH_MISMATCH` | blocker | 下载到的字节与 `archive_sha256` 不一致 | 对 zip 文件本身算 SHA-256；推送后不要替换地址指向的文件 |
| `NO_ENTRY_HTML` | blocker | zip 根目录没有 `index.html`，也没有唯一一个 html | 入口命名为 `index.html` 放在 zip 根目录；常见错误是多包了一层文件夹 |
| `TOOLCHAIN_UNSUPPORTED` | blocker | 需要构建的工程（TypeScript / Vue / React 源码、webpack / vite 工程）或二进制运行时（Unity WebGL、Godot） | 交浏览器能直接打开的静态产物；带内容哈希文件名的打包产物也收不了 |
| `SECRET_IN_CODE` | blocker | 代码里有疑似密钥或口令 | 删掉后重推（平台不会保留这个包） |
| `LICENSE_UNDECLARED` | blocker | 没有声明可分发，或声明不成立 | `license_declaration` 须 `distributable=yes` 并写明 `owner` |
| `EXTERNAL_DEPENDENCY` | warning | 入口页面依赖外部网络地址（`detail` 列出域名） | 平台预览禁止外联：把脚本、字体、图片下载下来随包带上，改成相对路径 |
| `SKIPPED_EXTENSIONS` | warning | 有文件因扩展名不在白名单内被跳过（`files` 列出） | 游戏启动若依赖它们会白屏：换成常见 Web 格式，或确认用不到 |
| `LAUNCH_OBSERVATION_FAILED` | blocker | 游戏在平台浏览器里没能正常启动（控制台报错 / 资源 404 / 画面空白，`detail` 给原文） | 在无网络、无 Cookie 的浏览器里直接打开解压后的 index.html 自测 |
| `ACCEPTANCE_PATH_INVALID` | warning | 玩法验收路径在打包产物上走不通（第几步、期望什么） | 平台运营会先修正路径；下次推送给更稳的路径（不依赖随机布局与加载时序） |
| `NOT_REACHING_GAMEPLAY` | warning | 验收路径只有等待与可见性判断，没有真正操作游戏 | 加上 click / key / drag；自动开局的游戏在开头 wait 上标 `playing:true` |
| `PARAM_SKIPPED` | info | 有数值没能开放成可调参数（按原因分组，`locations` 给文件、行号、符号） | 把这类数值收敛成一处具名常量或配置对象；**这是最能据以优化代码的一类** |
| `PARAM_RISKY` | info | 开放了但改动有风险的参数（如尺寸类） | 对这些值做范围限制或自适应布局 |
| `ASSET_SLOT_UNREPLACEABLE` | info | 有图片没能登记为可替换素材（超尺寸 / 动画 PNG / 运行时不按原路径加载） | 改成静态图、按固定相对路径加载 |
| `TEXT_NOT_LOCALIZED` | info | 有界面文字没能收进文案表（带字图片、画布上拼接的文字） | 把界面文字集中成字符串常量或文案表，图片里不要烘焙文字 |
| `PURIFY_DOWNGRADED` | info | 净化与汉化没能应用，按原版继续 | 不影响收录；减少拼接字符串、集中管理文字效果更好 |
| `SPEC_COVERAGE_PARTIAL` | info | 有代码文件没能完整分析，模板功能说明可能不全 | 提交未压缩、按模块拆分的源码文件 |
| `KNOWN_LIMITATION` | info | 平台确认收录时记下的限制（会随模板公示） | 修好后可以推新版本 |
| `REVIEW_CHANGES_REQUESTED` | blocker | 平台运营要求修改后再推（`detail` 是运营写的原因） | 按说明改包，用新的 `submission_id` 重推 |
| `REVIEW_REJECTED` | blocker | 平台未收录这个游戏 | 通常不需要重推同一个游戏；有疑问联系平台运营 |
| `PLATFORM_ERROR` | warning | 平台侧处理出错 | 不需要你处理，平台会跟进 |

## 二、接口错误码（HTTP 非 2xx 时）

错误体是网关格式：`{"Code":"0","Message":"rpc error: code = Code(429) desc = {...}"}`，`Message` 里 `{...}` 那一段才是结构化原因：`{code, message, suggestion, retry_after?, existing_submission_id?}`。`scripts/supply_api.py` 已替你解析好。

| HTTP | code | 什么时候 | 怎么办 |
|---|---|---|---|
| 400 | `PARAM_INVALID` | 字段缺失或格式不对（`message` 指明哪个字段） | 按提示改请求 |
| 400 | `ARCHIVE_URL_INVALID` | 下载地址不是 443 端口的 https 域名地址 | 换地址 |
| 400 | `LICENSE_UNDECLARED` | 推送没带可分发声明 | 补 `license_declaration` |
| 400 | `NOT_REACHING_GAMEPLAY` | 验收路径没有真正操作游戏 | 见上表 |
| 400 | `QUERY_INVALID` | GET 带了接口不接受的查询参数，或参数重复 / 为空 | 只用文档列出的参数 |
| 401 | `AUTH_HEADER_MISSING` | 缺签名头，或某个头出现了两次 | 四个 `X-Supply-*` 头各带一次 |
| 401 | `NONCE_INVALID` | nonce 不是 16–64 位字母数字下划线连字符 | 每次请求新生成 |
| 401 | `TIMESTAMP_SKEW` | 时间戳与平台相差超过 300 秒 | 校准服务器时钟（NTP） |
| 401 | `SIGNATURE_INVALID` | 签名不匹配（也包括 app_id 不存在） | 跑 `selftest`，核对 `fingerprint` 与管理页一致，核对签名原文与请求体一字不差 |
| 401 | `NONCE_REPLAY` | nonce 10 分钟内用过 | 重试也要换新 nonce |
| 403 | `SUPPLIER_DISABLED` | 你方已被平台停用 | 联系平台运营 |
| 403 | `SECRET_NOT_ISSUED` | 平台还没给你方签发授权码 | 联系平台运营 |
| 403 | `ARCHIVE_HOST_NOT_ALLOWED` | 下载主机不在你方登记的白名单 | 请平台登记该主机，或换到已登记主机 |
| 404 | `SUBMISSION_NOT_FOUND` | 没有这条推送（只能查自己推的） | 核对 `submission_id` |
| 409 | `DUPLICATE_ARCHIVE` | 同一个包已有未结束的推送（`existing_submission_id` 指向它） | 等那条结束；要改包请改完再推 |
| 409 | `CANCEL_CONFLICT` | 已进入打包或已结束，不能撤回 | 如需下架联系平台 |
| 413 | `ARCHIVE_TOO_LARGE` | 包超过 100MB | 见上表 |
| 422 | `ARCHIVE_DOWNLOAD_FAILED` | 平台下载你的包失败（源站状态码、重定向、超时、解析到内网） | 地址 5 分钟内有效、可直接 GET、不重定向；源站 ≥0.35MB/s |
| 422 | `ARCHIVE_HASH_MISMATCH` | 摘要不符 | 见上表 |
| 422 | `ARCHIVE_UNSAFE` | zip 打不开 | 确认是标准 zip（不是 rar / 7z / 分卷） |
| 422 | `NO_ENTRY_HTML` | 根目录没有可判定入口（`suggestion` 会点名多包的那层文件夹） | 见上表 |
| 429 | `RATE_LIMITED` | 每分钟请求超限 | 等 `retry_after` 秒；按文档节奏轮询 |
| 429 | `DAILY_QUOTA_EXCEEDED` | 今日受理已达上限（这是限额，不是故障） | 等 `retry_after` 秒（到北京时间次日 0 点） |
| 429 | `QUEUE_FULL` | 你方排队中的推送已达上限 | 等前面的开始处理后再推 |
| 503 | `PLATFORM_UNAVAILABLE` | 平台暂时不可用 | 稍后重试 |

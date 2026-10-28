# AI 服务配置指南

更新：2026-10-24。

最新调整：恢复本地 Codex，使用平台独立账号登录，不复用或切换 Codex 桌面账号。启动命令为 `tools/start_local_codex_bridge.ps1 -CloudHost <服务器> -IdentityFile <私钥> -AccountEmail <邮箱> -AccountRoot <本地专属根目录>`，默认模型 gpt-6-sol。账号目录由 account_home 规则生成于该根目录下，登录和桥接使用相同目录；授权邮箱须匹配。平台填写本地回环桥接地址、local-codex 模型标识和桥接令牌，真实推理检测成功后启用。凭据始终留在本机；电脑、桥接及隧道必须在线。以下“移除本地桥接”属于先前方案，已由本条替代。


平台在「工具服务 → AI 服务 → 配置服务」中明确区分 Codex 账号（云服务器）、云服务器 Codex CLI（API provider）和 API 直连；API 直连又提供官方与兼容服务两个选项。选择连接、填写参数，点击「保存并启用」，再点击「检测连接」。各套参数分别保存；切换后留空的密钥只复用同一套配置的已保存值。更改服务地址时必须重新填写密钥，避免把凭据发给其他服务。

## 1. 选择连接

| 接入方式 | 模型在哪里调用 | 需要准备 |
|---|---|---|
| Codex 账号（云服务器） | 云服务器 CLI 使用独立的 ChatGPT/Codex 账号登录 | 账号邮箱、该账号的官方登录授权、服务器可用网络和 CLI |
| 云服务器 Codex CLI | 云服务器服务账号启动 CLI，由 CLI 调用所配置的 API | 服务器可执行的 Codex CLI、模型、API 地址、密钥及附加授权头 |
| OpenAI 官方 API | 云服务器直接请求 `https://api.openai.com/v1` | OpenAI 官方 API Key、账号可用的模型 |
| OpenAI 兼容 API | 云服务器请求你指定的服务 | 该服务的地址、模型、API Key 和必要的附加授权头 |

当前指定模型为 `gpt-6-sol`。兼容服务中的模型名称和官方账号的模型权限可能不同；只有实际检测成功，才能确认该连接可以使用该名称。ChatGPT/Codex 登录不自动提供官方 API Key。

每次保存启用一种连接。新配置不会自动回退到其他服务，避免调用来源和费用归属不明确。旧的服务器 Codex/自动备用配置在迁移前仍可读取；页面明确标注为旧配置。新的云服务器 Codex CLI 与旧的依赖服务器登录的 Codex 配置不同，使用表单指定的 API 凭据。

## 云服务器 Codex CLI：使用提供的 provider 配置

选择「云服务器 Codex CLI」，基础地址填 `https://ai.botclaw.top/v1`，模型填 `gpt-6-sol`，协议为 Responses；填入提供的 API Key 和 actor 授权头。它实际启动云服务器上的 Codex 进程，不通过本地电脑代理，也不是 Python 直接请求 API。

平台为每次调用创建私密临时 `CODEX_HOME/config.toml`，配置 `model_provider="OpenAI"`、所选 `model` 和 `review_model`、`disable_response_storage=true`、`network_access="enabled"`、`windows_wsl_setup_acknowledged=true`，以及 provider 的地址、`base_url + /models` 模型目录、Responses、`requires_openai_auth=false`、Bearer 密钥和 actor 头。features 中写入 `api_key_model_discovery=true` 和 `goals=true`。CLI 对这些设置的支持以安装版本为准，不能据此声称平台新增了 Goals 功能或独立审查阶段。

密钥通过私密临时配置文件提供，不放在进程命令行，不改服务器管理员或你电脑现有的 Codex 配置。调用结束清理临时目录。平台仍以只读沙箱及受限推理协议运行 CLI；游戏文件修改和浏览器操作由云端执行器验证后执行。

部署时把 Codex 可执行文件安装到 `C:\GameLab\runtime\codex\codex.exe`，给予平台服务账号读取/执行权限；也可用 `REPLICA_CODEX_BINARY` 显式指定路径。服务运行身份通常为 LOCAL SERVICE，不能用管理员终端可运行代替服务账号验证。诊断依次检查：CLI 文件、服务账号权限、模型及凭据、供应方网络。

## 2. OpenAI 兼容 API：本次参数

| 表单字段 | 填写值 |
|---|---|
| 接入方式 | OpenAI 兼容 API |
| 服务基础地址 | `https://ai.botclaw.top/v1` |
| 模型名称 | `gpt-6-sol` |
| 接口协议 | Responses API |
| 附加授权头 | 使用该服务提供的 `x-openai-actor-authorization` 值 |
| API Key | 使用该服务提供的密钥；不填写到文档、代码或截图中 |

基础地址不要追加 `/responses`；平台会自动追加。该域名是兼容服务，不是 OpenAI 官方域名。保存后点击「检测连接」，成功会显示实际调用成功；刷新页面不会重复调用模型。

平台将 API Key 作为 Bearer 认证发送，并将附加授权头发送为 `x-openai-actor-authorization`。Responses 请求使用 `store:false`。这表示请求关闭响应存储，不保证第三方服务的日志或保留政策与 OpenAI 相同。

下面是 API 直连模式与 Codex TOML 的对应关系；云服务器 CLI 模式的 TOML 写入方式见上一节：

| Codex 字段 | 平台处理 |
|---|---|
| `model_provider` / provider `name` | 客户端配置名称；页面使用明确的连接类别 |
| `model` | 填入模型名称，本次为 `gpt-6-sol` |
| `base_url` | 填入服务基础地址 |
| `wire_api = "responses"` | 选择 Responses API |
| `experimental_bearer_token` | 填入 API Key，仅在服务端私密配置保存 |
| `http_headers` | 表单支持 `x-openai-actor-authorization` |
| `disable_response_storage = true` | 平台 Responses 请求固定发送 `store:false` |
| `requires_openai_auth = false` | 此连接使用提供的 Bearer 密钥，不要求服务器 Codex 登录 |
| `model_catalog_url` / `api_key_model_discovery` | 属于客户端模型发现配置；平台当前手工填写模型，不自动读取模型目录 |
| `review_model` | 当前平台没有独立的代码审查模型设置，不导入此项 |
| `network_access` / `windows_wsl_setup_acknowledged` / `goals` | Codex 客户端设置，不改变平台执行器的网络、权限或任务流程 |

## 3. OpenAI 官方 API

选择「OpenAI 官方 API」。基础地址固定为 `https://api.openai.com/v1`，协议固定为 Responses API；填写官方 API Key 和该账号可用的模型名称。页面默认填入 `gpt-6-sol`，是否可调用由官方账号权限和实际检测决定。

此连接不发送兼容服务的附加授权头，也不会继承兼容服务的密钥。未提供官方 API Key 时不能启用或宣称官方服务已验证。

## 4. Codex 账号：独立服务器登录

选择「Codex 账号（云服务器）」，填写已在服务器完成授权的邮箱和账号可用的模型。邮箱只是账号标识，不能代替登录；此模式不需要 API Key。缺少授权或缓存中的登录邮箱不匹配时，保存会被拒绝，不切换正在使用的服务。

管理员在独立 `CODEX_HOME` 中使用官方 `codex login --device-auth` 或 `codex login`，由账号本人在官方登录页完成授权。无浏览器服务器可使用 SSH 转发本地 1455 回调端口。设备码申请返回 403 不能认定为账号密码错误，也不能当作登录成功；网络、账号登录和实际模型调用分别验证。

平台账号目录由 `controlplane.codex_account.account_home(email)` 计算：`GAMELAB_SHARED_ROOT/config/codex-accounts/<规范化邮箱的SHA256前24位>`。仅管理员、SYSTEM 和平台运行账号可读写；CLI 使用文件凭据存储，保留刷新后的 auth.json。该文件不能写入 Git、网页、日志或聊天。登录临时使用其他目录时，应在 CLI 登录退出后将凭据安全迁移到上述专属目录，再检测。

平台读取缓存邮箱进行匹配，真正认证与令牌刷新由官方 CLI 完成；缓存存在不代表实际可调用。运行时忽略用户配置，固定官方认证模式，并隔离第三方 API 环境变量。推理仍使用临时工作目录、图片附件和平台受限动作协议；授权不会赋予模型任意执行游戏文件或操作系统的权限。

本地 Codex 桥接已从可选服务移除，旧配置调用明确失败，不自动回退。停用桥接只停止平台桥接进程及其隧道，不退出或卸载用户正在使用的 Codex 桌面程序。原桥接脚本留作历史实现，不属于当前配置入口。

官方说明：[OpenAI Docs：认证与无界面设备登录](https://learn.chatgpt.com/docs/auth)。

## 5. 检测失败时

| 提示或现象 | 检查方法 |
|---|---|
| HTTP 401 / 403 | 检查当前连接的密钥、模型权限及该服务要求的附加授权头 |
| HTTP 404 | 检查基础地址是否已包含 `/v1`，是否误填 `/responses`，以及协议是否匹配 |
| HTTP 429 | 检查服务限额、并发或账户额度 |
| 超时 / URLError | 检查云服务器到服务的网络；账号模式检查服务器到官方服务的网络 |
| 账号尚未授权或邮箱不匹配 | 在服务器专属目录完成所填账号的官方登录 |
| 流式响应提前结束 | 上游或中间网关未返回完整终止事件；不代表生成成功 |
| 响应不是有效 JSON | 服务返回内容与平台 JSON 推理协议不兼容 |
| 待检测 / 检测结果已过期 | 健康结果有效期为 5 分钟，重新点击检测即可 |
| 请求填写密钥 | 尚未保存该连接的密钥，或服务地址发生变化；不会借用其他连接的密钥 |

检测会发送一次最小 JSON 请求，可能产生模型用量。成功只证明基本模型调用可用，不代表图片分析、长时间生成、所有游戏转换或玩法验证均已通过。检测不会重跑或验收真实游戏。

## 6. 运维与实现边界

- 私密配置保存在服务端 `data/services.json`；当前云端路径为 `C:\GameLab\shared\data\services.json`。`ai` 为正在启用的配置，`ai_profiles` 为分别保存的连接。私密配置包含密钥，不应提交 Git 或下载到公开目录。
- 页面及状态接口只返回已配置标记，不返回 API Key、桥接令牌或附加授权头的值。
- 自动转换、续作和平台诊断使用共享 AI 调用层；读取配置后已发出的请求不会因切换配置自动取消。
- 本次可复用模块为连接配置与隔离保存、共享 API 协议适配和受认证本地桥接；已用隔离 HTTP 服务验证切换及协议，不等于已验证跨平台移植。Windows 启动脚本需 Windows OpenSSH、Python 和 Codex CLI；其他系统需适配启动方式。
- 官方 Responses 的存储开关说明见 [OpenAI Docs：迁移到 Responses API](https://developers.openai.com/api/docs/guides/migrate-to-responses)。第三方服务支持范围以实际调用为准。

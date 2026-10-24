# AI 服务配置指南

更新：2026-10-24。

平台在「工具服务 → AI 服务 → 配置服务」中明确区分本地 Codex、云服务器 Codex CLI 和 API 直连；API 直连又提供官方与兼容服务两个选项。选择连接、填写参数，点击「保存并启用」，再点击「检测连接」。各套参数分别保存；切换后留空的密钥只复用同一套配置的已保存值。更改服务地址时必须重新填写密钥，避免把凭据发给其他服务。

## 1. 选择连接

| 接入方式 | 模型在哪里调用 | 需要准备 |
|---|---|---|
| 本地 Codex | 你的电脑通过已有 Codex 登录调用模型 | 本地 Codex CLI、桥接进程、到云服务器的 SSH 隧道、桥接令牌 |
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

## 4. 本地 Codex：连接你的电脑

这里的「本地」就是当前使用 Codex 的这台电脑，不是云服务器。桥接使用这台电脑安装的 Codex CLI 和已有登录，通过独立推理请求工作，不接管或复用当前聊天会话。云端继续负责游戏文件、浏览器操作、任务、版本与验收。

### 准备与启动

1. 在你的电脑安装 Codex CLI，完成登录，并确认 `codex` 可在终端找到。
2. 准备可登录云服务器且允许 SSH 反向端口转发的 SSH 密钥。首次连接先确认服务器指纹。
3. 在项目根目录运行下面的 PowerShell 命令，将占位符替换为自己的服务器和私钥路径：

```powershell
.\tools\start_local_codex_bridge.ps1 `
  -CloudHost '<云服务器地址>' `
  -CloudUser 'Administrator' `
  -IdentityFile 'C:\Users\你的账号\.ssh\部署私钥'
```

脚本在后台启动 `tools/local_codex_bridge.py` 和 SSH 隧道，默认将云端 `127.0.0.1:8877` 转发到你电脑的 `127.0.0.1:8877`。只监听回环地址，不需在公网开放桥接端口。第一次启动生成桥接令牌，保存于 `data/local-codex-bridge/token.txt`。该令牌仅用于桥接，不是 Codex 登录凭据。

### 平台填写

| 表单字段 | 填写值 |
|---|---|
| 接入方式 | 本地 Codex（连接你的电脑） |
| 服务基础地址 | `http://127.0.0.1:8877/v1`；修改远端端口时同步修改 |
| 模型名称 | 固定为 `local-codex`，这是桥接标识 |
| 接口协议 | 固定为 Chat Completions |
| 本地桥接令牌 | 本地 `data/local-codex-bridge/token.txt` 的内容 |

保存并检测。桥接端口的健康响应只证明进程和认证可用；平台「检测连接」还会实际调用 Codex。桥接目前使用独立的 CLI 推理配置，不导入用户 TOML 中的第三方 provider 或模型设置；API 连接中填写的 `gpt-6-sol` 不会自动改变桥接模型。

电脑必须保持开机、联网，桥接与隧道必须运行。当前脚本没有安装开机任务或自动重连服务。电脑重启、SSH 断开后需重新启动；已有隧道时不要重复启动同一个远端端口。

排查日志：`data/local-codex-bridge/bridge-current-error.log`、`tunnel-current-error.log`。脚本将启动的进程号写入对应 `*-current.pid`，结束进程前先核对该 PID 仍属于本次桥接或隧道。

## 5. 检测失败时

| 提示或现象 | 检查方法 |
|---|---|
| HTTP 401 / 403 | 检查当前连接的密钥、模型权限及该服务要求的附加授权头 |
| HTTP 404 | 检查基础地址是否已包含 `/v1`，是否误填 `/responses`，以及协议是否匹配 |
| HTTP 429 | 检查服务限额、并发或账户额度；本地桥接也可能正在处理上一请求 |
| 超时 / URLError | 检查云服务器到服务的网络；本地模式检查电脑、桥接及 SSH 隧道 |
| HTTP 502（本地桥接） | 检查本地 Codex 登录、调用额度和桥接日志 |
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

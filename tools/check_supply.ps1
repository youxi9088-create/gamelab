param(
    [ValidateSet('selftest','prepare','status','audit','online','probe-download','rehearse')]
    [string]$Command = 'status',
    [string]$Fingerprint = ''
)
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskRuntime = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies'
$taskPython = Join-Path $taskRuntime 'python/python.exe'
$taskNode = Join-Path $taskRuntime 'node/bin/node.exe'
if (-not (Test-Path -LiteralPath $taskPython)) { $taskPython = Join-Path $env:LOCALAPPDATA 'door-runtime/python-3.12.10/python.exe' }
if (-not (Test-Path -LiteralPath $taskPython)) { $taskPython = 'python' }
if (-not (Test-Path -LiteralPath $taskNode)) { $taskNode = 'node' }
Push-Location $taskRoot
try {
    if ($Command -eq 'rehearse') {
        & $taskPython -m unittest discover -s tests -p 'test_supply*.py'
        if ($LASTEXITCODE -ne 0) { throw '供货协议测试失败' }
        & $taskNode tools/check_supply_fixture.cjs
        if ($LASTEXITCODE -ne 0) { throw '静态样例试玩检查失败' }
        & $taskPython tools/supply_readiness.py prepare
        if ($LASTEXITCODE -ne 0) { throw '样例打包失败' }
        & $taskPython tools/supply_readiness.py audit
        if ($LASTEXITCODE -ne 0) { throw '只读审计失败' }
        & $taskPython tools/supply_readiness.py status
        if ($LASTEXITCODE -ne 0) { throw '配置检查失败' }
        Write-Host '本地模拟联调通过；在线接入和下游下载白名单仍需双方确认。'
    } else {
        $taskArgs = @('tools/supply_readiness.py', $Command)
        if ($Fingerprint) { $taskArgs += @('--expected-fingerprint', $Fingerprint) }
        & $taskPython @taskArgs
        if ($LASTEXITCODE -ne 0) { throw '检查未通过，详情见 data/supply-readiness 对应报告。' }
    }
} finally { Pop-Location }

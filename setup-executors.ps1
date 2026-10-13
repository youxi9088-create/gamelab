$ErrorActionPreference = 'Stop'
$taskRuntime = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies'
$taskOldPath = $env:PATH
try {
    $taskBundledNode = Join-Path $taskRuntime 'node/bin'
    if (Test-Path -LiteralPath (Join-Path $taskBundledNode 'node.exe')) { $env:PATH = "$taskBundledNode;$taskOldPath" }
    $taskPnpm = Join-Path $taskRuntime 'bin/fallback/pnpm.cmd'
    if (-not (Test-Path -LiteralPath $taskPnpm)) { $taskPnpm = 'pnpm' }
    & $taskPnpm --dir (Join-Path $PSScriptRoot 'executors') install --frozen-lockfile --ignore-scripts
    if ($LASTEXITCODE -ne 0) { throw 'Executor dependency installation failed' }
} finally { $env:PATH = $taskOldPath }

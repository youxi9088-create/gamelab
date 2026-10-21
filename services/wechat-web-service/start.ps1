$ErrorActionPreference = 'Stop'
$taskPython = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
if (-not (Test-Path -LiteralPath $taskPython)) { $taskPython = Join-Path $env:LOCALAPPDATA 'door-runtime/python-3.12.10/python.exe' }
if (-not (Test-Path -LiteralPath $taskPython)) { $taskPython = 'python' }
& $taskPython (Join-Path $PSScriptRoot 'server.py')

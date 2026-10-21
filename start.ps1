param([int]$Port = 8765, [int]$PlayPort = 8766)
$ErrorActionPreference = 'Stop'
$taskPython = Join-Path $env:USERPROFILE '.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe'
if (-not (Test-Path -LiteralPath $taskPython)) { $taskPython = Join-Path $env:LOCALAPPDATA 'door-runtime/python-3.12.10/python.exe' }
if (-not (Test-Path -LiteralPath $taskPython)) { $taskPython = 'python' }
& $taskPython (Join-Path $PSScriptRoot 'server.py') --port $Port --play-port $PlayPort

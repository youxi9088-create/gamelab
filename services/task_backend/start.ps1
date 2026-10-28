param([int]$Port = 8780)
$ErrorActionPreference = 'Stop'
& python (Join-Path $PSScriptRoot 'app.py') --port $Port

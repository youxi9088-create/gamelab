param([string]$Root='C:\GameLab')
$ErrorActionPreference='Stop'
$shared=Join-Path $Root 'shared'
$env:XDG_DATA_HOME=Join-Path $shared 'proxy-state\data'
$env:XDG_CONFIG_HOME=Join-Path $shared 'proxy-state\config'
New-Item -ItemType Directory -Force -Path $env:XDG_DATA_HOME,$env:XDG_CONFIG_HOME,(Join-Path $shared 'logs') | Out-Null
Set-Location $Root
# Windows PowerShell wraps native stderr as error records, including Caddy's
# normal startup logs. Keep those logs from terminating the supervisor.
$ErrorActionPreference='Continue'
while($true){
    & (Join-Path $Root 'proxy\caddy.exe') run --config (Join-Path $shared 'config\Caddyfile') --adapter caddyfile 2>&1 | Out-File -FilePath (Join-Path $shared 'logs\proxy.log') -Append -Encoding utf8
    Start-Sleep -Seconds 10
}

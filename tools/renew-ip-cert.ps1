param([string]$Root='C:\GameLab')
$ErrorActionPreference='Stop'
$shared=Join-Path $Root 'shared'
$config=Get-Content (Join-Path $shared 'config\deployment.json') -Raw | ConvertFrom-Json
$domain=([uri]$config.public_origin).Host
if(-not $domain){throw 'deployment.json public_origin is required'}
$env:XDG_DATA_HOME=Join-Path $shared 'proxy-state\data'
$env:XDG_CONFIG_HOME=Join-Path $shared 'proxy-state\config'
& (Join-Path $Root 'lego.exe') run --path (Join-Path $shared 'certs\lego') --domains $domain --http --http.webroot (Join-Path $Root 'acme-webroot') --profile shortlived --accept-tos
if($LASTEXITCODE -ne 0){throw 'Certificate renewal failed'}
& (Join-Path $Root 'proxy\caddy.exe') reload --config (Join-Path $shared 'config\Caddyfile') --adapter caddyfile
if($LASTEXITCODE -ne 0){throw 'Proxy reload failed'}

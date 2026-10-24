param(
    [Parameter(Mandatory=$true)][string]$CloudHost,
    [string]$CloudUser='Administrator',
    [Parameter(Mandatory=$true)][string]$IdentityFile,
    [int]$LocalPort=8877,
    [int]$RemotePort=8877
)
$ErrorActionPreference='Stop'
$root=Split-Path $PSScriptRoot
$state=Join-Path $root 'data\local-codex-bridge'
New-Item -ItemType Directory -Path $state -Force | Out-Null
$token=Join-Path $state 'token.txt'
if(-not(Test-Path -LiteralPath $token)){
    $bytes=New-Object byte[] 32
    $rng=[Security.Cryptography.RandomNumberGenerator]::Create()
    try{$rng.GetBytes($bytes)}finally{$rng.Dispose()}
    [IO.File]::WriteAllText($token,[Convert]::ToBase64String($bytes))
}
$python=Join-Path $env:USERPROFILE '.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe'
if(-not(Test-Path -LiteralPath $python)){$python=(Get-Command python -ErrorAction Stop).Source}
$existing=Get-NetTCPConnection -LocalPort $LocalPort -State Listen -ErrorAction SilentlyContinue
if(-not $existing){
    $bridgeArgs='"{0}" --port {1} --token-file "{2}"' -f (Join-Path $PSScriptRoot 'local_codex_bridge.py'),$LocalPort,$token
    $bridge=Start-Process -FilePath $python -ArgumentList $bridgeArgs -WorkingDirectory $root -WindowStyle Hidden -PassThru `
        -RedirectStandardOutput (Join-Path $state 'bridge-current.log') -RedirectStandardError (Join-Path $state 'bridge-current-error.log')
    $bridge.Id | Set-Content (Join-Path $state 'bridge-current.pid')
    Start-Sleep -Seconds 2
}
$health=Invoke-RestMethod "http://127.0.0.1:$LocalPort/health" -Headers @{Authorization='Bearer '+[IO.File]::ReadAllText($token).Trim()}
if(-not $health.ok -or $health.backend -ne 'local-codex'){throw 'The local bridge health check failed'}
$sshArgs='-N -T -o BatchMode=yes -o ExitOnForwardFailure=yes -o ServerAliveInterval=30 -o ServerAliveCountMax=3 -i "{0}" -R 127.0.0.1:{1}:127.0.0.1:{2} {3}@{4}' -f $IdentityFile,$RemotePort,$LocalPort,$CloudUser,$CloudHost
$tunnel=Start-Process -FilePath (Get-Command ssh).Source -ArgumentList $sshArgs -WindowStyle Hidden -PassThru `
    -RedirectStandardError (Join-Path $state 'tunnel-current-error.log')
$tunnel.Id | Set-Content (Join-Path $state 'tunnel-current.pid')
Start-Sleep -Seconds 2
$tunnel.Refresh()
if($tunnel.HasExited){throw 'SSH tunnel failed; inspect data/local-codex-bridge/tunnel-current-error.log'}
Write-Output "Local bridge ready. Cloud base URL: http://127.0.0.1:$RemotePort/v1. Token file: $token. Keep this computer online."

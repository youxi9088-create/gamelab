param(
    [string]$LocalRoot = 'F:\youxi\door',
    [string]$CloudRoot = 'F:\youxi\door-cloudflare-migration',
    [string]$LauncherRoot = 'F:\youxi\GameLab',
    [string]$Python = 'C:\Users\Administrator\.workbuddy\binaries\python\versions\3.13.12\python.exe'
)
$ErrorActionPreference = 'Stop'
$syncHome = 'C:\ProgramData\GameLabSync'
New-Item -ItemType Directory -Path $syncHome -Force | Out-Null
& icacls $syncHome /inheritance:r /grant:r '*S-1-5-18:(OI)(CI)F' '*S-1-5-32-544:(OI)(CI)F' | Out-Null
if ($LASTEXITCODE -ne 0) { throw 'Cannot secure sync configuration directory' }

$required = @('CLOUDFLARE_ACCOUNT_ID','CLOUDFLARE_API_TOKEN','R2_ACCESS_KEY_ID','R2_SECRET_ACCESS_KEY')
$values = @{}
foreach ($name in $required) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if (-not $value) { throw "Missing environment variable: $name" }
    $values[$name] = $value
}
foreach ($name in @('HTTP_PROXY','HTTPS_PROXY','ALL_PROXY','NO_PROXY')) {
    $value = [Environment]::GetEnvironmentVariable($name, 'Process')
    if ($value) { $values[$name] = $value }
}
$sourceGit = (Get-Command git.exe).Source
$env:GIT_TERMINAL_PROMPT = '0'
$credentialLines = "protocol=https`nhost=github.com`n`n" | & $sourceGit -C $LocalRoot credential fill
if ($LASTEXITCODE -ne 0) { throw 'Cannot retrieve existing GitHub credentials' }
foreach ($line in $credentialLines) {
    if ($line.StartsWith('username=')) { $values.GAMELAB_GIT_USERNAME = $line.Substring(9) }
    if ($line.StartsWith('password=')) { $values.GAMELAB_GIT_PASSWORD = $line.Substring(9) }
}
if (-not $values.GAMELAB_GIT_PASSWORD) { throw 'GitHub credential not available' }
Add-Type -AssemblyName System.Security
$clear = [Text.Encoding]::UTF8.GetBytes(($values | ConvertTo-Json -Compress))
$encrypted = [Security.Cryptography.ProtectedData]::Protect($clear, $null, [Security.Cryptography.DataProtectionScope]::LocalMachine)
[IO.File]::WriteAllBytes((Join-Path $syncHome 'credentials.dpapi'), $encrypted)
[Array]::Clear($clear, 0, $clear.Length)
$credentialLines = $null
$values = $null

# Own a portable Git copy: scheduler execution does not depend on Codex runtime paths.
$gitRoot = Split-Path (Split-Path $sourceGit)
$privateGit = Join-Path $syncHome 'git'
if (-not (Test-Path (Join-Path $privateGit 'cmd\git.exe'))) {
    Copy-Item -LiteralPath $gitRoot -Destination $privateGit -Recurse
}
$config = @{
    python = $Python
    git = (Join-Path $privateGit 'cmd\git.exe')
    git_name = (& $sourceGit -C $LocalRoot config user.name)
    git_email = (& $sourceGit -C $LocalRoot config user.email)
    cloud_script = (Join-Path $LocalRoot 'tools\sync_cloud.py')
    repos = @(
        @{path=$LocalRoot; local_branch='main'; remote_branch='sync/local'},
        @{path=$CloudRoot; local_branch='migration/cloudflare-local-executor'; remote_branch='sync/cloudflare'}
    )
}
$config | ConvertTo-Json -Depth 5 | Set-Content (Join-Path $syncHome 'config.json') -Encoding UTF8
$action = New-ScheduledTaskAction -Execute "$env:SystemRoot\System32\WindowsPowerShell\v1.0\powershell.exe" -Argument ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File "' + (Join-Path $PSScriptRoot 'run.ps1') + '"') -WorkingDirectory $LocalRoot
$periodic = New-ScheduledTaskTrigger -Once -At (Get-Date).AddHours(3) -RepetitionInterval (New-TimeSpan -Hours 3)
$startup = New-ScheduledTaskTrigger -AtStartup
$settings = New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Minutes 170) -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 30) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
$principal = New-ScheduledTaskPrincipal -UserId 'SYSTEM' -LogonType ServiceAccount -RunLevel Highest
Register-ScheduledTask -TaskName 'GameLabSync' -Action $action -Trigger @($periodic,$startup) -Settings $settings -Principal $principal -Description 'Independent GameLab cloud and Git synchronization every 3 hours' -Force | Out-Null
New-Item -ItemType Directory -Path $LauncherRoot -Force | Out-Null
Copy-Item -Path (Join-Path $PSScriptRoot 'shortcuts\*') -Destination $LauncherRoot -Force
Write-Output 'GameLabSync installed: every 3 hours, at system startup, runs without Codex or user login.'

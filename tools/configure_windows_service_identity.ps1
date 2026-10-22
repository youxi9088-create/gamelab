param(
    [string]$PlatformRoot = 'C:\GameLab',
    [string]$TaskName = 'GameLabPlatform',
    [string]$PortalSecrets = 'C:\ProgramData\GameLab\portal-secrets.ps1'
)

$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath($PlatformRoot)
$serviceSid = '*S-1-5-19' # NT AUTHORITY\LOCAL SERVICE
$icacls = Join-Path $env:WINDIR 'System32\icacls.exe'

function Grant-TreeAccess([string]$Path, [string]$Rights) {
    if (-not (Test-Path -LiteralPath $Path)) { throw "Required path is missing: $Path" }
    & $icacls $Path /grant ($serviceSid + ':' + $Rights) /T /C /Q | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Could not grant $Rights on $Path" }
    & $icacls $Path /grant ($serviceSid + ':(OI)(CI)' + $Rights) /Q | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Could not configure inherited $Rights on $Path" }
}

function Grant-FileRead([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path -PathType Leaf)) { throw "Required file is missing: $Path" }
    & $icacls $Path /grant ($serviceSid + ':(RX)') | Out-Null
    if ($LASTEXITCODE -ne 0) { throw "Could not grant read access on $Path" }
}

$task = Get-ScheduledTask -TaskName $TaskName -ErrorAction Stop
$backupDir = Join-Path $root 'backup'
New-Item -ItemType Directory -Force -Path $backupDir | Out-Null
$backupFile = Join-Path $backupDir ("{0}-before-localservice-{1}.xml" -f $TaskName, (Get-Date -Format 'yyyyMMdd-HHmmss'))
[IO.File]::WriteAllText($backupFile, (Export-ScheduledTask -TaskName $TaskName), [Text.Encoding]::Unicode)

# The platform writes only to its runtime directories; source code and installed
# dependencies stay read-only to the service identity.
Grant-TreeAccess (Join-Path $root 'app') '(RX)'
foreach ($path in @(
    (Join-Path $root 'app\data'),
    (Join-Path $root 'app\executors\runs'),
    (Join-Path $root 'app\game-library'),
    (Join-Path $root 'logs')
)) {
    Grant-TreeAccess $path '(M)'
}
foreach ($path in @(
    (Join-Path $root 'playwright-browsers'),
    (Join-Path $root 'git-portable')
)) {
    Grant-TreeAccess $path '(RX)'
}
Grant-FileRead (Join-Path $root 'run-platform.ps1')
Grant-FileRead $PortalSecrets

[xml]$xml = Export-ScheduledTask -TaskName $TaskName
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace('t', 'http://schemas.microsoft.com/windows/2004/02/mit/task')
$principal = $xml.SelectSingleNode('//t:Principals/t:Principal', $ns)
if (-not $principal) { throw "Task $TaskName has no principal definition" }
$user = $principal.SelectSingleNode('t:UserId', $ns)
if (-not $user) { throw "Task $TaskName has no user SID" }
$user.InnerText = 'S-1-5-19'
# Keep the boot task recoverable after transient process exits. Task Scheduler
# retries the launcher once per minute for up to 999 consecutive failures.
$settings = $xml.SelectSingleNode('//t:Settings', $ns)
if (-not $settings) { throw "Task $TaskName has no settings definition" }
$restart = $settings.SelectSingleNode('t:RestartOnFailure', $ns)
if (-not $restart) {
    $restart = $xml.CreateElement('RestartOnFailure', $ns.LookupNamespace('t'))
    [void]$settings.AppendChild($restart)
}
$count = $restart.SelectSingleNode('t:Count', $ns)
if (-not $count) {
    $count = $xml.CreateElement('Count', $ns.LookupNamespace('t'))
    [void]$restart.AppendChild($count)
}
$count.InnerText = '999'
$interval = $restart.SelectSingleNode('t:Interval', $ns)
if (-not $interval) {
    $interval = $xml.CreateElement('Interval', $ns.LookupNamespace('t'))
    [void]$restart.AppendChild($interval)
}
$interval.InnerText = 'PT1M'
# For a well-known service SID, Task Scheduler supplies ServiceAccount and
# LeastPrivilege defaults. Keep those fields implicit for older Server schemas.
Register-ScheduledTask -TaskName $TaskName -Xml $xml.OuterXml -Force | Out-Null

$configured = Get-ScheduledTask -TaskName $TaskName
if ($configured.Principal.UserId -notin @('LOCAL SERVICE', 'S-1-5-19')) {
    throw "Task principal was not updated; current identity is $($configured.Principal.UserId)"
}

Write-Host "Configured $TaskName to run as $($configured.Principal.UserId) ($($configured.Principal.RunLevel))."
Write-Host 'Configured automatic restart after failure: 999 attempts, one-minute interval.'
Write-Host "Task definition backup: $backupFile"
Write-Host 'Restart the task and verify the portal and converter readiness before accepting new work.'

$ErrorActionPreference = 'Stop'
$syncHome = 'C:\ProgramData\GameLabSync'
$env:GAMELAB_SYNC_HOME = $syncHome
Add-Type -AssemblyName System.Security
$encrypted = [IO.File]::ReadAllBytes((Join-Path $syncHome 'credentials.dpapi'))
$clear = [Security.Cryptography.ProtectedData]::Unprotect($encrypted, $null, [Security.Cryptography.DataProtectionScope]::LocalMachine)
$values = [Text.Encoding]::UTF8.GetString($clear) | ConvertFrom-Json
foreach ($property in $values.PSObject.Properties) {
    [Environment]::SetEnvironmentVariable($property.Name, [string]$property.Value, 'Process')
}
[Array]::Clear($clear, 0, $clear.Length)
$config = Get-Content (Join-Path $syncHome 'config.json') -Raw | ConvertFrom-Json
$env:PYTHONUTF8 = '1'
$env:PYTHONIOENCODING = 'utf-8'
& $config.python (Join-Path $PSScriptRoot 'runner.py')
exit $LASTEXITCODE

param()
$ErrorActionPreference = 'Stop'
$taskRoot = Split-Path -Parent $PSScriptRoot
$taskFile = Join-Path $taskRoot 'data/supply-config.json'
Write-Host '配置正式或联调环境；此处 app_id 是下游供应方 ID，不是微信 AppID。'
$taskValues = @{
    SUPPLY_PLATFORM_BASE = (Read-Host '下游 HTTPS 基址（不带路径）').Trim()
    SUPPLY_APP_ID = (Read-Host '下游供应方 app_id（sup_ 开头）').Trim()
    SUPPLY_ARCHIVE_DIR = (Read-Host 'HTTPS 分发主机对应的绝对目录').Trim()
    SUPPLY_ARCHIVE_BASE_URL = (Read-Host '该目录对应的 HTTPS 下载前缀').Trim()
}
$taskSecret = Read-Host '下游授权码（不显示）' -AsSecureString
$taskPtr = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($taskSecret)
try {
    $taskValues.SUPPLY_APP_SECRET = [Runtime.InteropServices.Marshal]::PtrToStringBSTR($taskPtr)
    if ($taskValues.Values.Where({[string]::IsNullOrWhiteSpace($_)}).Count) { throw '配置未填写完整，未保存。' }
    $taskDirectory = Split-Path -Parent $taskFile
    [IO.Directory]::CreateDirectory($taskDirectory) | Out-Null
    if (-not (Test-Path -LiteralPath $taskFile)) { New-Item -ItemType File -Path $taskFile | Out-Null }
    $taskAcl = New-Object System.Security.AccessControl.FileSecurity
    $taskAcl.SetAccessRuleProtection($true, $false)
    $taskIdentity = [Security.Principal.WindowsIdentity]::GetCurrent().User
    $taskAcl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule($taskIdentity, 'FullControl', 'Allow')))
    $taskSystem = New-Object System.Security.Principal.SecurityIdentifier('S-1-5-18')
    $taskAcl.AddAccessRule((New-Object System.Security.AccessControl.FileSystemAccessRule($taskSystem, 'FullControl', 'Allow')))
    Set-Acl -LiteralPath $taskFile -AclObject $taskAcl
    [IO.File]::WriteAllText($taskFile, ($taskValues | ConvertTo-Json), (New-Object System.Text.UTF8Encoding($false)))
    Write-Host '已保存在 Git 忽略目录，仅当前用户和 SYSTEM 可读。配置由后台动态读取。'
} finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($taskPtr)
    $taskValues.Remove('SUPPLY_APP_SECRET')
}

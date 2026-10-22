param([string]$Root = $(if($env:GAMELAB_HOME){$env:GAMELAB_HOME}else{'C:\GameLab'}))
$ErrorActionPreference = 'Stop'
$shared = Join-Path $Root 'shared'
$configPath = Join-Path $shared 'config\deployment.json'
$config = if(Test-Path $configPath){Get-Content $configPath -Raw | ConvertFrom-Json}else{$null}
$logDir = Join-Path $shared 'logs'
$logFile = Join-Path $logDir 'platform.log'
$stdoutFile = Join-Path $logDir 'portal.stdout.tmp'
$stderrFile = Join-Path $logDir 'portal.stderr.tmp'
$python = if($config.python){$config.python}else{'C:\Program Files\Python313\python.exe'}
$server = Join-Path $root 'app\server.py'
$appDir = Join-Path $root 'app'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

$env:PYTHONUTF8 = '1'
$env:NODE_BINARY = if($config.node){$config.node}else{'C:\Program Files\nodejs\node.exe'}
$env:PLAYWRIGHT_BROWSERS_PATH = if($config.browsers){$config.browsers}else{Join-Path $Root 'playwright-browsers'}
$env:GIT_BIN = if($config.git){$config.git}else{Join-Path $Root 'git-portable\cmd\git.exe'}
$env:REPLICA_PACKAGE_SERVICE_DIR = Join-Path $Root 'app\services\wechat-web-service'
$env:GAMELAB_SHARED_ROOT = $shared
$env:CONVERTER_DATA = Join-Path $shared 'converter-data'
. (Join-Path $shared 'config\portal-secrets.ps1')
Set-Location (Join-Path $root 'app')

while ($true) {
    try {
        Remove-Item -LiteralPath $stdoutFile, $stderrFile -Force -ErrorAction SilentlyContinue
        $arguments = '-X utf8 "{0}" --port 8765 --play-port 8766 --data-dir "{1}" --repo-dir "{2}"' -f `
            $server, (Join-Path $shared 'data'), (Join-Path $shared 'game-library')
        $process = Start-Process -FilePath $python -ArgumentList $arguments -WorkingDirectory $appDir `
            -WindowStyle Hidden -Wait -PassThru -RedirectStandardOutput $stdoutFile -RedirectStandardError $stderrFile
        if (Test-Path -LiteralPath $stdoutFile) {
            Get-Content -LiteralPath $stdoutFile -Raw | Add-Content -LiteralPath $logFile -Encoding UTF8
        }
        if (Test-Path -LiteralPath $stderrFile) {
            Get-Content -LiteralPath $stderrFile -Raw | Add-Content -LiteralPath $logFile -Encoding UTF8
        }
        Add-Content -LiteralPath $logFile -Encoding UTF8 -Value (
            '[supervisor] portal exited at {0:yyyy-MM-dd HH:mm:ss}; code={1}; restarting in 15 seconds.' -f (Get-Date), $process.ExitCode
        )
    }
    catch {
        Add-Content -LiteralPath $logFile -Encoding UTF8 -Value (
            '[supervisor] launch failed at {0:yyyy-MM-dd HH:mm:ss}: {1}; retrying in 15 seconds.' -f (Get-Date), $_.Exception.Message
        )
    }

    Start-Sleep -Seconds 15
}

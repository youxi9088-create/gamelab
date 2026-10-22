param([string]$Root='C:\GameLab',[string]$Python='C:\Program Files\Python313\python.exe')
$ErrorActionPreference='Stop'
$script=Join-Path $Root 'app\tools\maintain-production.ps1'
$principal=New-ScheduledTaskPrincipal -UserId 'NT AUTHORITY\LOCAL SERVICE' -LogonType ServiceAccount -RunLevel Limited
$settings=New-ScheduledTaskSettingsSet -StartWhenAvailable -MultipleInstances IgnoreNew -ExecutionTimeLimit (New-TimeSpan -Hours 2)
$monitor=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}" -Action monitor -Root "{1}" -Python "{2}"' -f $script,$Root,$Python)
$trigger=New-ScheduledTaskTrigger -Once -At (Get-Date).AddMinutes(1) -RepetitionInterval (New-TimeSpan -Minutes 5)
Register-ScheduledTask -TaskName GameLabProductionMonitor -Action $monitor -Trigger $trigger -Principal $principal -Settings $settings -Force | Out-Null
$backup=New-ScheduledTaskAction -Execute 'powershell.exe' -Argument ('-NoProfile -NonInteractive -ExecutionPolicy Bypass -File "{0}" -Action backup -Root "{1}" -Python "{2}"' -f $script,$Root,$Python)
Register-ScheduledTask -TaskName GameLabProductionBackup -Action $backup -Trigger (New-ScheduledTaskTrigger -Daily -At '04:00') -Principal $principal -Settings $settings -Force | Out-Null
# Task time follows Windows time zone; deployed server is configured for China Standard Time.
New-Item -ItemType Directory -Path (Join-Path $Root 'backups') -Force | Out-Null
& icacls (Join-Path $Root 'backups') /grant '*S-1-5-19:(OI)(CI)M' /T /Q | Out-Null
& icacls (Join-Path $Root 'deploy.lock') /grant '*S-1-5-19:M' /Q | Out-Null
Write-Output 'Installed five-minute monitoring and daily 04:00 backup tasks'

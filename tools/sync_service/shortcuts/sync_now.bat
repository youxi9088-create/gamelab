@echo off
powershell.exe -NoProfile -Command "Start-ScheduledTask -TaskName GameLabSync; Write-Host 'GameLab sync started in background.'"
pause

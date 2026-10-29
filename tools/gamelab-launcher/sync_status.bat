@echo off
powershell.exe -NoProfile -Command "Get-ScheduledTask -TaskName GameLabSync | Select-Object TaskName,State; Get-ScheduledTaskInfo -TaskName GameLabSync | Select-Object LastRunTime,NextRunTime,LastTaskResult; Get-Content C:\ProgramData\GameLabSync\status.json -ErrorAction SilentlyContinue"
pause

@echo off
powershell.exe -NoProfile -Command "Enable-ScheduledTask -TaskName GameLabSync | Select-Object TaskName,State"
pause

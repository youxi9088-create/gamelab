@echo off
powershell.exe -NoProfile -Command "Disable-ScheduledTask -TaskName GameLabSync | Select-Object TaskName,State"
pause

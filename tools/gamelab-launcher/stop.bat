@echo off
chcp 936 >nul
title 停止 Game Lab 本地平台
setlocal

set FOUND=0
for /f "tokens=5" %%P in ('netstat -ano ^| findstr ":8765" ^| findstr LISTENING') do (
  echo   正在停止进程 %%P 及其子进程...
  taskkill /PID %%P /T /F >nul 2>&1
  set FOUND=1
)

if "%FOUND%"=="0" (
  echo   平台当前未在运行。
) else (
  echo   已停止。
)
echo.
pause

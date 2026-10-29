@echo off
chcp 936 >nul
title Game Lab 本地平台
setlocal
set "RUFFLE_BROWSER_EXECUTABLE=C:/Users/Administrator/AppData/Local/Google/Chrome/Application/chrome.exe"
rem 浏览器默认用已安装的 Playwright Chromium；如需改用系统浏览器，取消下一行注释
rem set "BROWSER_EXECUTABLE=C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"

set "ROOT=F:/youxi/door"
set "PY=C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe"
if not exist "%PY%" set "PY=python"

cd /d "%ROOT%"

netstat -ano | findstr ":8765" | findstr LISTENING >nul
if not errorlevel 1 (
  echo.
  echo   平台已在运行，直接打开浏览器...
  start "" http://127.0.0.1:8765
  timeout /t 3 /nobreak >nul
  exit /b 0
)

echo.
echo   ==================================================
echo     Game Lab 本地平台
echo   --------------------------------------------------
echo     管理界面    http://127.0.0.1:8765
echo     试玩服务    http://127.0.0.1:8766
echo     采集调度    已内置，每天 09:00 自动扫描
echo     转换执行器  已内置，随平台自动拉起
echo     AI 模型     kimi-k2.7-code
echo   ==================================================
echo.
echo   服务启动中，约 10 秒后浏览器自动打开。
echo   停止服务：关闭本窗口，或双击 stop.bat
echo.

start "" /min "%PY%" "%~dp0wait_ready.py"

"%PY%" server.py --port 8765 --play-port 8766 --data-dir "%ROOT%\data" --repo-dir "%ROOT%\game-library"

echo.
echo   服务已停止。
pause

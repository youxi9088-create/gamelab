@echo off
chcp 936 >nul
title Game Lab 立即采集
setlocal

set "PY=C:/Users/Administrator/.workbuddy/binaries/python/versions/3.13.12/python.exe"
if not exist "%PY%" set "PY=python"

echo.
echo   立即执行一次采集扫描。
echo   结果写入采集建议，不会自动开始转换。
echo.

"%PY%" "%~dp0scan_now.py"

echo.
pause

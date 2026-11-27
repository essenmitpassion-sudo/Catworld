@echo off
setlocal
cd /d "%~dp0"
where node.exe >nul 2>&1
if errorlevel 1 (
  echo UDI benoetigt Node.js 24 oder neuer.
  pause
  exit /b 1
)
node.exe scripts\try-udi.mjs --open
if errorlevel 1 pause

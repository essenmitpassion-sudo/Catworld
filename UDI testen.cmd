@echo off
setlocal
cd /d "%~dp0"
set "UDI_TEST_NODE=node.exe"
if exist "%~dp0runtime\node.exe" set "UDI_TEST_NODE=%~dp0runtime\node.exe"
"%UDI_TEST_NODE%" -e "process.exit(Number(process.versions.node.split('.')[0])>=24?0:1)" >nul 2>&1
if errorlevel 1 (
  echo UDI benoetigt Node.js 24 oder neuer.
  pause
  exit /b 1
)
"%UDI_TEST_NODE%" scripts\try-udi.mjs --open
if errorlevel 1 pause

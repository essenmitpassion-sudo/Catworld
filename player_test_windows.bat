@echo off
setlocal
cd /d "%~dp0"
set "NEONPAW_DATA_DIR=%~dp0player-test-data"
call start_windows.bat
exit /b %errorlevel%

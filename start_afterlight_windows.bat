@echo off
setlocal
cd /d "%~dp0"
set "NEONPAW_DATA_DIR=%~dp0afterlight-data"
if not exist .venv\Scripts\python.exe (
    py -3 -m venv .venv
    if errorlevel 1 goto error
)
.venv\Scripts\python.exe -c "import pygame" >nul 2>&1
if errorlevel 1 (
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    if errorlevel 1 goto error
)
.venv\Scripts\python.exe -m neonpaw.district
if errorlevel 1 goto error
exit /b 0
:error
echo Start fehlgeschlagen. Python 3.12 oder neuer erforderlich. Fehlermeldung oben beachten.
pause
exit /b 1

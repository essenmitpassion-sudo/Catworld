@echo off
cd /d "%~dp0"
if not exist .venv\Scripts\python.exe (
    py -3 -m venv .venv
    if errorlevel 1 goto error
)
.venv\Scripts\python.exe -c "import pygame" >nul 2>&1
if errorlevel 1 (
    .venv\Scripts\python.exe -m pip install -r requirements.txt
    if errorlevel 1 goto error
)
.venv\Scripts\python.exe -m neonpaw
if errorlevel 1 goto error
exit /b 0
:error
echo Start fehlgeschlagen. Bitte Python 3.12 oder neuer und die Fehlermeldung oben pruefen.
pause
exit /b 1

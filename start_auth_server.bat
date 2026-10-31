@echo off
cd /d "%~dp0"
where py >nul 2>nul
if %errorlevel%==0 (
  py auth_server.py
) else (
  python auth_server.py
)

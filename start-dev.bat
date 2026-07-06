@echo off
title CartFlow Dev Server
cd /d "%~dp0"
echo Starting CartFlow on http://localhost:3001
echo Press Ctrl+C to stop.
echo.
node node_modules\next\dist\bin\next dev --webpack -p 3001
if errorlevel 1 (
    echo.
    echo Server exited with an error. See above.
    pause
)
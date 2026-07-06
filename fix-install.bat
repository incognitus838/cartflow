@echo off
title CartFlow - Fix npm install
cd /d "%~dp0"

echo === CartFlow install fix ===
echo.
echo IMPORTANT: Close Cursor/VS Code before continuing.
echo.
pause

echo Stopping Node...
taskkill /f /im node.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo Removing node_modules...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del /f package-lock.json

echo Clearing npm cache...
call npm cache clean --force

echo Installing dependencies...
call npm install --no-audit --no-fund

if errorlevel 1 (
    echo.
    echo Install failed. Try running this file as Administrator.
    pause
    exit /b 1
)

echo.
echo Success! Run: npm run dev
pause
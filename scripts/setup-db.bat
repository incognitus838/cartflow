@echo off
title CartFlow — Database setup
cd /d "%~dp0.."

echo Stopping Node (unlocks Prisma files)...
taskkill /f /im node.exe >nul 2>&1
timeout /t 2 /nobreak >nul

if not exist .env.local (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
    echo Add your DATABASE_URL, then rerun this script.
    pause
    exit /b 1
)

echo.
echo CartFlow uses the "cartflow" schema on your Neon database.
echo Bank-app tables in "public" are NOT touched.
echo.

echo [1/3] Generating Prisma client...
call npx prisma generate
if errorlevel 1 goto :error

echo [2/3] Pushing schema...
call npx prisma db push
if errorlevel 1 goto :error

echo [3/3] Seeding demo data...
call npx dotenv -e .env.local -- node prisma/seed.mjs
if errorlevel 1 goto :error

echo.
echo SUCCESS! Open http://localhost:3001/api/health
pause
exit /b 0

:error
echo.
echo FAILED. Common fixes:
echo   - Wake your Neon project in console.neon.tech
echo   - Check DATABASE_URL in .env.local
echo   - Close Cursor and rerun this script as Administrator
pause
exit /b 1
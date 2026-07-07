@echo off
cd /d "%~dp0"
echo CartFlow pipeline — use this instead of running run-all.mjs directly.
call npm run run:all
exit /b %ERRORLEVEL%
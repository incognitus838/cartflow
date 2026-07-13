@echo off
cd /d "%~dp0"
node scripts\check-unsplash-ids.mjs
exit /b %errorlevel%
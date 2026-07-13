@echo off
cd /d "%~dp0"
node scripts/check-unsplash-ids.mjs
if errorlevel 1 exit /b 1
node scripts/download-demo-product-images.mjs --force
if errorlevel 1 exit /b 1
call npm run db:seed-demos
if errorlevel 1 exit /b 1
git status
git add -A
git commit -m "fix: category-specific demo product images (Pexels + verified Unsplash)"
if errorlevel 1 exit /b 1
git push origin master
exit /b %errorlevel%
@echo off
cd /d "%~dp0"
echo === Step 1: check-unsplash-ids === > pipeline-result.txt
node scripts\check-unsplash-ids.mjs >> pipeline-result.txt 2>&1
if errorlevel 1 exit /b 1
echo. >> pipeline-result.txt
echo === Step 2: download-demo-product-images === >> pipeline-result.txt
node scripts\download-demo-product-images.mjs --force >> pipeline-result.txt 2>&1
if errorlevel 1 exit /b 1
echo. >> pipeline-result.txt
echo === Step 3: db:seed-demos === >> pipeline-result.txt
call npm run db:seed-demos >> pipeline-result.txt 2>&1
if errorlevel 1 exit /b 1
echo. >> pipeline-result.txt
echo === Step 4: git === >> pipeline-result.txt
git add -A >> pipeline-result.txt 2>&1
git commit -m "fix: assign verified Unsplash pools per product category" >> pipeline-result.txt 2>&1
git push origin master >> pipeline-result.txt 2>&1
echo DONE >> pipeline-result.txt
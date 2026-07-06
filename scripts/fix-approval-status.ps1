$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

Write-Host "=== Step 1: Stop node processes ==="
cmd /c "taskkill /F /IM node.exe 2>nul" | Out-Null
Write-Host "Done"

Write-Host "=== Step 2: prisma generate ==="
npx prisma generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "=== Step 3: db:push ==="
npm run db:push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "=== Step 4: Delete .next ==="
if (Test-Path .next) {
    Remove-Item -Recurse -Force .next
    Write-Host ".next deleted"
} else {
    Write-Host ".next not found"
}

Write-Host "=== All prep steps complete ==="
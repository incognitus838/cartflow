# CartFlow — fix ENOTEMPTY npm install errors on Windows
# Run this in PowerShell OUTSIDE Cursor (close the editor first).

$ErrorActionPreference = "Continue"
$root = $PSScriptRoot

Write-Host "=== CartFlow install fix ===" -ForegroundColor Cyan

Write-Host "1. Stopping Node processes..."
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

Write-Host "2. Removing node_modules (robocopy trick)..."
if (Test-Path "$root\node_modules") {
    $empty = Join-Path $root ".empty_tmp"
    New-Item -ItemType Directory -Path $empty -Force | Out-Null
    cmd /c "robocopy `"$empty`" `"$root\node_modules`" /MIR /NFL /NDL /NJH /NJS /nc /ns /np" | Out-Null
    cmd /c "rmdir /s /q `"$root\node_modules`"" 2>$null
    Remove-Item $empty -Force -ErrorAction SilentlyContinue
}

if (Test-Path "$root\package-lock.json") {
    Remove-Item "$root\package-lock.json" -Force
}

Write-Host "3. Clearing npm cache..."
npm cache clean --force

Set-Location $root
Write-Host "4. Running npm install..."
npm install --no-audit --no-fund

if ($LASTEXITCODE -ne 0) {
    Write-Host "Retrying install..." -ForegroundColor Yellow
    npm install --no-audit --no-fund
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "`nSuccess! Run: npm run dev" -ForegroundColor Green
} else {
    Write-Host "`nStill failing? Try:" -ForegroundColor Red
    Write-Host "  - Close Cursor/VS Code completely, rerun this script"
    Write-Host "  - Run PowerShell as Administrator"
    Write-Host "  - Temporarily pause antivirus real-time scan"
    exit 1
}
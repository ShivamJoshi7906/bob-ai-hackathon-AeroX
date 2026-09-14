# MissionGuard AI - One-Command Full-Stack App Launcher
Write-Host "====================================================================" -ForegroundColor Cyan
Write-Host "              STARTING MISSIONGUARD AI APPLICATION" -ForegroundColor Cyan
Write-Host "====================================================================" -ForegroundColor Cyan

$root = $PSScriptRoot
if (-not $root) { $root = (Get-Location).Path }

Write-Host "`n[1/2] Launching Backend FastAPI Server on http://localhost:8000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root'; python -m uvicorn src.backend.app.main:app --reload --port 8000"

Write-Host "[2/2] Launching Frontend React/Vite Dashboard on http://localhost:3000 ..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\src\frontend'; npm run dev"

Write-Host "`nWaiting 4 seconds for servers to initialize..." -ForegroundColor DarkGray
Start-Sleep -Seconds 4

Write-Host "Opening browser at http://localhost:3000 ..." -ForegroundColor Green
Start-Process "http://localhost:3000"

Write-Host "`n====================================================================" -ForegroundColor Green
Write-Host "MissionGuard AI is active!" -ForegroundColor Green
Write-Host "  - Frontend Dashboard : http://localhost:3000" -ForegroundColor White
Write-Host "  - Backend API Docs   : http://localhost:8000/docs" -ForegroundColor White
Write-Host "  - Health Endpoint    : http://localhost:8000/health" -ForegroundColor White
Write-Host "====================================================================" -ForegroundColor Green

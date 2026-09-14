@echo off
title MissionGuard AI Launcher
echo ====================================================================
echo               STARTING MISSIONGUARD AI APPLICATION
echo ====================================================================
echo.
echo [1/2] Launching Backend FastAPI Server on http://localhost:8000 ...
start "MissionGuard - Backend API (Port 8000)" cmd /k "cd /d "%~dp0" && python -m uvicorn src.backend.app.main:app --reload --port 8000"

echo [2/2] Launching Frontend React/Vite Dashboard on http://localhost:3000 ...
start "MissionGuard - Frontend Dashboard (Port 3000)" cmd /k "cd /d "%~dp0src\frontend" && npm run dev"

echo.
echo Waiting 4 seconds for servers to initialize...
timeout /t 4 /nobreak >nul

echo Opening browser at http://localhost:3000 ...
start http://localhost:3000

echo.
echo ====================================================================
echo MissionGuard AI is active!
echo  - Frontend Dashboard : http://localhost:3000
echo  - Backend API Docs   : http://localhost:8000/docs
echo  - Health Endpoint    : http://localhost:8000/health
echo ====================================================================

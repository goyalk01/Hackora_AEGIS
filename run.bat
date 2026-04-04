@echo off
REM ══════════════════════════════════════════════════════════════════════════════
REM AEGIS - Cyber Attribution Engine - Run Full Stack (Windows)
REM ══════════════════════════════════════════════════════════════════════════════

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║     AEGIS - Cyber-Infrastructure Attribution Engine          ║
echo ║     Graph Intelligence + Behavioral Fingerprinting           ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.

REM Check if Python exists
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Python not found. Please install Python 3.10+
    pause
    exit /b 1
)

REM Check if Node exists
where npm >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js not found. Please install Node.js 18+
    pause
    exit /b 1
)

REM Start Backend
echo [1/2] Starting Backend (FastAPI on port 8000)...
cd backend
start cmd /k "title AEGIS Backend && python -m venv venv 2>nul && call venv\Scripts\activate && pip install -r requirements.txt -q && echo. && echo [BACKEND] Server starting... && uvicorn app:app --reload --host 127.0.0.1 --port 8000"
cd ..

REM Wait for backend to start
echo      Waiting for backend to initialize...
timeout /t 5 /nobreak >nul

REM Start Frontend
echo [2/2] Starting Frontend (Next.js on port 3000)...
cd frontend
start cmd /k "title AEGIS Frontend && npm install --silent && echo. && echo [FRONTEND] Server starting... && npm run dev"
cd ..

echo.
echo ╔══════════════════════════════════════════════════════════════╗
echo ║  AEGIS is starting up...                                     ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  Backend:   http://127.0.0.1:8000                            ║
echo ║  API Docs:  http://127.0.0.1:8000/docs                       ║
echo ║  Frontend:  http://localhost:3000                            ║
echo ╠══════════════════════════════════════════════════════════════╣
echo ║  Pages:                                                      ║
echo ║    /           - Dashboard Overview                          ║
echo ║    /graph      - Network Graph Visualization                 ║
echo ║    /attribution - Command Node Analysis                      ║
echo ║    /fingerprints - Behavioral Patterns                       ║
echo ║    /analytics  - Charts ^& Statistics                         ║
echo ║    /alerts     - Alert Log Table                             ║
echo ╚══════════════════════════════════════════════════════════════╝
echo.
echo Press any key to exit this window (servers will keep running)...
pause >nul

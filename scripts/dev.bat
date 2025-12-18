@echo off
REM Media Project Manager - Development Start Script (Windows)
REM Usage: scripts\dev.bat

cls
echo.
echo =====================================================
echo    🚀 Media Project Manager - Development Mode
echo =====================================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo 📦 node_modules not found. Installing dependencies...
    call npm install
    echo.
)

REM Check dependencies
echo 📦 Checking dependencies...
call npm list --depth=0 >nul 2>&1
if errorlevel 1 (
    echo ⚠️  Dependencies out of sync. Running npm install...
    call npm install
    echo.
)

REM Check for .env.local
if not exist ".env.local" (
    echo ⚠️  .env.local not found
    if exist ".env.local.example" (
        echo    Creating from .env.local.example...
        copy .env.local.example .env.local >nul
        echo ✅ .env.local created
    ) else (
        echo ❌ .env.local.example not found
        echo    Continuing without .env.local...
    )
    echo.
)

REM Display info
echo 🔥 Starting Electron App...
echo    Press Ctrl+C to stop
echo    Vite Dev Server: http://localhost:5173
echo.
echo =====================================================
echo.

REM Start the app
call npm run electron:dev

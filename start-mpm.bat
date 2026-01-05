@echo off
echo ========================================
echo  Media Project Manager - Starting...
echo ========================================
echo.

cd /d %~dp0

echo [1/3] Checking dependencies...
if not exist "node_modules\" (
    echo Installing dependencies...
    npx pnpm install
) else (
    echo Dependencies already installed.
)

echo.
echo [2/3] Ensuring Electron binaries are installed...
cd node_modules\.pnpm\electron@39.2.7\node_modules\electron 2>nul && node install.js 2>nul
if errorlevel 1 (
    echo Electron binaries already installed or not needed.
)
cd /d %~dp0

echo.
echo [3/3] Starting Media Project Manager...
echo.
npx pnpm run electron

pause

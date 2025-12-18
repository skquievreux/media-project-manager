@echo off
REM Media Project Manager - Reset Script (Windows)
REM Cleans all build artifacts and reinstalls dependencies

cls
echo.
echo ⚠️  This will delete all build artifacts and reinstall dependencies
set /p confirm="Are you sure? (y/N): "

if /i not "%confirm%"=="y" (
    echo ❌ Cancelled
    exit /b 1
)

echo.
echo 🧹 Cleaning build artifacts...
if exist "dist" rmdir /s /q dist
if exist "dist-electron" rmdir /s /q dist-electron
if exist "node_modules\.vite" rmdir /s /q node_modules\.vite
echo ✅ Build artifacts cleaned

echo.
echo 📦 Reinstalling dependencies...
call npm install
echo ✅ Dependencies installed

echo.
echo 🎉 Reset complete! Run scripts\dev.bat to start
echo.

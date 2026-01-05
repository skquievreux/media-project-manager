@echo off
echo ========================================
echo  Building Media Project Manager...
echo ========================================
echo.

cd /d %~dp0

echo [1/3] Building Vite app...
call npx pnpm run build
if errorlevel 1 (
    echo ERROR: Vite build failed!
    pause
    exit /b 1
)

echo.
echo [2/3] Packaging Electron app...
set CSC_IDENTITY_AUTO_DISCOVERY=false
call npx electron-packager . "Media Project Manager" --platform=win32 --arch=x64 --out=release --overwrite --asar --icon=build/icon.ico 2>nul || call npx electron-packager . "Media Project Manager" --platform=win32 --arch=x64 --out=release --overwrite --asar

if errorlevel 1 (
    echo ERROR: Packaging failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Build complete!
echo.
echo Output: release\Media Project Manager-win32-x64\Media Project Manager.exe
echo.
pause

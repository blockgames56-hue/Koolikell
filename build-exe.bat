@echo off
title Koolikell Builder
echo ========================================================
echo   Koolikell: Building application executable...
echo ========================================================
echo.

echo [1/3] Closing running Koolikell instances...
taskkill /F /IM Koolikell.exe /T 2>nul

echo [2/3] Building frontend and electron bundle...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed! Check code for errors.
    pause
    exit /b %errorlevel%
)

echo [3/3] Packaging executable...
call npx electron-builder --win --x64 --dir --config.directories.output=release
if %errorlevel% neq 0 (
    echo [WARNING] Default folder busy, building to release-app...
    call npx electron-builder --win --x64 --dir --config.directories.output=release-app
    if exist "release-app\win-unpacked" (
        xcopy /s /y /q "release-app\win-unpacked\*" "release\win-unpacked\" 2>nul
    )
)

echo.
echo ========================================================
echo   [SUCCESS] Done! Executable is ready:
echo   release\win-unpacked\Koolikell.exe
echo ========================================================
echo.
echo Starting application...
if exist "%~dp0release\win-unpacked\Koolikell.exe" (
    start "" "%~dp0release\win-unpacked\Koolikell.exe"
) else if exist "%~dp0release-app\win-unpacked\Koolikell.exe" (
    start "" "%~dp0release-app\win-unpacked\Koolikell.exe"
)
pause

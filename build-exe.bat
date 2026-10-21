@echo off
chcp 65001 >nul
echo ========================================================
echo   Koolikell: Компиляция приложения в .exe файл...
echo ========================================================
echo.

echo 1. Закрытие работающих копий Koolikell (если открыты)...
taskkill /F /IM Koolikell.exe /T 2>nul

echo 2. Сборка проекта и упаковка в exe...
call npm run pack:exe

if %errorlevel% neq 0 (
    echo.
    echo [ОШИБКА] Сборка не удалась. Проверьте код на наличие ошибок.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo   [УСПЕХ] Готово! Исполняемый файл обновлен:
echo   release\win-unpacked\Koolikell.exe
echo ========================================================
echo.
echo Запуск приложения...
start "" "%~dp0release\win-unpacked\Koolikell.exe"
pause

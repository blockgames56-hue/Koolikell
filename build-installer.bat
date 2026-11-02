@echo off
chcp 65001 >nul
title Koolikell Installer Builder
echo ========================================================
echo   Koolikell: Сборка установочного файла Windows (.exe)
echo ========================================================
echo.

echo [1/4] Завершение запущенных процессов Koolikell...
taskkill /F /IM Koolikell.exe /T 2>nul
taskkill /F /IM electron.exe /T 2>nul

echo [2/4] Компиляция приложения и ресурсов...
call cmd.exe /c "npm run build"
if %errorlevel% neq 0 (
    echo [ОШИБКА] Ошибка при сборке проекта. Проверьте код!
    pause
    exit /b %errorlevel%
)

echo [3/4] Сборка мастера установки NSIS (с шагами выбора пути и ярлыками)...
call cmd.exe /c "npx electron-builder --win --x64"
if %errorlevel% neq 0 (
    echo [ОШИБКА] Ошибка при сборке инсталлятора!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================================
echo   [УСПЕХ] Готово! Полноценный установщик создан:
echo   release\koolikell-installer.exe
echo ========================================================
echo.
echo Этот файл koolikell-installer.exe нужно скидывать людям.
echo При запуске у них откроется пошаговый мастер:
echo  - Выбор типа установки (для всех / только для текущего пользователя)
echo  - Выбор папки установки (кнопка Обзор...)
echo  - Создание ярлыка на Рабочем столе (главном экране)
echo  - Создание ярлыка в меню Пуск
echo.
echo Открытие папки с готовым файлом установщика...
if exist "%~dp0release\koolikell-installer.exe" (
    explorer /select,"%~dp0release\koolikell-installer.exe"
)
pause

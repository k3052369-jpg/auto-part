@echo off
title Auto Part - Import Database to MySQL
cls
echo ===================================================
echo     Auto Part - Creating MySQL Database
echo ===================================================
echo.
echo Make sure MySQL is STARTED in XAMPP Control Panel!
echo.
if exist "C:\xampp\mysql\bin\mysql.exe" (
  "C:\xampp\mysql\bin\mysql.exe" -u root < "%~dp0database\schema.sql"
  if %ERRORLEVEL% EQU 0 (
    echo.
    echo [SUCCESS] Database 'auto_part_db' created and imported successfully!
  ) else (
    echo.
    echo [FAILED] Please make sure MySQL is running in XAMPP and try again.
  )
) else (
  mysql -u root < "%~dp0database\schema.sql"
)
echo.
pause

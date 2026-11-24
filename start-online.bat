@echo off
title Auto Part - Online Server
cls
echo ===================================================
echo     Auto Part - Starting Online Server
echo ===================================================
echo.
echo [1] Starting backend server on port 3000...
start "Auto Part Server" cmd /k "cd /d "%~dp0" && node server.js"

echo.
echo [2] Starting public tunnel...
echo.
echo * Note: If prompted for Tunnel Password on your phone,
echo   visit: https://loca.lt/mytunnelpassword
echo.
echo ===================================================
npx --yes localtunnel --port 3000
pause

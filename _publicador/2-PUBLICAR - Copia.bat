@echo off
title fonteboa — teste local
echo.
echo ================================================
echo   PUBLICAR LOCAL (sem envio ao GitHub)
echo ================================================
echo.
echo   Os HTMLs serao gerados nas subpastas corretas
echo   mas NAO serao enviados ao GitHub.
echo.
pause
echo.
set SITE_DIR=%~dp0..
node "%~dp0publicar.js" "%SITE_DIR%"
echo.
pause
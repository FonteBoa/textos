@echo off
setlocal enabledelayedexpansion

set "SITE=C:\TEXTOS\SITE"
set "INSERT=  ^<style^>\n   body { animation: none; }\n  ^</style^>"
set "TARGET=  ^<link href="style.css" rel="stylesheet"/^>"

for %%F in (cronicas_index.html ensaios_index.html anotacoes.html) do (
    set "FILE=%SITE%\%%F"
    set "TEMP=%SITE%\%%F.tmp"
    if exist "!FILE!" (
        powershell -Command "(Get-Content '!FILE!' -Raw) -replace '(?<=  <link href=""style\.css"" rel=""stylesheet""/>)', \"`n  <style>`n   body { animation: none; }`n  </style>\" | Set-Content '!FILE!' -NoNewline"
        echo Atualizado: %%F
    ) else (
        echo NAO ENCONTRADO: %%F
    )
)

echo.
echo Concluido.
pause

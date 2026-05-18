@echo off
title fonteboa — limpeza de raiz
echo.
echo ================================================
echo   LIMPEZA DE ARQUIVOS DESNECESSARIOS DA RAIZ
echo ================================================
echo.
echo   Serao apagados:
echo   - conto-template.html
echo   - contos_index-template.html
echo   - cronica-template.html
echo   - ensaio-template.html
echo   - nota-template.html
echo   - notas_index.html
echo   - comentarios.html
echo.
echo   Pressione qualquer tecla para continuar
echo   ou feche esta janela para cancelar.
echo.
pause

set SITE=%~dp0..

del /q "%SITE%\conto-template.html"        2>nul
del /q "%SITE%\contos_index-template.html" 2>nul
del /q "%SITE%\cronica-template.html"      2>nul
del /q "%SITE%\ensaio-template.html"       2>nul
del /q "%SITE%\nota-template.html"         2>nul
del /q "%SITE%\notas_index.html"           2>nul
del /q "%SITE%\comentarios.html"           2>nul

echo.
echo   Feito. Arquivos removidos.
echo.
pause
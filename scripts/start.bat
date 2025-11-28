@echo off
setlocal

REM ========================================
REM    GastX - Script de Inicializacao
REM ========================================

echo ========================================
echo    GastX - Iniciando Sistema Completo
echo ========================================
echo.

REM Obter diretorio raiz do projeto (pasta pai de scripts)
pushd "%~dp0.."
set "REPO_DIR=%CD%"
popd

echo Projeto: %REPO_DIR%
echo.

REM ========== BACKEND ==========
echo [1/2] Abrindo Backend...
start "GastX Backend" cmd /c "cd /d "%REPO_DIR%\backend" && call .venv\Scripts\activate.bat && echo. && echo ====== GastX Backend ====== && echo http://localhost:8000 && echo. && python -m uvicorn app.main:app --reload --port 8000 && pause"

timeout /t 3 /nobreak >nul

REM ========== FRONTEND ==========
echo [2/2] Abrindo Frontend...
start "GastX Frontend" cmd /c "cd /d "%REPO_DIR%\frontend" && echo. && echo ====== GastX Frontend ====== && echo http://localhost:5173 && echo. && npm run dev && pause"

echo.
echo ========================================
echo    Janelas abertas com sucesso!
echo ========================================
echo.
echo  Backend:  http://localhost:8000
echo  Frontend: http://localhost:5173
echo.
echo  Aguarde alguns segundos e acesse
echo  http://localhost:5173 no navegador.
echo.
pause

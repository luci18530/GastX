@echo off
REM Script de Build para GastX
REM Instala dependencias e prepara o projeto para producao

echo ========================================
echo    GastX - Build Script
echo ========================================
echo.

set SCRIPT_DIR=%~dp0
set REPO_DIR=%~dp0..

REM ========== BACKEND BUILD ==========
echo [1/4] Preparando Backend...
cd /d "%REPO_DIR%\backend"

if not exist ".venv" (
    echo Criando ambiente virtual...
    python -m venv .venv
)

call .venv\Scripts\activate.bat
echo Instalando dependencias do Backend...
pip install -r requirements.txt -q

echo Backend pronto!
echo.

REM ========== FRONTEND BUILD ==========
echo [2/4] Preparando Frontend...
cd /d "%REPO_DIR%\frontend"

if not exist "node_modules" (
    echo Instalando dependencias do Frontend...
    call npm install
) else (
    echo Dependencias ja instaladas.
)

echo [3/4] Compilando Frontend para producao...
call npm run build

echo Frontend pronto!
echo.

REM ========== RESUMO ==========
echo ========================================
echo    Build Concluido com Sucesso!
echo ========================================
echo.
echo Para executar em desenvolvimento:
echo   - Execute: scripts\start.bat
echo.
echo Para servidor de producao:
echo   - Backend: cd backend ^& python -m uvicorn app.main:app --port 8000
echo   - Frontend: cd frontend ^& npm run preview
echo.

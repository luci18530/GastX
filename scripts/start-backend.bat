@echo off
REM Script para iniciar apenas o backend

set SCRIPT_DIR=%~dp0
set REPO_DIR=%~dp0..

cd /d "%REPO_DIR%\backend"

REM Verifica se o ambiente virtual existe
if not exist ".venv" (
    echo Criando ambiente virtual...
    python -m venv .venv
)

call .venv\Scripts\activate.bat

echo Instalando dependencias...
pip install -r requirements.txt -q

echo Iniciando servidor FastAPI...
echo API disponivel em: http://localhost:8000
echo Documentacao: http://localhost:8000/docs
python -m uvicorn app.main:app --reload --port 8000

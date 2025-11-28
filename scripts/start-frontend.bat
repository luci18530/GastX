@echo off
REM Script para iniciar apenas o frontend

set SCRIPT_DIR=%~dp0
set REPO_DIR=%~dp0..

cd /d "%REPO_DIR%\frontend"

REM Verifica se node_modules existe
if not exist "node_modules" (
    echo Instalando dependencias...
    npm install
)

echo Iniciando servidor de desenvolvimento...


npm run devecho Frontend disponivel em: http://localhost:5173
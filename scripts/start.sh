#!/bin/bash
# Script para executar GastX completo (Frontend + Backend) - Linux/Mac

echo "========================================"
echo "    GastX - Iniciando Sistema Completo"
echo "========================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para iniciar backend
start_backend() {
    cd "$REPO_DIR/backend"

    if [ ! -d ".venv" ]; then
        echo -e "${YELLOW}Criando ambiente virtual...${NC}"
        python3 -m venv .venv
    fi

    source .venv/bin/activate

    echo -e "${YELLOW}Instalando dependências...${NC}"
    pip install -r requirements.txt -q

    echo -e "${GREEN}API disponível em: http://localhost:8000${NC}"
    echo -e "${GREEN}Documentação: http://localhost:8000/docs${NC}"
    echo ""

    python -m uvicorn app.main:app --reload --port 8000
}

# Função para iniciar frontend
start_frontend() {
    cd "$REPO_DIR/frontend"

    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}Instalando dependências...${NC}"
        npm install
    fi

    echo -e "${GREEN}Frontend disponível em: http://localhost:5173${NC}"
    echo ""

    npm run dev
}

# Iniciar ambos em background
echo -e "${YELLOW}Iniciando Backend...${NC}"
start_backend &
BACKEND_PID=$!

sleep 3

echo -e "${YELLOW}Iniciando Frontend...${NC}"
start_frontend &
FRONTEND_PID=$!

echo ""
echo "========================================"
echo -e "${GREEN}Backend rodando em: http://localhost:8000${NC}"
echo -e "${GREEN}Frontend rodando em: http://localhost:5173${NC}"
echo "========================================"
echo ""
echo "Processos iniciados com sucesso!"
echo "PIDs: Backend=$BACKEND_PID, Frontend=$FRONTEND_PID"
echo "Use 'kill $BACKEND_PID $FRONTEND_PID' para parar."
echo ""

# Aguardar a finalização de qualquer um dos processos
wait

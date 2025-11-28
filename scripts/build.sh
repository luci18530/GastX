#!/bin/bash
# Script de Build para GastX - Linux/Mac
# Instala dependências e prepara o projeto para produção

echo "========================================"
echo "    GastX - Build Script"
echo "========================================"
echo ""

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
REPO_DIR="$(dirname "$SCRIPT_DIR")"

# Cores
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# ========== BACKEND BUILD ==========
echo -e "${YELLOW}[1/4] Preparando Backend...${NC}"
cd "$REPO_DIR/backend"

if [ ! -d ".venv" ]; then
    echo "Criando ambiente virtual..."
    python3 -m venv .venv
fi

source .venv/bin/activate

echo "Instalando dependências do Backend..."
pip install -r requirements.txt -q

echo -e "${GREEN}Backend pronto!${NC}"
echo ""

# ========== FRONTEND BUILD ==========
echo -e "${YELLOW}[2/4] Preparando Frontend...${NC}"
cd "$REPO_DIR/frontend"

if [ ! -d "node_modules" ]; then
    echo "Instalando dependências do Frontend..."
    npm install
else
    echo "Dependências já instaladas. Atualizando..."
    npm install
fi

echo -e "${YELLOW}[3/4] Compilando Frontend para produção...${NC}"
npm run build

echo -e "${GREEN}Frontend pronto!${NC}"
echo ""

# ========== RESUMO ==========
echo "========================================"
echo -e "${GREEN}    Build Concluído com Sucesso!${NC}"
echo "========================================"
echo ""
echo "Para executar em desenvolvimento:"
echo "  - Execute: ./scripts/start.sh"
echo ""
echo "Para servidor de produção:"
echo "  - Backend: cd backend && python -m uvicorn app.main:app --port 8000"
echo "  - Frontend: cd frontend && npm run preview"
echo ""

"""
GastX - Backend FastAPI
Versão 0.5.0 - Filtros e Buscas Avançadas
"""

from fastapi import FastAPI, UploadFile, File, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from io import StringIO
from typing import List, Dict, Any, Optional
from datetime import datetime

from app.models import TransactionResponse, UploadResponse, CategorySummary
from app.categorizer import (
    categorize_transaction, 
    categorize_transaction_detailed,
    get_all_categories,
    get_categorization_stats,
    suggest_category,
    add_pattern
)

app = FastAPI(
    title="GastX API",
    description="API para análise inteligente de gastos pessoais",
    version="0.5.0"
)

# Configuração CORS para permitir requisições do frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Endpoint raiz com informações da API"""
    return {
        "app": "GastX",
        "version": "0.5.0",
        "description": "Analisador Inteligente de Gastos Pessoais"
    }


@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.get("/categories")
async def list_categories():
    """Lista todas as categorias disponíveis"""
    categories = get_all_categories()
    return {
        "categories": categories,
        "total": len(categories)
    }


@app.post("/categories/suggest")
async def suggest_transaction_category(title: str = Query(..., description="Descrição da transação")):
    """Sugere categorias para uma transação"""
    suggestions = suggest_category(title)
    current = categorize_transaction_detailed(title)
    
    return {
        "title": title,
        "current_category": current.category,
        "confidence": current.confidence.value,
        "suggestions": [
            {"category": cat, "score": round(score, 2)} 
            for cat, score in suggestions
        ]
    }


@app.post("/categories/add-pattern")
async def add_category_pattern(
    category: str = Query(..., description="Nome da categoria"),
    pattern: str = Query(..., description="Padrão regex a adicionar"),
    priority: str = Query("medium", description="Prioridade: high, medium, low")
):
    """Adiciona um novo padrão a uma categoria existente"""
    if priority not in ["high", "medium", "low"]:
        raise HTTPException(status_code=400, detail="Prioridade deve ser: high, medium, low")
    
    success = add_pattern(category, pattern, priority)
    if success:
        return {"success": True, "message": f"Padrão '{pattern}' adicionado à categoria '{category}'"}
    else:
        raise HTTPException(status_code=400, detail=f"Categoria '{category}' não encontrada")


@app.post("/upload/csv", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """
    Faz upload de um arquivo CSV de extrato bancário.
    Suporta formatos: Nubank, Inter, Bradesco, Itaú, C6, e genéricos
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são aceitos")
    
    try:
        contents = await file.read()
        # Tenta decodificar com diferentes encodings
        decoded = try_decode(contents)
        
        df = pd.read_csv(StringIO(decoded))
        
        # Detecta o banco pelo formato das colunas
        bank = detect_bank(df.columns.tolist())
        
        # Normaliza as colunas
        df = normalize_columns(df, bank)
        
        # Valida colunas necessárias
        required_cols = ['date', 'title', 'amount']
        missing = [c for c in required_cols if c not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400, 
                detail=f"Colunas obrigatórias não encontradas: {', '.join(missing)}"
            )
        
        # Categoriza as transações com detalhes
        transactions = []
        for _, row in df.iterrows():
            result = categorize_transaction_detailed(row['title'])
            transaction = {
                "date": str(row['date']),
                "title": row['title'],
                "amount": float(row['amount']),
                "category": result.category,
                "confidence": result.confidence.value
            }
            transactions.append(transaction)
        
        # Calcula resumo por categoria
        category_summary = calculate_category_summary(transactions)
        
        # Calcula estatísticas de categorização
        stats = get_categorization_stats(transactions)
        
        # Calcula total
        total_spent = sum(t['amount'] for t in transactions if t['amount'] > 0)
        total_received = abs(sum(t['amount'] for t in transactions if t['amount'] < 0))
        
        return UploadResponse(
            success=True,
            bank_detected=bank,
            total_transactions=len(transactions),
            total_spent=round(total_spent, 2),
            total_received=round(total_received, 2),
            transactions=transactions,
            category_summary=category_summary,
            categorization_rate=stats.get("categorization_rate", 0)
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")


def detect_bank(columns: List[str]) -> str:
    """Detecta o banco com base nas colunas do CSV"""
    columns_lower = [c.lower().strip() for c in columns]
    columns_set = set(columns_lower)
    
    # Padrão Nubank: date, title, amount
    if {'date', 'title', 'amount'}.issubset(columns_set):
        return "Nubank"
    
    # Padrão Inter: Data, Descrição, Valor
    if 'data' in columns_set and ('descrição' in columns_set or 'descricao' in columns_set):
        return "Inter"
    
    # Padrão Bradesco
    if 'data' in columns_set and 'histórico' in columns_set:
        return "Bradesco"
    
    # Padrão Itaú
    if 'data' in columns_set and 'lançamento' in columns_set:
        return "Itaú"
    
    # Padrão C6 Bank
    if 'data' in columns_set and 'movimentação' in columns_set:
        return "C6 Bank"
    
    # Padrão genérico
    return "Desconhecido"


def try_decode(contents: bytes) -> str:
    """Tenta decodificar o conteúdo com diferentes encodings"""
    encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
    
    for encoding in encodings:
        try:
            return contents.decode(encoding)
        except UnicodeDecodeError:
            continue
    
    # Fallback: força utf-8 ignorando erros
    return contents.decode('utf-8', errors='ignore')


def normalize_columns(df: pd.DataFrame, bank: str) -> pd.DataFrame:
    """Normaliza as colunas do DataFrame para um padrão único"""
    df.columns = df.columns.str.lower().str.strip()
    
    # Mapeamento expandido para múltiplos bancos
    column_mapping = {
        # Datas
        'data': 'date',
        'data da transação': 'date',
        'data transação': 'date',
        'data lançamento': 'date',
        # Descrições
        'descrição': 'title',
        'descriçao': 'title',
        'descricao': 'title',
        'histórico': 'title',
        'historico': 'title',
        'lançamento': 'title',
        'lancamento': 'title',
        'movimentação': 'title',
        'movimentacao': 'title',
        'detalhes': 'title',
        # Valores
        'valor': 'amount',
        'value': 'amount',
        'valor (r$)': 'amount',
        'quantia': 'amount'
    }
    
    df = df.rename(columns=column_mapping)
    
    # Limpa valores de amount se necessário
    if 'amount' in df.columns:
        # Remove caracteres não numéricos (exceto - e .)
        if df['amount'].dtype == object:
            df['amount'] = df['amount'].astype(str).str.replace(r'[R$\s]', '', regex=True)
            df['amount'] = df['amount'].str.replace(',', '.')
            df['amount'] = pd.to_numeric(df['amount'], errors='coerce').fillna(0)
    
    return df


def calculate_category_summary(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Calcula o resumo de gastos por categoria"""
    summary = {}
    
    for t in transactions:
        if t['amount'] > 0:  # Apenas gastos
            category = t['category']
            if category not in summary:
                summary[category] = {"total": 0, "count": 0}
            summary[category]['total'] += t['amount']
            summary[category]['count'] += 1
    
    result = [
        {
            "category": cat,
            "total": round(data['total'], 2),
            "count": data['count'],
            "percentage": 0  # Será calculado abaixo
        }
        for cat, data in summary.items()
    ]
    
    # Calcula percentuais
    grand_total = sum(item['total'] for item in result)
    if grand_total > 0:
        for item in result:
            item['percentage'] = round((item['total'] / grand_total) * 100, 1)
    
    # Ordena por valor total decrescente
    result.sort(key=lambda x: x['total'], reverse=True)
    
    return result


def calculate_monthly_data(transactions: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    """Agrupa transações por mês para visualização temporal"""
    monthly: Dict[str, Dict[str, Any]] = {}
    
    for t in transactions:
        try:
            # Extrai ano-mês da data
            date_str = str(t['date'])
            if len(date_str) >= 7:
                month_key = date_str[:7]  # "YYYY-MM"
            else:
                continue
            
            if month_key not in monthly:
                monthly[month_key] = {"gastos": 0.0, "recebidos": 0.0, "categorias": {}}
                
            amount = float(t['amount'])
            category = t.get('category', 'Outros')
            
            if amount > 0:
                monthly[month_key]["gastos"] += amount
                if category not in monthly[month_key]["categorias"]:
                    monthly[month_key]["categorias"][category] = 0.0
                monthly[month_key]["categorias"][category] += amount
            else:
                monthly[month_key]["recebidos"] += abs(amount)
                
        except (ValueError, KeyError):
            continue
    
    result = []
    for month, data in monthly.items():
        gastos = float(data["gastos"])
        recebidos = float(data["recebidos"])
        result.append({
            "month": month,
            "gastos": round(gastos, 2),
            "recebidos": round(recebidos, 2),
            "saldo": round(recebidos - gastos, 2),
            "categorias": {k: round(float(v), 2) for k, v in data["categorias"].items()}
        })
    
    # Ordena por mês
    result.sort(key=lambda x: x["month"])
    return result


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

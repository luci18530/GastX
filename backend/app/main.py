"""
GastX - Backend FastAPI
Versão 0.2.0
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
from io import StringIO
from typing import List, Dict, Any
from datetime import datetime

from app.models import TransactionResponse, UploadResponse, CategorySummary
from app.categorizer import categorize_transaction

app = FastAPI(
    title="GastX API",
    description="API para análise inteligente de gastos pessoais",
    version="0.2.0"
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
        "version": "0.2.0",
        "description": "Analisador Inteligente de Gastos Pessoais"
    }


@app.get("/health")
async def health_check():
    """Verificação de saúde da API"""
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}


@app.post("/upload/csv", response_model=UploadResponse)
async def upload_csv(file: UploadFile = File(...)):
    """
    Faz upload de um arquivo CSV de extrato bancário.
    Suporta formatos: Nubank, Inter
    """
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Apenas arquivos CSV são aceitos")
    
    try:
        contents = await file.read()
        # Tenta decodificar com diferentes encodings
        try:
            decoded = contents.decode('utf-8')
        except UnicodeDecodeError:
            decoded = contents.decode('latin-1')
        
        df = pd.read_csv(StringIO(decoded))
        
        # Detecta o banco pelo formato das colunas
        bank = detect_bank(df.columns.tolist())
        
        # Normaliza as colunas
        df = normalize_columns(df, bank)
        
        # Categoriza as transações
        transactions = []
        for _, row in df.iterrows():
            transaction = {
                "date": str(row['date']),
                "title": row['title'],
                "amount": float(row['amount']),
                "category": categorize_transaction(row['title'])
            }
            transactions.append(transaction)
        
        # Calcula resumo por categoria
        category_summary = calculate_category_summary(transactions)
        
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
            category_summary=category_summary
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao processar arquivo: {str(e)}")


def detect_bank(columns: List[str]) -> str:
    """Detecta o banco com base nas colunas do CSV"""
    columns_lower = [c.lower() for c in columns]
    
    # Padrão Nubank: date, title, amount
    if 'date' in columns_lower and 'title' in columns_lower and 'amount' in columns_lower:
        return "Nubank"
    
    # Padrão Inter: Data, Descrição, Valor
    if 'data' in columns_lower and 'descrição' in columns_lower:
        return "Inter"
    
    # Padrão genérico
    return "Desconhecido"


def normalize_columns(df: pd.DataFrame, bank: str) -> pd.DataFrame:
    """Normaliza as colunas do DataFrame para um padrão único"""
    df.columns = df.columns.str.lower().str.strip()
    
    column_mapping = {
        'data': 'date',
        'descrição': 'title',
        'descriçao': 'title',
        'descricao': 'title',
        'valor': 'amount',
        'value': 'amount'
    }
    
    df = df.rename(columns=column_mapping)
    
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


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

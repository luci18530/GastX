"""
Modelos Pydantic para a API GastX
"""

from pydantic import BaseModel
from typing import List, Optional


class Transaction(BaseModel):
    """Modelo de uma transação"""
    date: str
    title: str
    amount: float
    category: str


class CategorySummary(BaseModel):
    """Resumo de gastos por categoria"""
    category: str
    total: float
    count: int
    percentage: float


class TransactionResponse(BaseModel):
    """Resposta com lista de transações"""
    transactions: List[Transaction]
    total: int


class UploadResponse(BaseModel):
    """Resposta do upload de arquivo"""
    success: bool
    bank_detected: str
    total_transactions: int
    total_spent: float
    total_received: float
    transactions: List[dict]
    category_summary: List[dict]


class ErrorResponse(BaseModel):
    """Resposta de erro"""
    error: str
    detail: Optional[str] = None

"""
Modelos Pydantic para a API GastX
Versão 0.3.0
"""

from pydantic import BaseModel
from typing import List, Optional
from enum import Enum


class ConfidenceLevelEnum(str, Enum):
    """Níveis de confiança da categorização"""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"
    NONE = "none"


class Transaction(BaseModel):
    """Modelo de uma transação"""
    date: str
    title: str
    amount: float
    category: str
    confidence: Optional[str] = None


class CategorySummary(BaseModel):
    """Resumo de gastos por categoria"""
    category: str
    total: float
    count: int
    percentage: float


class CategorySuggestion(BaseModel):
    """Sugestão de categoria"""
    category: str
    score: float


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
    categorization_rate: Optional[float] = None


class CategoriesResponse(BaseModel):
    """Lista de categorias disponíveis"""
    categories: List[str]
    total: int


class SuggestResponse(BaseModel):
    """Resposta de sugestão de categoria"""
    title: str
    current_category: str
    confidence: str
    suggestions: List[CategorySuggestion]


class ErrorResponse(BaseModel):
    """Resposta de erro"""
    error: str
    detail: Optional[str] = None

"""
Motor de Categorização de Transações - GastX
Versão inicial com dicionário de padrões
"""

from typing import Dict, List
import re

# Dicionário de padrões para categorização
CATEGORY_PATTERNS: Dict[str, List[str]] = {
    "Transporte": [
        "uber", "99", "cabify", "taxi", "lyft", "ride", "trip",
        "posto", "combustivel", "gasolina", "estacionamento", "parking"
    ],
    "Alimentação": [
        "restaurante", "lanchonete", "pizzaria", "burger", "mcdonald", "pub",
        "subway", "ifood", "rappi", "padaria", "cafe", "coffee", "bobs",
        "supermercado", "mercado", "hortifruti", "açougue", "acougue", "panificadora",
        "ifd", "lanches", "sorvetes", "chiquinho", "lanche"
    ],
    "Saúde": [
        "farmacia", "drogasil", "droga", "raia", "pague menos", "panvel",
        "hospital", "clinica", "consultorio", "medico", "dentista",
        "laboratorio", "exame", "radiologia", "farma", "pharma", "redepharma"
    ],
    "Compras": [
        "amazon", "mercado livre", "shopee", "magazine", "casas bahia",
        "americanas", "submarino", "aliexpress", "shein", "loja"
    ],
    "Entretenimento": [
        "netflix", "spotify", "disney", "hbo", "prime video", "youtube",
        "cinema", "teatro", "show", "ingresso", "steam", "playstation",
        "xbox", "game", "avalanche"
    ],
    "Assinaturas": [
        "assinatura", "mensalidade", "plano", "premium", "subscription",
        "chatgpt", "openai"
    ],
    "Casa": [
        "luz", "energia", "agua", "gas", "internet", "telefone", "celular",
        "aluguel", "condominio", "iptu", "manutencao"
    ],
    "Educação": [
        "curso", "escola", "faculdade", "universidade", "udemy", "coursera",
        "livro", "livraria", "apostila"
    ],
    "Transferências": [
        "pix", "transferencia", "ted", "doc"
    ],
    "Academia/Esporte": [
        "academia", "gym", "smartfit", "crossfit", "natacao", "esporte",
        "moove", "power"
    ],
    "Beleza/Cuidados Pessoais": [
        "barbearia", "cabelo", "barbeiro", "salao", "manicure", "pedicure", "estetica", "beleza"
    ]
}


def categorize_transaction(title: str) -> str:
    """
    Categoriza uma transação com base no título.
    
    Args:
        title: Descrição/título da transação
        
    Returns:
        Categoria identificada ou "Outros"
    """
    if not title:
        return "Outros"
    
    title_lower = title.lower()
    
    # Remove caracteres especiais para melhor matching
    title_clean = re.sub(r'[^a-záàâãéèêíïóôõöúçñ\s]', ' ', title_lower)
    
    for category, patterns in CATEGORY_PATTERNS.items():
        for pattern in patterns:
            if pattern in title_lower or pattern in title_clean:
                return category
    
    return "Outros"


def get_all_categories() -> List[str]:
    """Retorna lista de todas as categorias disponíveis"""
    return list(CATEGORY_PATTERNS.keys()) + ["Outros"]


def add_pattern(category: str, pattern: str) -> bool:
    """
    Adiciona um novo padrão a uma categoria existente.
    
    Args:
        category: Nome da categoria
        pattern: Novo padrão a ser adicionado
        
    Returns:
        True se adicionado com sucesso
    """
    if category in CATEGORY_PATTERNS:
        if pattern.lower() not in CATEGORY_PATTERNS[category]:
            CATEGORY_PATTERNS[category].append(pattern.lower())
        return True
    return False

"""
Motor de Categorização de Transações - GastX
Versão 0.3.0 - Pipeline aprimorado com regex, níveis de confiança e sugestões
"""

from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass
from enum import Enum
import re


class ConfidenceLevel(Enum):
    """Níveis de confiança da categorização"""
    HIGH = "high"       # Match exato ou padrão muito específico
    MEDIUM = "medium"   # Match parcial ou padrão genérico
    LOW = "low"         # Inferência ou fallback
    NONE = "none"       # Não categorizado


@dataclass
class CategoryMatch:
    """Resultado de uma categorização"""
    category: str
    confidence: ConfidenceLevel
    matched_pattern: Optional[str] = None


# Dicionário de padrões para categorização com regex
# Cada categoria tem padrões organizados por prioridade (high -> medium -> low)
CATEGORY_PATTERNS: Dict[str, Dict[str, List[str]]] = {
    "Transporte": {
        "high": [
            r"\buber\b", r"\b99\s?(app|taxi|pop)?\b", r"\bcabify\b", 
            r"\btaxi\b", r"\blyft\b", r"\bindriver\b"
        ],
        "medium": [
            r"posto", r"combustivel", r"gasolina", r"shell", r"ipiranga", 
            r"petrobras", r"br\s?distribuidora", r"estacionamento", r"parking",
            r"estapar", r"zona\s?azul"
        ],
        "low": [
            r"ride", r"trip", r"corrida"
        ]
    },
    "Alimentação": {
        "high": [
            r"\bifood\b", r"\bifd\*", r"\brappi\b", r"\bubereats\b",
            r"\bmcdonald", r"\bburger\s?king\b", r"\bsubway\b", r"\bbobs\b",
            r"\bkfc\b", r"\bpizza\s?hut\b", r"\bdominos\b", r"\bhabibs\b",
            r"\bgiraffa", r"\boutback\b", r"\bmadero\b"
        ],
        "medium": [
            r"restaurante", r"lanchonete", r"pizzaria", r"burger", r"lanches",
            r"lanche", r"padaria", r"panificadora", r"cafe", r"coffee",
            r"supermercado", r"mercado", r"hortifruti", r"açougue", r"acougue",
            r"sorvetes", r"sorveteria", r"chiquinho", r"acai", r"doceria",
            r"confeitaria", r"pub", r"bar\b", r"cervejaria", r"churrascaria",
            r"cantina", r"buffet", r"sushi", r"japa", r"temaki"
        ],
        "low": [
            r"comida", r"almoco", r"jantar", r"refeicao"
        ]
    },
    "Saúde": {
        "high": [
            r"\bdrogasil\b", r"\bdroga\s?raia\b", r"\bpague\s?menos\b", 
            r"\bpanvel\b", r"\bdrogaria\b", r"\bredepharma\b",
            r"\bunimed\b", r"\bamil\b", r"\bbradesco\s?saude\b"
        ],
        "medium": [
            r"farmacia", r"farma", r"pharma", r"hospital", r"clinica", 
            r"consultorio", r"medico", r"dentista", r"odonto", r"laboratorio", 
            r"exame", r"radiologia", r"raio\s?x", r"ultrassom", r"fisioterapia",
            r"psicolog", r"terapia", r"nutri"
        ],
        "low": [
            r"saude", r"health", r"med\b"
        ]
    },
    "Beleza/Cuidados Pessoais": {
        "high": [
            r"barbearia", r"barbeiro", r"salao", r"salon", r"cabeleleiro"
        ],
        "medium": [
            r"cabelo", r"manicure", r"pedicure", r"estetica", r"beleza",
            r"spa\b", r"massagem", r"depilacao", r"sobrancelha", r"unha",
            r"cosmetico", r"perfumaria"
        ],
        "low": []
    },
    "Compras": {
        "high": [
            r"\bamazon\b", r"\bmercado\s?livre\b", r"\bshopee\b", r"\bshein\b",
            r"\baliexpress\b", r"\bmagazine\s?luiza\b", r"\bmagalu\b",
            r"\bcasas\s?bahia\b", r"\bamericanas\b", r"\bsubmarino\b",
            r"\bponto\s?frio\b", r"\bextra\.com\b", r"\bcarrefour\b"
        ],
        "medium": [
            r"loja", r"store", r"shop", r"eletronico", r"celular", 
            r"smartphone", r"informatica", r"moveis", r"decoracao",
            r"roupas", r"calcados", r"tenis", r"moda", r"vestuario"
        ],
        "low": [
            r"compra", r"purchase"
        ]
    },
    "Entretenimento": {
        "high": [
            r"\bnetflix\b", r"\bspotify\b", r"\bdisney\s?\+?\b", r"\bhbo\b",
            r"\bprime\s?video\b", r"\byoutube\s?premium\b", r"\btwitch\b",
            r"\bsteam\b", r"\bplaystation\b", r"\bxbox\b", r"\bnintendo\b",
            r"\bepic\s?games\b", r"\briot\b", r"\bblizzard\b"
        ],
        "medium": [
            r"cinema", r"cinemark", r"cinepolis", r"teatro", r"show", 
            r"ingresso", r"evento", r"parque", r"diversao", r"game",
            r"jogo", r"streaming", r"musica", r"podcast", r"avalanche"
        ],
        "low": [
            r"lazer", r"entretenimento", r"diversao"
        ]
    },
    "Assinaturas": {
        "high": [
            r"\bchatgpt\b", r"\bopenai\b", r"\bgithub\b", r"\bmicrosoft\s?365\b",
            r"\bicloud\b", r"\bgoogle\s?one\b", r"\bdropbox\b", r"\bcanva\b",
            r"\badobe\b", r"\bnotion\b", r"\bslack\b", r"\bzoom\b"
        ],
        "medium": [
            r"assinatura", r"mensalidade", r"plano", r"premium", r"subscription",
            r"anual", r"mensal", r"recorrente"
        ],
        "low": [
            r"subscr"
        ]
    },
    "Casa": {
        "high": [
            r"\bceee\b", r"\bcopel\b", r"\beletropaulo\b", r"\blight\b",
            r"\bsabesp\b", r"\bcomgas\b", r"\bclaro\b", r"\bvivo\b", 
            r"\btim\b", r"\boi\b", r"\bnet\b"
        ],
        "medium": [
            r"luz", r"energia", r"eletric", r"agua", r"gas\b", r"internet", 
            r"telefone", r"celular", r"aluguel", r"condominio", r"iptu",
            r"manutencao", r"reforma", r"construcao", r"material", r"obra"
        ],
        "low": [
            r"casa", r"residencia", r"moradia"
        ]
    },
    "Educação": {
        "high": [
            r"\budemy\b", r"\bcoursera\b", r"\balura\b", r"\brocketseat\b",
            r"\bduolingo\b", r"\bskill\s?share\b", r"\blinkedin\s?learning\b",
            r"\bhotmart\b", r"\beduzz\b"
        ],
        "medium": [
            r"curso", r"escola", r"faculdade", r"universidade", r"colegio",
            r"livro", r"livraria", r"apostila", r"material\s?escolar",
            r"mensalidade\s?escolar", r"educacao", r"ensino"
        ],
        "low": [
            r"aprend", r"estud", r"aula"
        ]
    },
    "Transferências": {
        "high": [
            r"\bpix\b", r"transferencia\s?pix", r"\bted\b", r"\bdoc\b"
        ],
        "medium": [
            r"transferencia", r"enviado\s?para", r"recebido\s?de",
            r"pagamento\s?para"
        ],
        "low": []
    },
    "Academia/Esporte": {
        "high": [
            r"\bsmart\s?fit\b", r"\bblufit\b", r"\bselfit\b", r"\bbio\s?ritmo\b",
            r"\bcrossfit\b", r"\bnatacao\b", r"\bfutebol\b", r"\btenis\b"
        ],
        "medium": [
            r"academia", r"gym", r"fitness", r"esporte", r"sport",
            r"treino", r"personal", r"pilates", r"yoga", r"danca",
            r"moove", r"power", r"luta", r"jiu\s?jitsu", r"boxe"
        ],
        "low": [
            r"exercicio", r"atividade\s?fisica"
        ]
    },
    "Investimentos": {
        "high": [
            r"\bnu\s?invest\b", r"\bxp\b", r"\bbtg\b", r"\brico\b",
            r"\bclear\b", r"\bmodalmais\b", r"\binter\s?invest\b"
        ],
        "medium": [
            r"investimento", r"aplicacao", r"resgate", r"rendimento",
            r"dividendo", r"acao", r"fundo", r"cdb", r"tesouro"
        ],
        "low": []
    },
    "Impostos/Taxas": {
        "high": [
            r"\biof\b", r"\birpf\b", r"\binss\b", r"\bfgts\b"
        ],
        "medium": [
            r"imposto", r"taxa", r"tarifa", r"anuidade", r"multa",
            r"juros", r"encargo", r"tributo"
        ],
        "low": []
    }
}

# Cache para padrões compilados
_compiled_patterns: Dict[str, Dict[str, List[re.Pattern]]] = {}


def _get_compiled_patterns() -> Dict[str, Dict[str, List[re.Pattern]]]:
    """Compila e cacheia os padrões regex"""
    global _compiled_patterns
    
    if not _compiled_patterns:
        for category, priorities in CATEGORY_PATTERNS.items():
            _compiled_patterns[category] = {}
            for priority, patterns in priorities.items():
                _compiled_patterns[category][priority] = [
                    re.compile(p, re.IGNORECASE) for p in patterns
                ]
    
    return _compiled_patterns


def categorize_transaction(title: str) -> str:
    """
    Categoriza uma transação com base no título.
    Versão simplificada que retorna apenas a categoria.
    
    Args:
        title: Descrição/título da transação
        
    Returns:
        Categoria identificada ou "Outros"
    """
    result = categorize_transaction_detailed(title)
    return result.category


def categorize_transaction_detailed(title: str) -> CategoryMatch:
    """
    Categoriza uma transação com informações detalhadas.
    
    Args:
        title: Descrição/título da transação
        
    Returns:
        CategoryMatch com categoria, confiança e padrão correspondente
    """
    if not title or not title.strip():
        return CategoryMatch(
            category="Outros",
            confidence=ConfidenceLevel.NONE
        )
    
    title_clean = title.strip()
    patterns = _get_compiled_patterns()
    
    # Prioridade: high -> medium -> low
    priority_map = {
        "high": ConfidenceLevel.HIGH,
        "medium": ConfidenceLevel.MEDIUM,
        "low": ConfidenceLevel.LOW
    }
    
    for priority in ["high", "medium", "low"]:
        for category, priority_patterns in patterns.items():
            if priority not in priority_patterns:
                continue
            for pattern in priority_patterns[priority]:
                if pattern.search(title_clean):
                    return CategoryMatch(
                        category=category,
                        confidence=priority_map[priority],
                        matched_pattern=pattern.pattern
                    )
    
    return CategoryMatch(
        category="Outros",
        confidence=ConfidenceLevel.NONE
    )


def get_all_categories() -> List[str]:
    """Retorna lista de todas as categorias disponíveis"""
    return list(CATEGORY_PATTERNS.keys()) + ["Outros"]


def get_category_patterns(category: str) -> Dict[str, List[str]]:
    """Retorna os padrões de uma categoria específica"""
    return CATEGORY_PATTERNS.get(category, {})


def add_pattern(category: str, pattern: str, priority: str = "medium") -> bool:
    """
    Adiciona um novo padrão a uma categoria existente.
    
    Args:
        category: Nome da categoria
        pattern: Novo padrão regex a ser adicionado
        priority: Prioridade do padrão (high, medium, low)
        
    Returns:
        True se adicionado com sucesso
    """
    global _compiled_patterns
    
    if category not in CATEGORY_PATTERNS:
        return False
    
    if priority not in CATEGORY_PATTERNS[category]:
        CATEGORY_PATTERNS[category][priority] = []
    
    pattern_lower = pattern.lower()
    if pattern_lower not in CATEGORY_PATTERNS[category][priority]:
        CATEGORY_PATTERNS[category][priority].append(pattern_lower)
        # Limpa cache para recompilar
        _compiled_patterns = {}
        return True
    
    return False


def suggest_category(title: str) -> List[Tuple[str, float]]:
    """
    Sugere categorias possíveis para uma transação não categorizada.
    Retorna lista de tuplas (categoria, score) ordenada por relevância.
    
    Args:
        title: Descrição da transação
        
    Returns:
        Lista de sugestões com scores de 0 a 1
    """
    if not title:
        return []
    
    title_lower = title.lower()
    suggestions = []
    patterns = _get_compiled_patterns()
    
    for category, priority_patterns in patterns.items():
        score = 0.0
        matches = 0
        
        for priority, compiled in priority_patterns.items():
            weight = {"high": 1.0, "medium": 0.6, "low": 0.3}[priority]
            for pattern in compiled:
                if pattern.search(title_lower):
                    score += weight
                    matches += 1
        
        if matches > 0:
            # Normaliza score
            normalized = min(score / 2, 1.0)
            suggestions.append((category, normalized))
    
    # Ordena por score decrescente
    suggestions.sort(key=lambda x: x[1], reverse=True)
    return suggestions[:5]


def batch_categorize(titles: List[str]) -> List[CategoryMatch]:
    """
    Categoriza múltiplas transações de uma vez.
    Otimizado para processamento em lote.
    
    Args:
        titles: Lista de descrições de transações
        
    Returns:
        Lista de CategoryMatch correspondentes
    """
    return [categorize_transaction_detailed(title) for title in titles]


def get_categorization_stats(transactions: List[Dict]) -> Dict:
    """
    Retorna estatísticas sobre a categorização de um conjunto de transações.
    
    Args:
        transactions: Lista de transações com 'title' e 'category'
        
    Returns:
        Dicionário com estatísticas
    """
    stats = {
        "total": len(transactions),
        "categorized": 0,
        "uncategorized": 0,
        "by_confidence": {
            "high": 0,
            "medium": 0,
            "low": 0,
            "none": 0
        },
        "by_category": {}
    }
    
    for t in transactions:
        title = t.get("title", "")
        result = categorize_transaction_detailed(title)
        
        if result.category != "Outros":
            stats["categorized"] += 1
        else:
            stats["uncategorized"] += 1
        
        stats["by_confidence"][result.confidence.value] += 1
        
        cat = result.category
        if cat not in stats["by_category"]:
            stats["by_category"][cat] = 0
        stats["by_category"][cat] += 1
    
    # Calcula taxa de categorização
    if stats["total"] > 0:
        stats["categorization_rate"] = round(
            stats["categorized"] / stats["total"] * 100, 1
        )
    else:
        stats["categorization_rate"] = 0
    
    return stats

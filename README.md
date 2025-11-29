# GastX  
**Analisador Inteligente de Gastos Pessoais**

O GastX transforma extratos bancários (Nubank, Inter e outros) em análises simples, visuais e úteis.

---


## Visão Geral  
O objetivo do GastX é proporcionar organização financeira sem complexidade.  
O usuário faz upload de um arquivo CSV e recebe uma visão clara dos próprios gastos, com categorias automáticas, gráficos e tendências.

---

## Funcionalidades Atuais (v0.4)

- Upload de extratos em CSV via drag-and-drop
- Detecção automática do banco (Nubank, Inter, Bradesco, Itaú, C6 e genéricos)
- **Pipeline de categorização aprimorado**:
  - Padrões regex com 3 níveis de prioridade (high, medium, low)
  - Níveis de confiança na categorização
  - Sugestões inteligentes para transações não categorizadas
  - 14 categorias automáticas incluindo Investimentos e Impostos/Taxas
- **Dashboard com navegação por abas**:
  - **Visão Geral**: Resumo, gráfico de pizza, ranking de categorias
  - **Evolução Temporal**: Gráficos mensais de gastos e recebimentos
- **Visualizações Temporais**:
  - Gráfico de linha/barras/área com gastos vs recebimentos por mês
  - Evolução de categorias ao longo do tempo
  - Saldo mensal (recebidos - gastos)
  - Filtro por categoria específica
- Lista de transações paginada (20 por página)
- **Endpoints de API**:
  - `/categories` - Lista todas as categorias
  - `/categories/suggest` - Sugere categoria para uma transação
  - `/categories/add-pattern` - Adiciona novos padrões de reconhecimento

---

## Funcionalidades Planejadas  

1. Ranking de maiores gastos individuais
2. Módulo de insights:
   - Detecção de aumentos atípicos
   - Análise de assinaturas e recorrências
   - Projeção de gastos futuros
3. Persistência de dados (SQLite/PostgreSQL)
4. Aprendizado incremental na categorização

---

## Tecnologias Utilizadas

### Backend
- **FastAPI** - Framework web Python de alta performance
- **Pandas** - Manipulação e análise de dados
- **Pydantic** - Validação de dados

### Frontend
- **React 18** - Biblioteca de interface
- **Vite** - Build tool moderno
- **Tailwind CSS** - Estilização utilitária
- **Recharts** - Visualização de dados
- **Lucide React** - Ícones
- **React Dropzone** - Upload de arquivos

---

## Estrutura do Projeto

```
GastX/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py          # API FastAPI
│   │   ├── models.py        # Modelos Pydantic
│   │   └── categorizer.py   # Motor de categorização
│   └── requirements.txt
├── frontend/
│   ├── public/
│   │   └── favicon.svg
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── UploadArea.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── TimelineChart.jsx    # Gráfico temporal mensal
│   │   │   ├── CategoryEvolution.jsx # Evolução por categoria
│   │   │   └── Pagination.jsx
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── postcss.config.js
├── nubank_teste.csv          # Arquivo de teste
├── scripts/                  # Scripts de suporte (Windows/Linux)
│   ├── start.bat             # Inicia frontend + backend (Windows)
│   ├── build.bat             # Build/prepare script (Windows)
│   ├── start-backend.bat     # Inicia apenas o backend (Windows)
│   ├── start-frontend.bat    # Inicia apenas o frontend (Windows)
│   ├── start.sh              # Inicia frontend + backend (Linux/Mac)
│   └── build.sh              # Build/prepare script (Linux/Mac)
├── .gitignore
└── README.md
```

---

## Como Executar

### Pre-requisitos
- Python 3.10+
- Node.js 18+
- npm ou yarn

### Opção Rápida (Windows)

1. Execute `scripts/start.bat` para iniciar o backend e o frontend (recomendado)
2. Ou execute `scripts/start-backend.bat` e `scripts/start-frontend.bat` separadamente se preferir iniciar apenas uma parte

### Backend (Manual)

```bash
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

O backend estará disponível em: `http://localhost:8000`  
Documentação da API: `http://localhost:8000/docs`

### Frontend (Manual)

```bash
cd frontend
npm install
npm run dev
```

O frontend estará disponível em: `http://localhost:5173`

---

## Como Usar

1. **Exporte seu extrato** - No app do Nubank ou Inter, exporte o extrato em formato CSV
2. **Faça upload** - Arraste o arquivo para a área de upload ou clique para selecionar
3. **Analise** - Visualize seus gastos categorizados automaticamente

---

## Bancos Suportados

| Banco | Status | Formato |
|-------|--------|---------|
| Nubank | ✅ Suportado | `date, title, amount` |
| Inter | ✅ Suportado | `Data, Descrição, Valor` |
| Bradesco | ✅ Suportado | `Data, Histórico, Valor` |
| Itaú | ✅ Suportado | `Data, Lançamento, Valor` |
| C6 Bank | ✅ Suportado | `Data, Movimentação, Valor` |
| Outros | 🔄 Genérico | Colunas devem seguir padrão similar |

---

## Categorias Automáticas

| Categoria | Exemplos | Ícone |
|-----------|----------|-------|
| **Transporte** | Uber, 99, táxi, combustível, estacionamento
| **Alimentação** | Restaurantes, supermercados, iFood, Rappi
| **Saúde** | Farmácias, consultas, exames, hospitais
| **Beleza/Cuidados Pessoais** | Barbearia, salão, manicure, estética
| **Compras** | Amazon, Shopee, Mercado Livre, lojas
| **Entretenimento** | Netflix, Spotify, cinema, jogos
| **Assinaturas** | ChatGPT, iCloud, Microsoft 365, serviços
| **Casa** | Luz, água, internet, aluguel, condomínio
| **Educação** | Cursos, livros, Udemy, faculdade
| **Transferências** | PIX, TED, DOC
| **Academia/Esporte** | Smart Fit, academias, esportes
| **Investimentos** | XP, BTG, aplicações, resgates
| **Impostos/Taxas** | IOF, tarifas, multas, anuidades
| **Outros** | Não categorizados

---

## Roadmap

- [x] **v0.1** - Estruturação do repositório
- [x] **v0.2** - Prototipação do front-end e tela de upload
- [x] **v0.3** - Pipeline de leitura e categorização aprimorado
- [x] **v0.4** - Primeiras visualizações temporais
- [ ] **v1.0** - Dashboard completo com insights

---

## Changelog

### v0.4.0 (Atual)
- **Visualizações Temporais**: Novos gráficos de evolução mensal
  - TimelineChart: Gráfico de barras, linhas ou área (alternável)
  - Comparativo de gastos vs recebimentos por mês
  - Visualização do saldo mensal
- **Evolução por Categoria**: Análise de gastos por categoria ao longo do tempo
  - Filtro para visualizar categoria específica ou todas
  - Gráfico de barras empilhadas por mês
- **Dashboard com Abas**: Navegação entre "Visão Geral" e "Evolução Temporal"
- Função auxiliar `calculate_monthly_data()` no backend

### v0.3.0
- **Motor de categorização reescrito** com regex e níveis de confiança
- Padrões organizados em 3 níveis de prioridade (high, medium, low)
- 14 categorias automáticas (adicionado Investimentos, Impostos/Taxas, Beleza)
- Suporte expandido para mais bancos (Bradesco, Itaú, C6 Bank)
- Normalização inteligente de valores monetários (R$, vírgula, etc.)
- Novos endpoints: `/categories`, `/categories/suggest`, `/categories/add-pattern`
- Paginação na lista de transações (20 por página)
- Estatísticas de taxa de categorização
- Função de sugestão de categorias para transações não reconhecidas

### v0.2.0
- Interface React com Vite e Tailwind CSS
- Tela de upload com drag-and-drop
- Dashboard com gráficos e categorização
- API FastAPI funcional
- Suporte a Nubank e Inter

### v0.1.0
- Estrutura inicial do projeto
- Definição da arquitetura
- Configuração do repositório

---

## Autor

Desenvolvido por Luciano

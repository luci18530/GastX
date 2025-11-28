# GastX  
**Analisador Inteligente de Gastos Pessoais**

O GastX transforma extratos bancários (Nubank, Inter e outros) em análises simples, visuais e úteis.

---


## Visão Geral  
O objetivo do GastX é proporcionar organização financeira sem complexidade.  
O usuário faz upload de um arquivo CSV e recebe uma visão clara dos próprios gastos, com categorias automáticas, gráficos e tendências.

---

## Funcionalidades Atuais (v0.2)

- Upload de extratos em CSV via drag-and-drop
- Detecção automática do banco (Nubank, Inter)
- Categorização automática de transações
- Dashboard com:
  - Resumo de gastos e recebimentos
  - Gráfico de pizza por categoria
  - Ranking de categorias
  - Lista de transações

---

## Funcionalidades Planejadas  

1. Distribuição e evolução mensal
2. Ranking de maiores gastos individuais
3. Módulo de insights:
   - Detecção de aumentos atípicos
   - Análise de assinaturas e recorrências
   - Projeção de gastos futuros
4. Persistência de dados (SQLite/PostgreSQL)
5. Aprendizado incremental na categorização

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
│   │   │   └── Dashboard.jsx
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
| Nubank | Suportado | `date, title, amount` |
| Inter | Suportado | `Data, Descrição, Valor` |
| Outros | Genérico | Colunas devem seguir padrão similar |

---

## Categorias Automáticas

- **Transporte** - Uber, 99, táxi, combustível
- **Alimentação** - Restaurantes, supermercados, delivery
- **Saúde** - Farmácias, consultas, exames
- **Compras** - E-commerce, lojas
- **Entretenimento** - Streaming, cinema, jogos
- **Assinaturas** - Serviços recorrentes
- **Casa** - Contas, aluguel, manutenção
- **Educação** - Cursos, livros
- **Transferências** - PIX, TED
- **Academia/Esporte** - Academias, esportes
- **Outros** - Não categorizados

---

## Roadmap

- [x] **v0.1** - Estruturação do repositório
- [x] **v0.2** - Prototipação do front-end e tela de upload
- [ ] **v0.3** - Pipeline básico de leitura e categorização aprimorado
- [ ] **v0.4** - Primeiras visualizações temporais
- [ ] **v1.0** - Dashboard completo com insights

---

## Changelog

### v0.2.0 (Atual)
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

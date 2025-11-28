# GastX  
Analisador Inteligente de Gastos Pessoais

O GastX é um aplicativo focado em transformar extratos bancários (Nubank, Inter e outros) em análises simples, visuais e úteis. Ele parte dos seus scripts pessoais de finanças e evolui para uma interface amigável que categoriza despesas, exibe gráficos e gera insights automaticamente.

## Visão Geral  
O objetivo do GastX é proporcionar organização financeira sem complexidade.  
O usuário faz upload de um arquivo CSV e recebe uma visão clara dos próprios gastos, com categorias automáticas, gráficos e tendências.

## Funcionalidades Planejadas  
1. Upload de extratos em CSV (Nubank e Inter).  
2. Identificação automática das colunas relevantes.  
3. Categorização automática com dicionário e aprendizado incremental.  
4. Painel visual com:
   - distribuição de categorias,
   - evolução mensal,
   - ranking de maiores gastos,
   - resumo mensal.  
5. Módulo de insights, incluindo:
   - detecção de aumentos atípicos,
   - análise de assinaturas e recorrências,
   - projeção de gastos futuros.  

## Tecnologia Prevista  
- Front-end: React (ou Next.js) e Tailwind CSS.  
- Back-end: FastAPI (Python).  
- Banco de dados: SQLite ou PostgreSQL.  
- Visualizações: Recharts ou ECharts.  
- Motor de categorização: scikit-learn + heurísticas próprias.

## Estrutura do Projeto  
A ser definida após início do desenvolvimento.  
O repositório, neste momento, serve apenas como placeholder.

## Roadmap Inicial  
- Versão 0.1: Estruturação do repositório.  
- Versão 0.2: Prototipação do front-end e tela de upload.  
- Versão 0.3: Pipeline básico de leitura e categorização.  
- Versão 0.4: Primeiras visualizações.  
- Versão 1.0: Dashboard completa com insights.

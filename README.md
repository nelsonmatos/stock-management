# MedStock — Prova de Conceito
Sistema de Gestão de Stocks Hospitalares

## Stack
- **Backend**: Node.js + Fastify + Prisma + SQLite
- **Frontend**: Vue 3 + Vite + PrimeVue + Chart.js

## Arranque rápido

### 1. Backend
```bash
cd backend
npm install
npm run db:push      # cria base de dados SQLite
npm run db:seed      # carrega dados de demo
npm run dev          # arranca em http://localhost:3000
```

### 2. Frontend (outro terminal)
```bash
cd frontend
npm install
npm run dev          # arranca em http://localhost:5173
```

Abrir browser em **http://localhost:5173**

---

## Dados de demo carregados
- **31 artigos**: medicamentos, dispositivos médicos, EPI, consumíveis, reagentes
- **24 lotes**: com datas de validade variadas (alguns a vencer em <30 dias, outros já expirados)
- **61 registos de stock** distribuídos por 5 localizações
- **77 movimentos** dos últimos 90 dias (entradas, saídas, transferências)
- **8 encomendas** com estados diferentes (pendente, parcial, completa)

## Módulos disponíveis
| Módulo | Descrição |
|---|---|
| Dashboard | KPIs, gráfico de consumo mensal, stock por família |
| Stock | Stock por artigo com semáforo mínimo/máximo |
| Artigos | Catálogo completo de artigos |
| Lotes | Gestão de lotes com controlo de validade |
| Movimentos | Histórico de entradas/saídas com registo manual |
| Alertas | Stock abaixo mínimo, lotes a vencer, lotes expirados |
| Encomendas | Lista de encomendas com detalhe de linhas |

## Reset da base de dados
```bash
cd backend
npm run db:reset     # apaga e volta a criar com dados de demo
```

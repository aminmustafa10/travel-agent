# Travel Agent

Assistente preventivo para viagens e intercâmbios. O MVP permitirá criar uma viagem, definir um orçamento semanal, registrar despesas e gerar alertas quando o usuário estiver gastando mais rápido que o planejado.

## Estrutura

- `frontend`: React, Vite e TypeScript
- `backend`: Node.js, Express e TypeScript

## Requisitos

- Node.js 22.12 ou superior
- npm 10 ou superior

## Como executar

Em um terminal, inicie o frontend:

```bash
cd frontend
npm run dev
```

Em outro terminal, inicie o backend:

```bash
cd backend
npm run dev
```

O frontend será disponibilizado pelo Vite (normalmente em `http://localhost:5173`) e a API em `http://localhost:3333`. Para verificar a API, acesse `http://localhost:3333/health`.

## Build

```bash
cd frontend
npm run build

cd ../backend
npm run build
```

# MangaTracker

Monorepo para rastrear preços de volumes de mangá em lojas brasileiras.

## Estrutura

```
mangatracker/
  apps/
    api/          -- API REST (Fastify + Prisma)
    web/          -- Frontend (React + Tailwind)
  packages/
    cli/          -- CLI para operações do banco
    database/     -- Schema e cliente Prisma
    scraper/      -- Web scraping (Playwright + Cheerio)
    shared/       -- Tipos e utilitários compartilhados
```

## Funcionalidades

- Busca de preços em 7 lojas (Amazon, Mercado Livre, Shopee, Magalu, OLX, Enjoei, Panini)
- Histórico de preços por volume
- Coleção pessoal (tenho / falta / quero)
- Lista de desejos
- Alertas de preço
- Dashboard com promoções e maiores quedas

## Tecnologias

- **Monorepo:** Turborepo + npm workspaces
- **API:** Fastify 5 + Prisma 6
- **Frontend:** React 19 + React Router 7 + Vite 8 + Tailwind CSS 4
- **Scraping:** Playwright + Cheerio
- **DB:** SQLite (dev) / PostgreSQL (prod)
- **Auth:** JWT + bcryptjs

## Começando

```bash
npm install
npm run db:push
npm run dev
```

## Scripts

| Comando | Descrição |
|---|---|
| `npm run dev` | Inicia apps/packages em modo dev |
| `npm run build` | Compila todos os pacotes |
| `npm run db:generate` | Gera cliente Prisma |
| `npm run db:push` | Sincroniza schema com o banco |
| `npm run db:migrate` | Executa migrations |
| `npm run db:seed` | Popula banco com dados de exemplo |
| `npm run manga` | Executa CLI |

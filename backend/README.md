# Бэкенд «Держимся»

Fastify + Prisma + PostgreSQL. Дизайн — в [`../docs/backend.md`](../docs/backend.md).

## Запуск

```bash
cd backend
cp .env.example .env          # вписать DATABASE_URL (Neon) и JWT_SECRET
yarn install
yarn db:generate              # сгенерировать Prisma Client
yarn db:migrate               # применить миграции к БД
yarn db:seed                  # вопросы + города + dev-пользователь
yarn dev                      # http://localhost:3000
```

Без Telegram локально: `AUTH_DEV=1` в `.env`, логин через
`POST /api/v1/auth/web` с телом `{ "externalId": "dev" }` → вернёт `{ token, user }`.
Дальше токен в заголовке `Authorization: Bearer <token>`.

## Скрипты

- `yarn dev` — tsx watch
- `yarn typecheck` — tsc --noEmit
- `yarn build` / `yarn start` — прод-сборка (tsup) и запуск
- `yarn db:migrate` / `db:seed` / `db:studio`

## Структура

`src/modules/<feature>/` = `routes` (HTTP) + `service` (логика + Prisma) + `mapper` (модель → DTO).
Авторизация: сменные стратегии в `src/auth/`, единый guard сессии в `src/plugins/auth.ts`.
Общие API-типы — в `../contracts` (alias `@contracts/*`).

# Бэкенд «Держимся»

> Бэкенд проектируется после фронта (frontend-first). Контракт API уже есть в моканых ручках фронта — сюда «вливаем» настоящие данные в те же типы.

## Стек

- **Node 24 + TypeScript**, ESM.
- **Fastify** — HTTP-фреймворк (быстрый, типобезопасный, pino-логи из коробки, без Nest-овой церемонии).
- **Prisma** — ORM (схема + миграции + автокомплит).
- **PostgreSQL** — БД (аналитика/тренды: window functions, `date_trunc`, `jsonb`). Хостинг — **Neon** (serverless, free, branching). Локально без докера — Neon dev-branch или Postgres.app.
- **@fastify/jwt** — сессии. **tsx** — dev-запуск, **tsup** — сборка.

Без workspaces. Линт/формат — те же `oxlint` + `prettier`, что на фронте.

## Структура репозитория

```
/
  src/          # фронт (React + Vite) — как есть
  contracts/    # общие API-типы (plain TS, «провод»)
  backend/      # бэкенд (Fastify + Prisma)
```

`contracts/` — нейтральная зона: и фронт, и бэк импортят оттуда, зависимость не идёт фронт↔бэк напрямую. Связь — через alias `@contracts/*` (в `tsconfig.paths` обеих сторон). Так как контракты — это **только типы**, импорт делаем `import type` → на рантайме он стирается, резолвить нечего.

```
src/  ───►  contracts/  ◄───  backend/
```

## Контракты (`contracts/`)

Plain TS-типы того, что реально летит по HTTP («провод»): даты — ISO-строки. Клиентский тип фронта и тип бэка **имеют право отличаться** — `contracts` описывает только провод, каждый слой мапит его в своё:

```
Prisma-модель  →  *Dto (contracts)  →  клиентский тип фронта (с Date)
   бэк мапит ↑        ↑ общий              ↑ фронт мапит
```

Контракты — это типы, без рантайма. Валидацию входящих запросов делает бэк у себя (это его дело — не доверять клиенту), отдельно от `contracts`.

## Архитектура бэкенда

Тонкое разделение по фиче-модулям, **зеркалит модули фронта** (`user`, `checkin`, `salary`, …):

- **route** — только HTTP: достать `request.user`/тело → вызвать service → вернуть ответ.
- **service** — логика + БД (Prisma) + маппинг в Dto. Тестируется без HTTP.
- **mapper** — `Prisma-модель → *Dto` в одном месте.
- **repository** — пока не вводим; service ходит в Prisma напрямую.

```
backend/
  prisma/
    schema.prisma
    seed.ts
  src/
    config.ts            # конфиг из env (падаем, если чего-то нет)
    prisma.ts            # singleton PrismaClient
    app.ts               # buildApp: плагины + роуты
    server.ts            # listen
    plugins/
      auth.ts            # guard сессии: request.userId
      error-handler.ts   # единый формат ошибок
    lib/
      errors.ts          # AppError(status, code, message)
    auth/
      init-data.ts       # проверка Telegram initData (HMAC)
      strategies.ts      # сменные стратегии логина
    modules/
      user/      { user.routes.ts, user.service.ts, user.mapper.ts }
      checkin/   { ... }
      intent/    { ... }
      city/      { ... }
```

**Чего не делаем сейчас** (не переусложняем): DI-контейнеры, гексагон/ports-adapters, CQRS, отдельный repository-слой, workspaces.

Вся «умная» вычислительная логика (вилка зарплат, текст гороскопа, % совместимости, метрики чек-ина и индекс выгорания) живёт в **service на бэке**; фронт только рендерит. `getZodiac(date)` можно держать и на клиенте для мгновенного UI, и на бэке для расчётов.

## Авторизация: сменные стратегии логина + единая сессия

Способ входа и сессия — **два разных слоя**:

1. **Стратегии логина** (по провайдеру) — сменные. Сейчас Telegram (initData → проверка HMAC боттокеном). Позже WEB (почта/OAuth/magic-link), APP и т.д. Стратегия умеет одно: «проверь запрос → верни `externalId` + профиль».
2. **Сессия** — одна и та же после любого логина (JWT). Все бизнес-ручки проверяют только сессию и не знают, как ты вошёл.

Поэтому подменяемость бесплатная: `auth`-guard на защищённых роутах не меняется никогда; провайдеро-специфика — только в `POST /auth/:provider`.

**Модель «один человек — несколько способов входа»:**

```
User ──< AuthIdentity (provider, externalId)
```
- `User` — человек (профиль, isPro).
- `AuthIdentity` — «вошёл через X»: `provider: TELEGRAM | WEB | APPLE | …`, `externalId`. Уникально `(provider, externalId)`. Тот же человек на PWA получит вторую identity `WEB` — это **тот же** `User`.

`type`, про который шла речь, — это `AuthIdentity.provider` (на способе входа, не на пользователе).

**Поток (Telegram сейчас):**
```
client → POST /auth/telegram { initData }
  → telegramStrategy.verify (HMAC + свежесть auth_date)
  → upsert User + AuthIdentity(TELEGRAM, tgId)
  → выдать JWT
далее: защищённые запросы с Bearer-токеном → auth-guard → request.userId
```

Сессия на старте — **stateless JWT** (короткий TTL). Отзыв/много устройств → таблица `RefreshToken` позже.

## Модель данных

| Сущность | Назначение | Ключевые поля | Связи | MVP |
|---|---|---|---|---|
| **User** | человек + профиль + статус | name, avatarUrl, birthday, birthTime, country, city, birthCity, profession, grade, experienceYears, experienceMonths, isPro | →AuthIdentity, CheckIn, … | ✅ |
| **AuthIdentity** | способ входа | provider (enum), externalId, meta(jsonb) | →User; uniq(provider,externalId) | ✅ |
| **Question** | каталог вопросов чек-ина (серверные) | key (метрика), **day** (порядок прохождения), order (внутри дня), title, helperText, lowText, highText, image, scaleMax, group, active | →CheckInAnswer | ✅ |
| **CheckIn** | факт прохождения | createdAt, **day**, advice | →User, →CheckInAnswer | ✅ |
| **CheckInAnswer** | ответ по одной шкале | questionKey, value | →CheckIn | ✅ |
| **IntentEvent** | замер намерения (PRO/оплата) | feature, action, plan? | →User? | ✅ |
| **UsageEvent** | использование инструментов (квота + аналитика) | tool, createdAt | →User | ✅ |
| **City** | справочник городов (поиск + место рождения) | name, region?, country?, lat?, lon?, tz? | — | ✅ (сид: ~25 городов РФ с координатами и поясом) |
| **RefreshToken** | отзыв сессий, много устройств | tokenHash, expiresAt | →User | позже |
| **DailySnapshot** | кэш посчитанных метрик за день | date, jsonb | →User | позже |
| **MarketSalary** | справочник вилок (role/grade/city) | median, p25, p75 | — | нужен источник данных |
| **Subscription** | реальная подписка (платежи) | plan, status, expiresAt | →User | позже (пока `isPro`) |

Стабильность для аналитики: `Question.key` не меняем под одной формулировкой — тренды считаются по `key` во времени.

**Профиль ↔ функции:** профиль предзаполняет инпуты функций (через `getMe`), а функции **дозаполняют пустые** поля профиля при первом использовании (`useProfileBackfill` на фронте → PATCH `/me` только пустых полей; повторные использования профиль не меняют — «первое заполнение побеждает»). Касается всех профильных полей: дата/время/место рождения, город, профессия, грейд, опыт.

### Чек-ин: хранение и порядок прохождения

Вопросы сгруппированы по **дням прохождения** (`Question.day`). Каждый чек-ин отдаёт один день; внутри дня вопросы идут по `order`. Когда дни заканчиваются — цикл начинается заново с первого:

```ts
// день = (число пройденных чек-инов % число дней) + 1
const maxDay = max(Question.day where active)
currentDay = (count(CheckIn where userId) % maxDay) + 1
```

- `GET /check-in/questions` → вопросы дня `currentDay` (`where active, day` · `orderBy order`).
- `POST /check-in` → создаёт `CheckIn(day)` + нормализованные `CheckInAnswer[]` (по одной строке на шкалу: `{ questionKey, value }`). Ответы — **массив** `{ questionKey, value }[]`, не объект-словарь, чтобы порядок/состав вопросов могли меняться без миграций. `advice` считается на бэке из ответов.
- `GET /check-in/today` → последний `CheckIn` с `createdAt >= начало суток`.

Сейчас засеяно 2 дня: **день 1** — общее самочувствие (mood, energy, sleep, stress, support, шкала 5), **день 2** — выгорание (exhaustion, cynicism, focus, irritability, load; `load` — шкала 10). Мок фронта (`src/modules/checkIn/api/mocks.ts`) зеркалит этот формат для офлайн-режима (`VITE_API_MOCKS=true`).

### Гороскоп и совместимость: астро-движок

Обе функции считаются **детерминированно, без ИИ**, с graceful-degradation по двум уровням:

- **Уровень A (по знаку)** — нужна только дата рождения; знак Солнца по календарю.
- **Уровень B (по натальной карте)** — дата + время рождения (место опц.); поднимает Луну/Меркурий/Венеру/Марс через эфемериды.

Движок — **`astronomy-engine`** (MIT, чистый JS, без нативной сборки — в отличие от Swiss Ephemeris с AGPL-ловушкой). Часовой пояс: из долготы места (`lon/15`), иначе по умолчанию UTC+3 (ориентир СНГ). Эфемериды и свойства знаков — в `backend/src/lib/astro.ts`; бизнес-логика — чистые функции (`*.logic.ts`), без БД.

**Свойства знака — это остатки от деления индекса** (зодиак цикличен): стихия = `i%4`, модальность = `i%3`, полярность = `i%2`. Базовая гармония пары — по расстоянию между знаками 0..6 (тригон/секстиль/квадрат/оппозиция…).

**Проекция на «офисные» метрики** (то, что видит юзер):
- **Совместимость** → `donuts` 0..1: «Созвоны 1:1», «Дедлайны», «Общий язык», «Терпимость». Уровень A — из стихии/модальности/аспекта Солнц; Уровень B уточняет кросс-аспектами: Луна-Луна (эмоции), Меркурий-Меркурий (договориться словами), Марс-Марс (трение). `percent` — взвешенное среднее; `verdict` — по `relation` × бакету.
- **Гороскоп** → `aspects` (label + tone + text): «Созвоны», «Дедлайны», «Общий чат», «Фокус». Скор = детерминированный сид-хэш(знак+дата) + **реальные сигналы неба**: транзитная Луна (настроение дня) и **ретроградный Меркурий** (считается по-настоящему → бьёт по «Созвонам»/«Общему чату»). Тексты — пул фраз в нашем tone of voice, выбор по сиду (стабильно в течение дня).

`level: 'sun' | 'chart'` в ответе → фронт показывает «✦ по натальной карте».

**Асцендент** (восходящий знак) считается, когда заданы **время и место** (`lat/lon/tz` из города): по звёздному времени + широте, без планет. Формула проверена по высоте/азимуту (результат лежит на горизонте с восточной стороны). На клиенте тот же расчёт через GMST (без эфемерид) — поэтому асцендент показывается **мгновенно при вводе** рядом со знаком и совпадает с серверным (`HoroscopeDto.ascendant`). Часовой пояс: из города (`City.tz`) → иначе грубо из долготы → дефолт UTC+3.

В UI: в форме гороскопа чекбокс-раскрытие «уточнить время и место рождения» (два поля в строке: время + город), асцендент пишется рядом со знаком. Город рождения берётся из справочника `City` (координаты + пояс).

**Синастрия и Уровень B:** для совместимости кросс-аспекты (Луна-Луна и т.д.) требуют **обе** карты. Если один человек на Уровне B, а другой на A — сравнивать нечего, результат эквивалентен A+A (**без разницы**). Реально время+место «цели» (босса) почти никогда не известны, поэтому совместимость в UI остаётся Уровнем A; полный B сосредоточен в гороскопе (про себя).

## Эндпоинты

| Метод · путь | Auth | Делает | Источник |
|---|---|---|---|
| `POST /auth/:provider` (telegram) | public | креды → сессия | стратегия |
| `POST /auth/refresh` · `/logout` | — | (когда будет RefreshToken) | позже |
| `GET /me` · `PATCH /me` | 🔒 | профиль | User |
| `GET /check-in/questions` | 🔒 | каталог вопросов | Question |
| `POST /check-in` | 🔒 | сохранить ответы + advice | CheckIn(+Answer) |
| `GET /check-in/today` | 🔒 | чек-ин за сегодня | CheckIn |
| `GET /check-in/report?period=` | 🔒 | тренды/динамика | вычисл. из Answer |
| `GET /metrics/daily` | 🔒 | метрики на главную | вычисл. |
| `GET /check-in/access` | 🔒 | гейтинг free/locked | вычисл. (isPro+политика) |
| `GET /cities?query=&limit=` | 🔒 | поиск города (серверный) | City |
| `GET /horoscope?birthday=&birthTime=&date=` | 🔒 | расклад на день (Уровень A/B) | вычисл. (astronomy-engine) |
| `POST /compatibility` `{you,target,relation}` | 🔒 | % + офисные метрики (A/B) | вычисл. (astronomy-engine) |
| `POST /salary` · `/salary/cities`(PRO) · `GET /salary/quota` | 🔒 | вилка / по городам / квота | вычисл. (+MarketSalary, UsageEvent) |
| `POST /intent` | 🔒 | замер намерения | IntentEvent |

**Вычисляемое, не хранимое:** `metrics/daily`, `check-in/report`, `check-in/access`, `salary/quota`, результаты horoscope/compatibility/salary — считаются на лету (из `CheckInAnswer`/`UsageEvent`/`isPro`), отдельных таблиц под них нет.

## БД и запуск

- Прод и dev — **PostgreSQL**. Без докера: Neon dev-branch (облако, только `DATABASE_URL`) или Postgres.app локально. **Не** мешаем SQLite-dev + PG-prod (Prisma завязан на провайдер).
- env (`backend/.env`): `DATABASE_URL`, `BOT_TOKEN`, `JWT_SECRET`, `PORT`, `AUTH_DEV`. `AUTH_DEV=1` включает dev-заглушку авторизации: доступна стратегия логина `POST /auth/web` без Telegram, **и** guard сессии без токена подставляет фиксированного dev-юзера (`AuthIdentity provider:'web' externalId:'dev'`, find-or-create). Так фронт работает против живого бэка без настроенного Telegram. В проде `AUTH_DEV` выключен → без валидного Bearer-токена guard отдаёт 401.
- Команды: `yarn db:generate` (Prisma client), `yarn db:migrate` (миграции), `yarn db:seed` (вопросы + города + dev-юзер), `yarn dev` (tsx watch), `yarn build`/`start`.

## Дальнейшие шаги

1. ~~Перевести фронт на `contracts` и выключить `mocked`~~ ✅ Сделано. `@contracts/*` подключён, `request.ts` ходит в реальный API (мок остаётся под `VITE_API_MOCKS=true`). `transform`-мапперы на месте.
2. ~~Полный чек-ин (вопросы по дням + порядок прохождения + сохранение ответов) + dev-заглушка авторизации~~ ✅ Сделано (см. «Чек-ин: хранение и порядок прохождения» и `AUTH_DEV`). Реализованы `GET /check-in/questions`, `POST /check-in`, `GET /check-in/today`.
3. ~~Гороскоп и совместимость~~ ✅ Сделано (см. «Гороскоп и совместимость: астро-движок»): `GET /horoscope`, `POST /compatibility`, Уровни A/B на `astronomy-engine`. Остаётся **`salary`** — определить источник данных по вилкам. **← следующий шаг.** Доп. задел: асцендент (координаты места) + сбор времени/места цели в форме совместимости.
4. Метрики/отчёты чек-ина и индекс выгорания (`check-in/report`, `metrics/daily`, `check-in/access` — пока моканы на фронте). См. стратегию вопросов выгорания.
5. `RefreshToken` + `/auth/refresh` + `/logout`, обработка 401 на фронте, реальные платежи (`Subscription`).

# Архитектура

> Целевое устройство приложения. Часть ещё не реализована — план, по которому собираем фронтенд.

## Принципы

1. **Platform-agnostic ядро** — всё платформенное (Telegram, авторизация, сеть, storage) спрятано за провайдерами/абстракциями. Компоненты их не знают.
2. **Frontend-first** — бэкенда нет. Описываем клиентские типы + моканые ручки; позже подменяем мок на реальный сервер, не трогая UI.
3. **Swappable auth** — слой авторизации отдельная абстракция (сейчас Telegram, потом PWA/web заменой одного адаптера).

## Платформа: Telegram Mini App (первая цель)

Запуск через WebApp SDK. Из SDK берём `initData` (авторизация), тему, viewport, MainButton/BackButton, haptics — **только внутри провайдера `app`/`shared`**, не из компонентов.

## Слои (модульная архитектура)

> Вертикальные слои + слайсы по сущностям. Похоже на FSD идеей слоёв и слайсов, **но это не FSD** — без его специфичных правил. Берём только: направление импортов вниз и деление `modules` на слайсы-сущности.

```
src/
├── app/      # провайдеры, навигация (React Router), композиция приложения
├── pages/    # страницы; слайсы по сущностям, но привязаны к страничным блокам
├── modules/  # бизнес-логика; делится на СЛАЙСЫ-сущности (user, zodiak, salary, checkIn, ...)
└── shared/   # без бизнес-логики: ui-kit + дизайн-система, слой запросов, utils, hooks, libs
```

Правило направления импортов: `app → pages → modules → shared` (вниз). Алиас `~` → `src`.

### Анатомия слайса (`modules/<entity>/`)

Все папки опциональны. **Внутри слайса своё вертикальное деление**, импорты только вниз:

```
types  →  utils  →  api  →  components  →  widgets
(низ)                                        (верх)
```

```
types/       # клиентские типы (MappedOutput) — самый низкий уровень
utils/       # чистые утилы сущности
api/         # мапперы (Output→MappedOutput) + запросы (фабрики createQuery/createMutation)
components/  # презентационные обёртки над ui-kit; данные — ПРОПСАМИ, без вызова ручек
widgets/     # законченные «подключённые» блоки: ВЫЗЫВАЮТ ручки и собирают из components
```

Правила:
- **`components` не дёргают ручки.** Получают данные пропсами (`cities: City[]`). Могут импортировать `api` только за типами/мапперами, но не вызывать `useQuery`/`useMutation`.
- **`widgets`** — единственное место внутри слайса, где живут запросы; собирают UI из `components`.
- **Обёртки над сущностью** (типизированные под домен) очень приветствуются. Если обёртка почти всегда ходит в одну и ту же ручку — кладём её сразу в `widgets` и зовём запрос внутри (не прокидываем данные пропсом везде). Пример: `modules/city/widgets/CitySingleSelect` использует `getCities` сам.
- **`pages`** собирают экран из `widgets` + `components` сущностей (+ изредка просто shared-компоненты).

### Анатомия компонента

```
ComponentName/
  ComponentName.tsx
  ComponentName.module.scss
  index.ts
  types.ts
  utils.ts
  hooks.ts
```

Много подкомпонентов → внутри своя папка `components/`. **Файлы держим читаемыми, не пишем гигантские компоненты.**

### Композиция страниц

Собираем страницы из слотов `Layout` (`shared/ui/Layout`). **`pages` — чисто композиционный слой: своего `.module.scss` там почти не бывает.** Вся структура (паддинги, шапка, тело, декоративные shapes) живёт в `Layout`; контент — виджеты/общие компоненты.

```tsx
<Layout.Root shapeVariant={1}>
  <Layout.Header spacing={14}>
    <UserHeaderWidget />
  </Layout.Header>
  <Layout.Body>
    <UserListWidget />
  </Layout.Body>
</Layout.Root>
```

- `Layout.Header variant` — `hero` (акцентный блок) | `bar` (плоский топбар).
- `Layout.Root shapeVariant` (+ цвет) — декоративные зелёные **shapes** сверху (единственный `absolute`); формы/цвет меняются по экранам.
- **Почти вся верстка — в общих компонентах** (`shared/ui`): бейджи/лейблы — `Pill`, чипы-иконки — `IconBadge` и т.п. Новый визуальный кусок → сначала общий компонент, и лишь очень редко на уровень выше.

## Слой данных (`shared` + слайсовые `api/`)

**react-query** + собственные фабрики `createQuery` / `createMutation` (живут в `shared`).

Дженерики: `<Input, Output, MappedOutput>`.

- `Output` — сырой ответ бэкенда (строковые даты остаются строками).
- `MappedOutput` — **клиентский тип**, с которым работает весь код (даты приведены к `Date`).
- `transform: (output: Output) => MappedOutput` — маппер, изолирует UI от типов бэкенда.

Фабрика принимает `{ url, method, transform }` и **возвращает объект** (не сразу хук):

```ts
const getUser = createQuery<UserInput, UserDto, User>({
  url: '/user',
  method: 'GET',
  transform: mapUser, // UserDto -> User (string dates -> Date)
})
// → { useQuery, useInvalidate }

const updateUser = createMutation<UpdateInput, UserDto, User>({
  url,
  method,
  transform,
})
// → { useMutation }
```

Бэкенд меняем — меняем только `Output`/маппер, клиентские типы и UI стабильны.

### Моки (`mocked: true`)

Проп `mocked` на фабрике. Когда включён — `queryFn`/`mutationFn` не делают реальный `fetch`, а резолвят данные из **реестра моков по ключу `${method} ${url}`** (`shared/api/mock`) + имитируют задержку. Моки слайса лежат в `modules/<entity>/api/mocks.ts` и регистрируются на импорт (`registerMock(method, url, handler)`). Пайплайн `Output → transform → MappedOutput` одинаков для мока и реального бэка.

### Ручки (этап 1)

`GET/PATCH /me` · `POST /check-in` · `GET /check-in/today` · `GET /check-in/report` · `GET /metrics/daily` · `GET /check-in/access` · `POST /salary/fork` · `POST /salary/cities` (PRO) · `GET /salary/quota` · `GET /cities` · `GET /horoscope` · `POST /compatibility` · `POST /intent`. Платные («Важный разговор», недельный отчёт) — заглушки позже. Знак зодиака — клиентский утил `getZodiac(date)`, не ручка.

## Провайдеры платформы (`shared`/`app`)

- **auth** — `AuthAdapter` интерфейс; реализации: telegram (initData), mock (локальная разработка), web (позже).
- **storage** — KV за единым интерфейсом (TG CloudStorage / localStorage).
- **persist** (`shared/libs/persist`) — фабрики хуков состояния c zod-валидацией: `createLocalStorageHook`, `createUrlStorageHook`, `createSyncHook` (мёрджит url + localStorage). Избегают prop-drilling. Зависит от `useValueRef` из `~/hooks`.

## Монетизация (заглушка)

Реальной оплаты нет. PRO-действие → модалка «Скоро будет готово, ты первый узнаешь». Клики «Попробовать/Оплатить» шлём через `trackIntent()` (сейчас мок) — это основная метрика этапа.

## Зафиксированный стек

SCSS (+ CSS vars для дизайн-системы, без Tailwind) · react-query · React Router · React 19 + TS + Vite. Подробности код-стайла — [conventions.md](conventions.md).

# Конвенции кода

## Стили

- **SCSS** (`.module.scss`). Дизайн-система — через **CSS-переменные** (см. [design-system.md](design-system.md)). **Tailwind не используем.**

## ui-kit (`shared`)

- Компоненты ui-kit **не принимают `className`**; `style` — по минимуму (разве что в самых базовых — текст, стеки).
- Всё кастомизируется **пропсами-токенами сверху**: `theme`, `size`, `variant` и т.п. (маппятся на классы/data-атрибуты внутри).
- Базовые примитивы: **`HStack`**, **`VStack`**.

## Данные

- **react-query** + фабрики `createQuery`/`createMutation` (см. [architecture.md](architecture.md)). В коде работаем только с клиентскими типами (`MappedOutput`).

## Импорты

- Алиас `~` → `src`. Порядок импортов — `import/order` (builtin → external → internal → parent → sibling → index; `*.scss` в конце).

## Форматирование и линт

- **Prettier** — форматирование: без `;`, одинарные кавычки, `jsxSingleQuote`. Конфиг `.prettierrc`, игнор `.prettierignore` (не трогаем `docs/design`). Запуск: `yarn format` / `yarn format:check`.
- **oxlint** — линтер (Rust, быстрый). Конфиг `.oxlintrc.json`, плагины `react`/`react-hooks`/`import`/`typescript`. Запуск: `yarn lint`. ESLint не используем: его плагины (`react`, `import`) пока несовместимы с ESLint 10.

## Окружение

- **Node 24** (`.nvmrc` → `24.12.0`). Перед командами — `nvm use`.
- **Менеджер пакетов — yarn** (classic). Установка точных версий: `yarn add --exact`.

## Зависимости

- **Спрашивать перед добавлением любой либы.**
- **Точные версии без `^`** (pinned), самые актуальные. Держим `package.json` чистым.
- **Стили:** `sass-embedded` (быстрее обычного `sass`).
- **Vite-плагины:** `@vitejs/plugin-react`, `vite-plugin-svgr` (svg → React-компонент), `vite-plugin-mkcert` (https на локалке — нужно для TG Mini App), `vite-plugin-html` (инжект `title`/`PRODUCTION` в `index.html`).
- **Данные/состояние:** `@tanstack/react-query`, `@tanstack/react-virtual` (виртуализация списков), `nuqs` (url-стейт, нужен `persist`), `zod` (валидация в `persist`), `react-router-dom`.
- **UI-утилиты:** `lucide-react` (иконки), `classnames` (склейка классов — `import cn from 'classnames'`), `@ncdai/react-wheel-picker` (барабан TimePicker).
- **Оверлеи:** `react-modal-sheet` (bottom sheet, драг) + пир `motion`. Лист — через `BottomSheet.Root/Header/Body`; для модалок с глобальным управлением — фабрика `createBottomSheetModalWrapper` (`useController`/`useBottomSheetData`).
- **Дата/телефон:** `react-day-picker` (+ `date-fns` транзитивно, ru-локаль), `react-international-phone`.

## Производительность

- Избегаем лишних ререндеров; мемоизация **по необходимости**, не оборачивать примитивы / дешёвые операции без причины.
- **`useValueRef`** — реф, в `current` которого всегда актуальное значение (обновляется в `useEffect`). Удобен в `useCallback`, чтобы не пересоздавать колбэк на каждый рендер.

## Язык

- UI и копирайт — **русский**, tone of voice по [product.md](product.md).

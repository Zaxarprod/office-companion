# Дизайн-система · Style 3 (Olive)

> **Источник правды — код**: `src/shared/styles/` (токены) и `src/shared/ui/` (компоненты).
> Этот документ описывает реально реализованную дизайн-систему. Если документ и код
> расходятся — прав код, документ нужно поправить.
>
> Все компоненты импортируются из барреля `~/shared/ui` (исключение — `BaseInput`,
> он берётся напрямую из `~/shared/ui/BaseInput` и служит основой для текстовых полей).
>
> Акцент — оливковый, фон — тёплый кремовый. HTML-макеты экранов в `docs/design/`
> остаются пиксельным референсом для ещё не собранных экранов, но **не** являются
> источником правды по UI.

## Принципы вёрстки

- **Минимум SCSS.** Почти вся вёрстка живёт в общих компонентах. На уровне `pages`
  scss практически не бывает — страница это композиция.
- **Текст — только через `Text`** (никаких голых `<span>`/`<p>` с ручными стилями).
- **Раскладка — через `HStack` / `VStack` / `Grid`**, отступы — через `gap`.
- **Никакого `position: absolute`**, кроме декоративных форм `Shapes` (зелёные пятна сверху).
- **Лейблы — это `Pill`, чипы-иконки — `IconBadge`.** Не верстаем их заново.
- **Слои:** `components` (без хуков) → `widgets` (с хуками). Компоненты дизайн-системы
  в `shared/ui` — это переиспользуемые примитивы без бизнес-логики.

## Токены

Значения объявлены как runtime CSS-переменные в `src/shared/styles/theme.scss`.
Типы для пропсов — в `src/shared/styles/tokens.ts` (`ColorToken`, `RadiusToken`,
`TypographyVariant`) + хелперы `colorVar(token)` → `var(--token)`, `radiusVar(token)` → `var(--r-token)`.

### Шрифты

```css
--font-sans: 'Inter', system-ui, sans-serif; /* основной текст */
--font-mono: 'JetBrains Mono', ui-monospace, monospace; /* лейблы, числа, метки */
```

### Цвета

```css
/* Поверхности */
--bg: #faf6ec; /* фон приложения */
--card: #fffdf8; /* карточки */
--card-border: rgba(42, 32, 23, 0.06); /* тонкий бордер / разделители */

/* Текст */
--ink: #2a2017; /* основной */
--ink-soft: #6a5d4d; /* вторичный */
--ink-faint: #b0a496; /* бледный / плейсхолдеры */

/* Акцент — оливковый */
--accent: #5a6b35;
--accent-fg: #fffaf0; /* текст/иконки на акценте */
--accent-bg: rgba(90, 107, 53, 0.12); /* подложка акцента */
--accent-shadow: 0 16px 30px -12px rgba(90, 107, 53, 0.5);
--nav-on: #e2e4c6; /* активный таб навигации */

/* Семантические (каждый — цвет + `-bg` подложка) */
--gold: #a8842c;   --gold-bg: rgba(168, 132, 44, 0.16);  /* астро / PRO */
--ochre: #8a7642;  --ochre-bg: rgba(138, 118, 66, 0.16); /* нейтрально / «терпимо» */
--coral: #b15a35;  --coral-bg: rgba(177, 90, 53, 0.14);  /* «вы тут» / минус */
--sage: #5a6b35;   --sage-bg: rgba(90, 107, 53, 0.16);   /* «хорошо» / плюс */
--danger: #b8331f; --danger-bg: rgba(184, 51, 31, 0.14); /* тревога / риск */

/* Тинты метрик */
--moon: #6a5d4d;  --moon-bg: #ece2cb;  /* сон */
--heart: #5a6b35; --heart-bg: #e2e4c6; /* состояние */
```

Тип `ColorToken` (значения для пропсов `color` / `tone`): `bg`, `card`, `ink`,
`ink-soft`, `ink-faint`, `accent`, `accent-fg`, `gold`, `ochre`, `coral`, `sage`,
`danger`, `moon`, `heart`. Подложки (`*-bg`, `--accent-bg`, `--nav-on`, `--card-border`)
используются внутри компонентов и в пропсах не фигурируют.

### Радиусы

```css
--r-sm: 11px;
--r-md: 14px;
--r-lg: 18px;
--r-xl: 22px;
--r-pill: 999px;
```

Тип `RadiusToken`: `sm` | `md` | `lg` | `xl` | `pill`.

### Тени

```css
--sh-card: 0 10px 24px -16px rgba(42, 32, 23, 0.4); /* обычная карточка */
--sh-float: 0 14px 30px -16px rgba(42, 32, 23, 0.5); /* приподнятый блок */
--sh-accent: var(--accent-shadow); /* свечение под акцентом */
```

### Типографика

Шкала — в `src/shared/styles/_typography.scss`, применяется через компонент `Text`
(`variant`). Тип `TypographyVariant`.

| variant   | семья | размер  | вес | letter-spacing | line-height | transform | назначение                       |
| --------- | ----- | ------- | --- | -------------- | ----------- | --------- | -------------------------------- |
| `display` | sans  | 25px    | 800 | −0.025em       | 1.08        | —         | крупные заголовки экранов        |
| `heading` | sans  | 18px    | 800 | −0.02em        | 1.2         | —         | заголовки блоков / листов        |
| `subhead` | sans  | 14px    | 700 | −0.01em        | 1.2         | —         | заголовки секций / карточек      |
| `body`    | sans  | 14px    | 600 | 0              | 1.45        | —         | основной текст                   |
| `caption` | sans  | 12.5px  | 500 | 0              | 1.4         | —         | подписи / вторичный текст        |
| `small`   | sans  | 10.5px  | 500 | 0              | 1.3         | —         | мелкие подписи                   |
| `label`   | mono  | 9.5px   | 600 | 0.1em          | 1.2         | uppercase | лейблы / метки                   |
| `micro`   | mono  | 8.5px   | 600 | 0.04em         | 1.2         | uppercase | самые мелкие метки               |
| `numeric` | mono  | 18px    | 700 | −0.02em        | 1.1         | —         | числа / деньги                   |

---

## Компоненты

### Примитивы и раскладка

#### `Text`

Любой текст в приложении. Цвет и размер — токенами, не инлайном.

| prop       | тип                 | по умолчанию | описание                                   |
| ---------- | ------------------- | ------------ | ------------------------------------------ |
| `variant`  | `TypographyVariant` | `body`       | стиль из шкалы                             |
| `color`    | `ColorToken`        | `ink`        | цвет                                       |
| `align`    | `left\|center\|right` | —          | выравнивание                               |
| `as`       | `ElementType`       | `span`       | семантический тег (`p`, `h1`, …)           |
| `truncate` | `boolean`           | —            | обрезка одной строки с многоточием         |

#### `HStack` / `VStack`

Флекс-раскладка по горизонтали / вертикали. `HStack` по умолчанию `align='center'`.
Всегда `min-width: 0` (безопасный truncate внутри).

| prop      | тип                                          | описание                  |
| --------- | -------------------------------------------- | ------------------------- |
| `gap`     | `number`                                     | зазор между детьми, px    |
| `align`   | `start\|center\|end\|stretch\|baseline`      | `align-items`             |
| `justify` | `start\|center\|end\|between\|around`        | `justify-content`         |
| `wrap`    | `boolean`                                    | перенос                   |
| `grow`    | `number`                                     | `flex-grow` контейнера    |
| `inline`  | `boolean`                                    | `inline-flex`             |

#### `Grid`

Равные колонки.

| prop      | тип      | по умолчанию | описание           |
| --------- | -------- | ------------ | ------------------ |
| `columns` | `number` | `2`          | число колонок      |
| `gap`     | `number` | `12`         | зазор, px          |

#### `Divider`

Линия-разделитель цвета `--card-border`.

| prop          | тип                       | по умолчанию | описание            |
| ------------- | ------------------------- | ------------ | ------------------- |
| `orientation` | `horizontal\|vertical`    | `horizontal` | ориентация          |

#### `Icon`

Иконка из `lucide-react` (реестр в `Icon/registry.ts`).

| prop          | тип          | по умолчанию   | описание                         |
| ------------- | ------------ | -------------- | -------------------------------- |
| `name`        | `IconName`   | —              | имя из реестра                   |
| `size`        | `number`     | `20`           | сторона, px                      |
| `color`       | `ColorToken` | `currentColor` | цвет                             |
| `strokeWidth` | `number`     | `2`            | толщина обводки                  |

#### `IconBadge`

Иконка в цветном квадрате/круге (чип-иконка для метрик, плиток, списков).

| prop       | тип                                                                      | по умолчанию | описание                          |
| ---------- | ------------------------------------------------------------------------ | ------------ | --------------------------------- |
| `icon`     | `IconName`                                                               | —            | иконка                            |
| `tone`     | `accent\|gold\|ochre\|coral\|sage\|danger\|heart\|moon\|onAccent`        | `accent`     | тинт (фон `--tone-bg`, цвет `--tone`); `onAccent` — на акцентном фоне |
| `size`     | `number`                                                                 | `40`         | сторона, px                       |
| `shape`    | `square\|circle`                                                         | `square`     | форма                             |
| `radius`   | `number`                                                                 | `12`         | радиус для `square`               |
| `iconSize` | `number`                                                                 | `~size*0.5`  | размер иконки                     |

### Поверхности

#### `Card`

Базовая карточка.

| prop       | тип                  | по умолчанию | описание                                   |
| ---------- | -------------------- | ------------ | ------------------------------------------ |
| `padding`  | `number`             | `14`         | внутренний отступ, px                      |
| `paddingX` | `number`             | —            | переопределяет отступ по оси X             |
| `paddingY` | `number`             | —            | переопределяет отступ по оси Y             |
| `radius`   | `RadiusToken`        | `lg`         | радиус                                     |
| `shadow`   | `card\|float\|none`  | `card`       | тень                                       |
| `bordered` | `boolean`            | —            | тонкий бордер                              |
| `selected` | `boolean`            | —            | выделение: акцентный бордер + кольцо        |
| `onClick`  | `() => void`         | —            | делает карточку интерактивной              |

#### `InteractiveCard`

Кликабельная плитка-инструмент: `IconBadge` + заголовок + подпись (+ опц. бейдж `Pill`).
Собрана из `IconBadge` / `Pill` / `Text` / `Stack`.

| prop         | тип                                          | по умолчанию | описание                          |
| ------------ | -------------------------------------------- | ------------ | --------------------------------- |
| `icon`       | `IconName`                                   | —            | иконка                            |
| `title`      | `string`                                     | —            | заголовок                         |
| `subtitle`   | `string`                                     | —            | подпись снизу                     |
| `tint`       | `accent\|gold\|ochre\|coral\|sage\|danger`   | `accent`     | тинт иконки                       |
| `extraLabel` | `string`                                     | —            | бейдж в углу (напр. «PRO») → `Pill tone='gold'` |
| `onClick`    | `() => void`                                 | —            | обработчик                        |

#### `Section`

Заголовок секции + контент. Рендерит `VStack[ Text variant='subhead', children ]`.

| prop    | тип      | по умолчанию | описание                       |
| ------- | -------- | ------------ | ------------------------------ |
| `title` | `string` | —            | заголовок секции               |
| `gap`   | `number` | `11`         | зазор между заголовком и телом |

#### `ListRow`

Строка списка: иконка-бейдж + ключ/значение + шеврон. Главное применение — кастомный
триггер (`renderTrigger`) для пикеров, напр. строки профиля.

| prop          | тип             | по умолчанию | описание                          |
| ------------- | --------------- | ------------ | --------------------------------- |
| `icon`        | `IconName`      | —            | иконка                            |
| `iconTone`    | `IconBadgeTone` | `accent`     | тинт иконки                       |
| `label`       | `string`        | —            | мелкий ключ сверху                |
| `value`       | `string`        | —            | значение                          |
| `placeholder` | `string`        | —            | бледный текст, если значения нет  |
| `chevron`     | `boolean`       | `true`       | шеврон справа                     |
| `onClick`     | `() => void`    | —            | обработчик                        |

#### `Layout` (compound)

Каркас экрана. Слоты — `Layout.Root` / `Layout.Header` / `Layout.Body` / `Layout.Footer`.
Убирает scss с уровня страниц.

- **`Layout.Root`** — обёртка экрана.

  | prop           | тип                       | описание                                                       |
  | -------------- | ------------------------- | -------------------------------------------------------------- |
  | `shapeVariant` | `1\|2\|3`                 | декоративные зелёные формы сверху (единственный `absolute`)    |
  | `shapeColor`   | `accent\|sage\|gold\|coral` | цвет форм (напр. другой цвет на экране успеха чек-ина)        |
  | `standalone`   | `boolean`                 | самостоятельный мобильный шелл-столбец (для экранов вне `TabsLayout`, напр. подписка) |

- **`Layout.Header`** — шапка. Оборачивает детей в `VStack gap={spacing}`.

  | prop      | тип          | по умолчанию | описание                                  |
  | --------- | ------------ | ------------ | ----------------------------------------- |
  | `variant` | `hero\|bar`  | `hero`       | `hero` — акцентный блок; `bar` — плоский топбар |
  | `spacing` | `number`     | `14`         | зазор между блоками шапки                  |

- **`Layout.Body`** — тело со скроллом; `VStack gap={spacing}`.

  | prop      | тип      | по умолчанию | описание              |
  | --------- | -------- | ------------ | --------------------- |
  | `spacing` | `number` | `16`         | зазор между блоками    |

- **`Layout.Footer`** — нижний блок (CTA и т.п.); `VStack gap={spacing}`.

  | prop      | тип      | по умолчанию | описание              |
  | --------- | -------- | ------------ | --------------------- |
  | `spacing` | `number` | `10`         | зазор между блоками    |

> **Shapes** — декоративные оливковые формы сверху экрана. Единственное место с
> `position: absolute`. Включаются через `shapeVariant` у `Layout.Root`, цвет — `shapeColor`.

### Действия и статусы

#### `Button`

| prop        | тип                       | по умолчанию | описание                       |
| ----------- | ------------------------- | ------------ | ------------------------------ |
| `variant`   | `primary\|ghost\|light`   | `primary`    | вид                            |
| `size`      | `md\|lg`                  | `lg`         | размер                         |
| `fullWidth` | `boolean`                 | `true`       | на всю ширину                  |
| `iconLeft`  | `IconName`                | —            | иконка слева                   |
| `iconRight` | `IconName`                | —            | иконка справа                  |
| `type`      | `button\|submit\|reset`   | `button`     | тип кнопки                     |
| `disabled`  | `boolean`                 | —            | заблокирована                  |
| `onClick`   | `() => void`              | —            | обработчик                     |

#### `IconButton`

Круглая/квадратная кнопка-иконка. `label` обязателен (aria).

| prop       | тип                          | по умолчанию | описание                  |
| ---------- | ---------------------------- | ------------ | ------------------------- |
| `icon`     | `IconName`                   | —            | иконка                    |
| `label`    | `string`                     | —            | доступная подпись (aria)  |
| `size`     | `number`                     | `38`         | сторона, px               |
| `variant`  | `surface\|ghost\|onAccent`   | `surface`    | вид                       |
| `shape`    | `circle\|square`             | `circle`     | форма                     |
| `color`    | `ColorToken`                 | —            | цвет иконки               |
| `disabled` | `boolean`                    | —            | заблокирована             |
| `onClick`  | `() => void`                 | —            | обработчик                |

#### `Pill`

Лейбл-статус (напр. «−38%», «PRO», «риск ↑»).

| prop        | тип                                                       | по умолчанию | описание         |
| ----------- | --------------------------------------------------------- | ------------ | ---------------- |
| `tone`      | `accent\|sage\|gold\|ochre\|coral\|danger\|primary`       | `sage`       | тон              |
| `iconLeft`  | `IconName`                                                | —            | иконка слева     |
| `iconRight` | `IconName`                                                | —            | иконка справа    |

#### `EditableText`

Текст с инлайн-правкой: рядом кнопка-карандаш → инпут + кнопка-галочка (сабмит).
Пустое значение игнорируется (откат к последнему валидному). Применяется для имени в профиле.

| prop            | тип                       | по умолчанию | описание                              |
| --------------- | ------------------------- | ------------ | ------------------------------------- |
| `value`         | `string`                  | —            | текущее значение                      |
| `onSubmit`      | `(value: string) => void` | —            | сабмит нового значения                |
| `variant`       | `TypographyVariant`       | `heading`    | стиль текста                          |
| `color`         | `ColorToken`              | `ink`        | цвет текста                           |
| `buttonVariant` | `IconButtonVariant`       | `surface`    | вид кнопок-иконок (на акценте — `onAccent`) |

### Управляющие элементы

#### `Chips` / `Segment` (generic)

Однозначный выбор из набора. `Chips` — отдельные «таблетки» (напр. грейд),
`Segment` — слитный сегмент-контрол. У обоих один интерфейс:

| prop       | тип                         | описание                       |
| ---------- | --------------------------- | ------------------------------ |
| `options`  | `{ value, label }[]`        | варианты                       |
| `value`    | `T` (`string \| number`)    | выбранное значение             |
| `onChange` | `(value: T) => void`        | обработчик выбора              |

### Поля ввода

Все текстовые поля обёрнуты в `Field` (лейбл / «необязательно» / ошибка) и используют
общий шелл `BaseInput`.

#### `Field`

Обёртка-строка формы.

| prop       | тип       | описание                            |
| ---------- | --------- | ----------------------------------- |
| `label`    | `string`  | лейбл                               |
| `optional` | `boolean` | пометка «необязательно» рядом       |
| `error`    | `string`  | текст ошибки под полем              |

#### `BaseInput`

Базовый шелл инпута (импорт из `~/shared/ui/BaseInput`). Расширяет `Field` и набор
нативных пропсов (`value`, `onChange`, `onFocus`, `onBlur`, `placeholder`, `type`,
`inputMode`, `disabled`, `name`, `autoComplete`, `maxLength`).

| prop       | тип                  | описание                              |
| ---------- | -------------------- | ------------------------------------- |
| `pre`      | `ReactNode`          | контент слева внутри поля (флаг/символ) |
| `post`     | `ReactNode`          | контент справа (иконка/единица)       |
| `inputRef` | `Ref<HTMLInputElement>` | ссылка на `<input>`                |

#### `TextInput`

| prop        | тип                      | описание                          |
| ----------- | ------------------------ | --------------------------------- |
| `value`     | `string`                 | значение                          |
| `onChange`  | `(value: string) => void`| обработчик                        |
| `iconRight` | `IconName`               | иконка справа (напр. шеврон)       |
| `label` / `optional` / `error` / `placeholder` / `disabled` | — | как в `Field` / нативно |

#### `NumberInput`

Целое число с группировкой `ru-RU`; нецифры отбрасываются.

| prop       | тип                              | описание                       |
| ---------- | -------------------------------- | ------------------------------ |
| `value`    | `number \| null`                 | значение                       |
| `onChange` | `(value: number \| null) => void`| обработчик                     |
| `suffix`   | `ReactNode`                      | единица справа (напр. «₽»)      |
| `max`      | `number`                         | верхняя граница                |
| `label` / `optional` / `error` / `placeholder` / `disabled` | — | стандартные |

#### `PhoneInput`

Телефон в формате E.164 (`react-international-phone`, страна по умолчанию `ru`, флаг слева).

| prop       | тип                       | описание                  |
| ---------- | ------------------------- | ------------------------- |
| `value`    | `string`                  | телефон E.164             |
| `onChange` | `(phone: string) => void` | обработчик                |
| `label` / `optional` / `error` / `placeholder` / `disabled` | — | стандартные |

#### `SearchInput`

Поле поиска с иконкой слева.

| prop          | тип                       | по умолчанию | описание         |
| ------------- | ------------------------- | ------------ | ---------------- |
| `value`       | `string`                  | —            | значение         |
| `onChange`    | `(value: string) => void` | —            | обработчик       |
| `placeholder` | `string`                  | `Поиск`      | плейсхолдер      |
| `autoFocus`   | `boolean`                 | —            | автофокус        |

#### `SingleSelect` (generic)

Выбор одного значения из списка в bottom-sheet. Список виртуализирован
(`@tanstack/react-virtual`), есть поиск, автоскролл к выбранному.

| prop                | тип                       | по умолчанию | описание                       |
| ------------------- | ------------------------- | ------------ | ------------------------------ |
| `value`             | `T \| null`               | —            | выбранное значение             |
| `onChange`          | `(value: T) => void`      | —            | обработчик                     |
| `options`           | `{ value, label }[]`      | —            | варианты                       |
| `placeholder`       | `string`                  | `Выбери`     | текст в триггере               |
| `title`             | `string`                  | `Выбор`      | заголовок листа                |
| `searchable`        | `boolean`                 | `true`       | поиск в листе                  |
| `searchPlaceholder` | `string`                  | `Поиск`      | плейсхолдер поиска             |
| `label` / `optional` / `error` | —              | —            | как в `Field`                  |

> `SingleSelect`, `DateInput` и `TimePicker` принимают `renderTrigger(args) => ReactNode` —
> кастомный триггер вместо стандартного поля (args передают выбранное значение, `open`, `onOpen`).
> Так пикеры используются как строки списков — например, в профиле (см. `ListRow`).

> `SingleSelect` принимает `other` — добавляет опцию «Другое» с инлайн-вводом
> произвольного значения (поле + кнопка подтверждения). Поля: `onOtherFieldChange(value)`,
> `otherInitialValue?`, `optionLabel?`, `placeholder?`. Произвольное значение показывается
> в триггере через `valueLabel`. На этом построены модульные `GradeSelect` / `ProfessionSelect`.

#### `CountrySelect`

Выбор страны (пока только СНГ) поверх `SingleSelect`; `value` — название страны.

| prop            | тип                      | по умолчанию    | описание                                            |
| --------------- | ------------------------ | --------------- | --------------------------------------------------- |
| `value`         | `string \| null`         | —               | название страны                                     |
| `onChange`      | `(name: string) => void` | —               | обработчик                                           |
| `placeholder`   | `string`                 | `Выбери страну` | плейсхолдер                                          |
| `renderTrigger` | `(args) => ReactNode`    | —               | кастомный триггер; args: `{ selected: Country, open, onOpen }` |
| `label` / `optional` / `error` | —         | —               | как в `Field`                                       |

#### `DateInput`

Дата (день/месяц/год в триггере) → календарь `react-day-picker` в bottom-sheet
(локаль `ru`, выпадающий выбор месяца/года, диапазон 1940 — сегодня).

| prop       | тип                          | описание           |
| ---------- | ---------------------------- | ------------------ |
| `value`    | `Date \| null`               | значение           |
| `onChange` | `(date: Date \| null) => void` | обработчик        |
| `label` / `optional` / `error` | —          | как в `Field`      |

#### `TimePicker`

Время через колёса (`@ncdai/react-wheel-picker`) в bottom-sheet; черновик
подтверждается кнопкой «Готово». `TimeValue = { hours, minutes }`.

| prop         | тип                         | по умолчанию    | описание                |
| ------------ | --------------------------- | --------------- | ----------------------- |
| `value`      | `TimeValue \| null`         | —               | значение                |
| `onChange`   | `(value: TimeValue) => void`| —               | обработчик              |
| `placeholder`| `string`                    | `Выбери время`  | текст в триггере         |
| `title`      | `string`                    | `Время`         | заголовок листа          |
| `minuteStep` | `number`                    | `5`             | шаг минут                |
| `hourFormat` | `12 \| 24`                  | `24`            | формат часов             |
| `label` / `optional` / `error` | —          | —               | как в `Field`           |

### Оверлеи

#### `BottomSheet` (compound)

Шторка снизу на `react-modal-sheet` + `motion`. Слоты `BottomSheet.Root` /
`BottomSheet.Header` / `BottomSheet.Body`.

- **`BottomSheet.Root`**

  | prop            | тип                          | по умолчанию | описание                                   |
  | --------------- | ---------------------------- | ------------ | ------------------------------------------ |
  | `open`          | `boolean`                    | —            | контролируемое состояние (без фабрики)     |
  | `onClose`       | `() => void`                 | —            | закрытие                                   |
  | `detent`        | `default\|content\|full`     | `content`    | высота листа                               |
  | `disableDrag`   | `boolean`                    | —            | отключить drag-to-dismiss                  |
  | `avoidKeyboard` | `boolean`                    | вкл.         | подъём при фокусе инпута (для списков с поиском лучше выключать) |

- **`BottomSheet.Header`** — `title?`, `closeButton?`.
- **`BottomSheet.Body`** — `children`, `scrollRef?` (для виртуализации), `disableDrag?`.

#### `createBottomSheetModalWrapper<TData>(Content)`

Фабрика глобальной модалки. Возвращает `{ Component, useController, useBottomSheetData }`.
Стор живёт на уровне модуля, поэтому `open(data)` / `close()` работают из любого места
дерева, а `Component` монтируется один раз (напр. в `TabsLayout`). Если `TData = void` —
`open()` без аргументов. Так сделан, например, `UpsellSheet` / `useUpsell`.

### Данные и графика

#### `Donut`

Кольцевой прогресс (SVG).

| prop          | тип                          | по умолчанию | описание                       |
| ------------- | ---------------------------- | ------------ | ------------------------------ |
| `value`       | `number` (0..1)              | —            | доля заполнения                |
| `color`       | `ColorToken`                 | `accent`     | цвет дуги                      |
| `caption`     | `string`                     | —            | подпись под кольцом            |
| `size`        | `number`                     | `74`         | диаметр, px                    |
| `formatValue` | `(value: number) => string`  | проценты     | формат центрального значения   |

#### `DistributionChart`

Гистограмма-распределение. `DistributionBar = { value, tone?, label?, arrow? }`,
нормируется к максимуму; `tone` красит столбец, `arrow` — указатель «ты здесь».

| prop     | тип                  | по умолчанию | описание                 |
| -------- | -------------------- | ------------ | ------------------------ |
| `data`   | `DistributionBar[]`  | —            | столбцы                  |
| `height` | `number`             | `60`         | высота области, px       |
| `gap`    | `number`             | `3`          | зазор между столбцами     |

#### `ScaleResult`

Шкала-результат: градиентный трек с маркером.

| prop         | тип                                  | по умолчанию              | описание                       |
| ------------ | ------------------------------------ | ------------------------- | ------------------------------ |
| `value`      | `number`                             | —                         | значение                       |
| `min` / `max`| `number`                             | `0` / `1`                 | диапазон                       |
| `leftLabel`  | `string`                             | —                         | подпись слева                  |
| `rightLabel` | `string`                             | —                         | подпись справа                 |
| `colors`     | `[ColorToken, ColorToken, ColorToken]` | `danger → ochre → sage` | цвета градиента                |

### Навигация

#### `Nav` (generic)

Нижняя навигация. Скользящий индикатор (CSS-transition по `left`), «поп» иконки при
активации (`motion`). `NavItem = { value, label, icon }`.

| prop       | тип                      | описание           |
| ---------- | ------------------------ | ------------------ |
| `items`    | `NavItem<T>[]`           | табы               |
| `value`    | `T` (`string \| number`) | активный таб       |
| `onChange` | `(value: T) => void`     | обработчик         |

### Деньги

#### `MoneyText` (+ `SystemCurrencyProvider`)

Форматирует сумму через `Intl.NumberFormat('ru-RU', { style: 'currency' })`, без копеек.

| prop       | тип                 | по умолчанию          | описание                          |
| ---------- | ------------------- | --------------------- | --------------------------------- |
| `amount`   | `number`            | —                     | сумма                             |
| `currency` | `CurrencyCode`      | из провайдера / `RUB` | валюта                            |
| `color`    | `ColorToken`        | `ink`                 | цвет                              |
| `variant`  | `TypographyVariant` | `numeric`             | стиль текста                      |

- `SystemCurrencyProvider({ currency, children })` — задаёт системную валюту.
- `useSystemCurrency()` — текущая валюта; `DEFAULT_CURRENCY = 'RUB'`.
- `CurrencyCode`: `RUB` | `USD` | `EUR` | `KZT` | `BYN`.

---

## Иконки

Иконки — `lucide-react` через реестр `kebab-name → компонент` (`Icon/registry.ts`),
расширяется по мере надобности (именованные импорты tree-shake'атся). Сейчас доступны:

`arrow-left`, `arrow-up-right`, `bell`, `briefcase`, `calendar`, `calendar-check`,
`check`, `chevron-down`, `chevron-left`, `chevron-right`, `clock`, `crown`,
`dollar-sign`, `flame`, `heart`, `home`, `layout-grid`, `lock`, `message-circle`,
`message-square`, `moon`, `search`, `settings`, `smile`, `sofa`, `sparkles`, `star`,
`trending-up`, `user`, `users`, `x`, `zap`.

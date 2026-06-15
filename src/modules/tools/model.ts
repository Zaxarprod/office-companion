import type { IconName, InteractiveCardTint } from '~/shared/ui'

export interface Tool {
  id: string
  icon: IconName
  tint: InteractiveCardTint
  title: string
  subtitle: string
  /** Показывать на главной. */
  home?: boolean
  /** PRO-фича: открывает апселл (feature = title, icon = icon, описание отсюда). */
  pro?: { description: string }
  /** Роут free-инструмента (открывается по тапу, если нет pro). */
  route?: string
}

export const TOOLS: Tool[] = [
  {
    id: 'salary',
    icon: 'dollar-sign',
    tint: 'accent',
    title: 'Сколько недоплачивают',
    subtitle: 'вилка по рынку',
    home: true,
    route: '/salary',
  },
  {
    id: 'horoscope',
    icon: 'sparkles',
    tint: 'gold',
    title: 'Офисный гороскоп',
    subtitle: 'расклад на день',
    home: true,
    route: '/horoscope',
  },
  {
    id: 'compatibility',
    icon: 'users',
    tint: 'ochre',
    title: 'Совместимость',
    subtitle: 'с боссом по знакам',
    home: true,
    route: '/compatibility',
  },
  {
    id: 'talk',
    icon: 'message-square',
    tint: 'coral',
    title: 'Важный разговор',
    subtitle: 'подготовить с ИИ',
    home: true,
    pro: {
      description:
        'ИИ помогает подготовиться к разговору с боссом — про повышение, нагрузку или увольнение.',
    },
  },
  {
    id: 'jobs',
    icon: 'briefcase',
    tint: 'sage',
    title: 'Автопоиск вакансий',
    subtitle: 'подбор под тебя',
    pro: {
      description:
        'Каждую неделю подбираем вакансии под твой грейд и зарплатные ожидания — без ручного поиска.',
    },
  },
  {
    id: 'report',
    icon: 'trending-up',
    tint: 'gold',
    title: 'Недельный отчёт',
    subtitle: 'состояние + рынок',
    pro: {
      description: 'Раз в неделю — сводка по выгоранию и движению рынка зарплат по твоей роли.',
    },
  },
]

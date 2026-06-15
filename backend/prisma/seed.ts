import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Вопросы сгруппированы по «дням прохождения». Чек-ин циклически отдаёт день за днём.
const QUESTIONS = [
  // День 1 — общее самочувствие
  { key: 'mood', day: 1, order: 1, title: 'Какое настроение сегодня?', helperText: 'настроение', lowText: 'паршиво', highText: 'отлично', image: 'sloth_mood', scaleMax: 5 },
  { key: 'energy', day: 1, order: 2, title: 'Сколько в тебе сегодня сил?', helperText: 'энергия', lowText: 'вымотан', highText: 'в потоке', image: 'sloth_thinking', scaleMax: 5 },
  { key: 'sleep', day: 1, order: 3, title: 'Как тебе спалось?', helperText: 'сон', lowText: 'разбит', highText: 'выспался', image: 'sloth_sleep', scaleMax: 5 },
  { key: 'stress', day: 1, order: 4, title: 'Насколько сегодня напряжно?', helperText: 'стресс', lowText: 'спокойно', highText: 'на пределе', image: 'sloth_stress', scaleMax: 5 },
  { key: 'support', day: 1, order: 5, title: 'Есть на кого опереться?', helperText: 'опора', lowText: 'совсем один', highText: 'есть поддержка', image: 'sloth_support', scaleMax: 5 },
  // День 2 — выгорание
  { key: 'exhaustion', day: 2, order: 1, title: 'Насколько ты выжат после дня?', helperText: 'истощение', lowText: 'полон сил', highText: 'пусто, на нуле', image: 'sloth_burnout', scaleMax: 5 },
  { key: 'cynicism', day: 2, order: 2, title: 'Хотелось делать на отвали?', helperText: 'дистанция', lowText: 'втянут', highText: 'всё равно', image: 'sloth_cynic', scaleMax: 5 },
  { key: 'focus', day: 2, order: 3, title: 'Получалось держать фокус?', helperText: 'фокус', lowText: 'туго, рассеян', highText: 'ясно, собран', image: 'sloth_focus', scaleMax: 5 },
  { key: 'irritability', day: 2, order: 4, title: 'Заводился из-за мелочей?', helperText: 'раздражимость', lowText: 'ровно', highText: 'на взводе', image: 'sloth_irrit', scaleMax: 5 },
  { key: 'load', day: 2, order: 5, title: 'Насколько ты сегодня загружен?', helperText: 'нагрузка', lowText: 'пусто', highText: 'завал', image: 'sloth_load', scaleMax: 10 },
]

// Основные города России: координаты + часовой пояс (для натальной карты).
const CITIES = [
  { name: 'Москва', lat: 55.75, lon: 37.62, tz: 3 },
  { name: 'Санкт-Петербург', lat: 59.94, lon: 30.31, tz: 3 },
  { name: 'Новосибирск', lat: 55.03, lon: 82.92, tz: 7 },
  { name: 'Екатеринбург', lat: 56.84, lon: 60.65, tz: 5 },
  { name: 'Казань', lat: 55.79, lon: 49.12, tz: 3 },
  { name: 'Нижний Новгород', lat: 56.33, lon: 44.0, tz: 3 },
  { name: 'Челябинск', lat: 55.16, lon: 61.4, tz: 5 },
  { name: 'Самара', lat: 53.2, lon: 50.15, tz: 4 },
  { name: 'Омск', lat: 54.99, lon: 73.37, tz: 6 },
  { name: 'Ростов-на-Дону', lat: 47.24, lon: 39.71, tz: 3 },
  { name: 'Уфа', lat: 54.74, lon: 55.97, tz: 5 },
  { name: 'Красноярск', lat: 56.01, lon: 92.85, tz: 7 },
  { name: 'Воронеж', lat: 51.66, lon: 39.2, tz: 3 },
  { name: 'Пермь', lat: 58.01, lon: 56.23, tz: 5 },
  { name: 'Волгоград', lat: 48.72, lon: 44.5, tz: 3 },
  { name: 'Краснодар', lat: 45.04, lon: 38.98, tz: 3 },
  { name: 'Саратов', lat: 51.53, lon: 46.03, tz: 4 },
  { name: 'Тюмень', lat: 57.15, lon: 65.53, tz: 5 },
  { name: 'Ижевск', lat: 56.85, lon: 53.2, tz: 4 },
  { name: 'Барнаул', lat: 53.35, lon: 83.78, tz: 7 },
  { name: 'Иркутск', lat: 52.29, lon: 104.28, tz: 8 },
  { name: 'Хабаровск', lat: 48.48, lon: 135.07, tz: 10 },
  { name: 'Владивосток', lat: 43.12, lon: 131.89, tz: 10 },
  { name: 'Калининград', lat: 54.71, lon: 20.51, tz: 2 },
  { name: 'Сочи', lat: 43.6, lon: 39.73, tz: 3 },
]

async function main() {
  for (const q of QUESTIONS) {
    await prisma.question.upsert({ where: { key: q.key }, update: q, create: q })
  }

  if ((await prisma.city.count()) === 0) {
    await prisma.city.createMany({ data: CITIES })
  }

  await prisma.authIdentity.upsert({
    where: { provider_externalId: { provider: 'web', externalId: 'dev' } },
    update: {},
    create: {
      provider: 'web',
      externalId: 'dev',
      user: {
        create: {
          name: 'Алиса',
          birthday: new Date('1996-09-14'),
          birthTime: '09:25',
          country: 'Россия',
          city: 'Москва',
          profession: 'Frontend-разработчик',
          grade: 'senior',
          experienceYears: 4,
          experienceMonths: 6,
        },
      },
    },
  })

  console.info('seed: готово')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

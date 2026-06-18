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

// Рыночные зарплаты (ручной сид, данные ~2024).
// IT-вилки — по открытым данным Habr Career и hh.ru; не-IT — по Росстату РФ.
// Все числа помечены источником. Не претендуем на точность — это baseline для MVP.
const SALARY_HABR = 'habr-manual-seed'
const SALARY_ROSSTAT = 'rosstat-manual-seed'

interface SalaryEntry {
  roleKey: string
  grade: string
  scope: string
  city?: string
  region?: string
  median: number
  p25: number
  p75: number
  sampleSize: number
  source: string
}

const MARKET_SALARIES: SalaryEntry[] = [
  // ── IT / Москва ──
  // Frontend
  { roleKey: 'frontend', grade: 'intern',  scope: 'city', city: 'Москва', median: 80_000,  p25: 60_000,  p75: 105_000, sampleSize: 120, source: SALARY_HABR },
  { roleKey: 'frontend', grade: 'junior',  scope: 'city', city: 'Москва', median: 155_000, p25: 130_000, p75: 185_000, sampleSize: 380, source: SALARY_HABR },
  { roleKey: 'frontend', grade: 'middle',  scope: 'city', city: 'Москва', median: 270_000, p25: 230_000, p75: 320_000, sampleSize: 520, source: SALARY_HABR },
  { roleKey: 'frontend', grade: 'senior',  scope: 'city', city: 'Москва', median: 390_000, p25: 330_000, p75: 470_000, sampleSize: 410, source: SALARY_HABR },
  { roleKey: 'frontend', grade: 'lead',    scope: 'city', city: 'Москва', median: 510_000, p25: 430_000, p75: 620_000, sampleSize: 180, source: SALARY_HABR },

  // Backend
  { roleKey: 'backend', grade: 'intern',   scope: 'city', city: 'Москва', median: 85_000,  p25: 65_000,  p75: 115_000, sampleSize: 100, source: SALARY_HABR },
  { roleKey: 'backend', grade: 'junior',   scope: 'city', city: 'Москва', median: 165_000, p25: 140_000, p75: 200_000, sampleSize: 350, source: SALARY_HABR },
  { roleKey: 'backend', grade: 'middle',   scope: 'city', city: 'Москва', median: 290_000, p25: 245_000, p75: 350_000, sampleSize: 490, source: SALARY_HABR },
  { roleKey: 'backend', grade: 'senior',   scope: 'city', city: 'Москва', median: 420_000, p25: 355_000, p75: 510_000, sampleSize: 390, source: SALARY_HABR },
  { roleKey: 'backend', grade: 'lead',     scope: 'city', city: 'Москва', median: 540_000, p25: 460_000, p75: 660_000, sampleSize: 160, source: SALARY_HABR },

  // Fullstack
  { roleKey: 'fullstack', grade: 'junior', scope: 'city', city: 'Москва', median: 160_000, p25: 135_000, p75: 195_000, sampleSize: 210, source: SALARY_HABR },
  { roleKey: 'fullstack', grade: 'middle', scope: 'city', city: 'Москва', median: 280_000, p25: 235_000, p75: 335_000, sampleSize: 320, source: SALARY_HABR },
  { roleKey: 'fullstack', grade: 'senior', scope: 'city', city: 'Москва', median: 410_000, p25: 345_000, p75: 495_000, sampleSize: 260, source: SALARY_HABR },
  { roleKey: 'fullstack', grade: 'lead',   scope: 'city', city: 'Москва', median: 530_000, p25: 450_000, p75: 640_000, sampleSize: 100, source: SALARY_HABR },

  // Mobile
  { roleKey: 'mobile', grade: 'junior',    scope: 'city', city: 'Москва', median: 170_000, p25: 145_000, p75: 210_000, sampleSize: 190, source: SALARY_HABR },
  { roleKey: 'mobile', grade: 'middle',    scope: 'city', city: 'Москва', median: 310_000, p25: 260_000, p75: 375_000, sampleSize: 280, source: SALARY_HABR },
  { roleKey: 'mobile', grade: 'senior',    scope: 'city', city: 'Москва', median: 450_000, p25: 380_000, p75: 545_000, sampleSize: 220, source: SALARY_HABR },
  { roleKey: 'mobile', grade: 'lead',      scope: 'city', city: 'Москва', median: 570_000, p25: 480_000, p75: 690_000, sampleSize: 90,  source: SALARY_HABR },

  // DevOps
  { roleKey: 'devops', grade: 'junior',    scope: 'city', city: 'Москва', median: 165_000, p25: 140_000, p75: 205_000, sampleSize: 160, source: SALARY_HABR },
  { roleKey: 'devops', grade: 'middle',    scope: 'city', city: 'Москва', median: 300_000, p25: 250_000, p75: 360_000, sampleSize: 250, source: SALARY_HABR },
  { roleKey: 'devops', grade: 'senior',    scope: 'city', city: 'Москва', median: 440_000, p25: 370_000, p75: 535_000, sampleSize: 200, source: SALARY_HABR },
  { roleKey: 'devops', grade: 'lead',      scope: 'city', city: 'Москва', median: 560_000, p25: 470_000, p75: 680_000, sampleSize: 80,  source: SALARY_HABR },

  // Data Science
  { roleKey: 'datascience', grade: 'junior', scope: 'city', city: 'Москва', median: 175_000, p25: 145_000, p75: 215_000, sampleSize: 140, source: SALARY_HABR },
  { roleKey: 'datascience', grade: 'middle', scope: 'city', city: 'Москва', median: 315_000, p25: 265_000, p75: 380_000, sampleSize: 210, source: SALARY_HABR },
  { roleKey: 'datascience', grade: 'senior', scope: 'city', city: 'Москва', median: 450_000, p25: 375_000, p75: 545_000, sampleSize: 170, source: SALARY_HABR },
  { roleKey: 'datascience', grade: 'lead',   scope: 'city', city: 'Москва', median: 570_000, p25: 475_000, p75: 690_000, sampleSize: 70,  source: SALARY_HABR },

  // Data Analyst
  { roleKey: 'dataanalyst', grade: 'junior', scope: 'city', city: 'Москва', median: 135_000, p25: 110_000, p75: 165_000, sampleSize: 200, source: SALARY_HABR },
  { roleKey: 'dataanalyst', grade: 'middle', scope: 'city', city: 'Москва', median: 235_000, p25: 195_000, p75: 285_000, sampleSize: 290, source: SALARY_HABR },
  { roleKey: 'dataanalyst', grade: 'senior', scope: 'city', city: 'Москва', median: 355_000, p25: 295_000, p75: 430_000, sampleSize: 230, source: SALARY_HABR },
  { roleKey: 'dataanalyst', grade: 'lead',   scope: 'city', city: 'Москва', median: 460_000, p25: 385_000, p75: 560_000, sampleSize: 90,  source: SALARY_HABR },

  // QA
  { roleKey: 'qa', grade: 'junior', scope: 'city', city: 'Москва', median: 115_000, p25: 95_000,  p75: 145_000, sampleSize: 300, source: SALARY_HABR },
  { roleKey: 'qa', grade: 'middle', scope: 'city', city: 'Москва', median: 200_000, p25: 165_000, p75: 245_000, sampleSize: 380, source: SALARY_HABR },
  { roleKey: 'qa', grade: 'senior', scope: 'city', city: 'Москва', median: 295_000, p25: 245_000, p75: 360_000, sampleSize: 290, source: SALARY_HABR },
  { roleKey: 'qa', grade: 'lead',   scope: 'city', city: 'Москва', median: 380_000, p25: 315_000, p75: 460_000, sampleSize: 110, source: SALARY_HABR },

  // Product Manager
  { roleKey: 'productmanager', grade: 'junior', scope: 'city', city: 'Москва', median: 130_000, p25: 105_000, p75: 165_000, sampleSize: 160, source: SALARY_HABR },
  { roleKey: 'productmanager', grade: 'middle', scope: 'city', city: 'Москва', median: 235_000, p25: 190_000, p75: 290_000, sampleSize: 240, source: SALARY_HABR },
  { roleKey: 'productmanager', grade: 'senior', scope: 'city', city: 'Москва', median: 365_000, p25: 300_000, p75: 445_000, sampleSize: 190, source: SALARY_HABR },
  { roleKey: 'productmanager', grade: 'lead',   scope: 'city', city: 'Москва', median: 475_000, p25: 395_000, p75: 580_000, sampleSize: 80,  source: SALARY_HABR },

  // Designer
  { roleKey: 'designer', grade: 'junior', scope: 'city', city: 'Москва', median: 110_000, p25: 88_000,  p75: 140_000, sampleSize: 190, source: SALARY_HABR },
  { roleKey: 'designer', grade: 'middle', scope: 'city', city: 'Москва', median: 195_000, p25: 160_000, p75: 240_000, sampleSize: 270, source: SALARY_HABR },
  { roleKey: 'designer', grade: 'senior', scope: 'city', city: 'Москва', median: 315_000, p25: 260_000, p75: 385_000, sampleSize: 210, source: SALARY_HABR },
  { roleKey: 'designer', grade: 'lead',   scope: 'city', city: 'Москва', median: 415_000, p25: 345_000, p75: 510_000, sampleSize: 90,  source: SALARY_HABR },

  // Business Analyst
  { roleKey: 'businessanalyst', grade: 'junior', scope: 'city', city: 'Москва', median: 130_000, p25: 105_000, p75: 160_000, sampleSize: 130, source: SALARY_HABR },
  { roleKey: 'businessanalyst', grade: 'middle', scope: 'city', city: 'Москва', median: 225_000, p25: 185_000, p75: 275_000, sampleSize: 200, source: SALARY_HABR },
  { roleKey: 'businessanalyst', grade: 'senior', scope: 'city', city: 'Москва', median: 345_000, p25: 285_000, p75: 420_000, sampleSize: 160, source: SALARY_HABR },
  { roleKey: 'businessanalyst', grade: 'lead',   scope: 'city', city: 'Москва', median: 445_000, p25: 370_000, p75: 545_000, sampleSize: 70,  source: SALARY_HABR },

  // ── IT / Санкт-Петербург ──
  { roleKey: 'frontend', grade: 'middle', scope: 'city', city: 'Санкт-Петербург', median: 220_000, p25: 185_000, p75: 265_000, sampleSize: 210, source: SALARY_HABR },
  { roleKey: 'frontend', grade: 'senior', scope: 'city', city: 'Санкт-Петербург', median: 315_000, p25: 265_000, p75: 385_000, sampleSize: 180, source: SALARY_HABR },
  { roleKey: 'backend',  grade: 'middle', scope: 'city', city: 'Санкт-Петербург', median: 235_000, p25: 195_000, p75: 285_000, sampleSize: 190, source: SALARY_HABR },
  { roleKey: 'backend',  grade: 'senior', scope: 'city', city: 'Санкт-Петербург', median: 340_000, p25: 285_000, p75: 415_000, sampleSize: 160, source: SALARY_HABR },
  { roleKey: 'devops',   grade: 'senior', scope: 'city', city: 'Санкт-Петербург', median: 355_000, p25: 295_000, p75: 435_000, sampleSize: 120, source: SALARY_HABR },
  { roleKey: 'qa',       grade: 'middle', scope: 'city', city: 'Санкт-Петербург', median: 160_000, p25: 130_000, p75: 200_000, sampleSize: 150, source: SALARY_HABR },

  // ── IT / Екатеринбург ──
  { roleKey: 'frontend', grade: 'middle', scope: 'city', city: 'Екатеринбург', median: 170_000, p25: 140_000, p75: 210_000, sampleSize: 90, source: SALARY_HABR },
  { roleKey: 'frontend', grade: 'senior', scope: 'city', city: 'Екатеринбург', median: 250_000, p25: 205_000, p75: 310_000, sampleSize: 80, source: SALARY_HABR },
  { roleKey: 'backend',  grade: 'senior', scope: 'city', city: 'Екатеринбург', median: 265_000, p25: 215_000, p75: 325_000, sampleSize: 75, source: SALARY_HABR },

  // ── IT / Новосибирск ──
  { roleKey: 'frontend', grade: 'middle', scope: 'city', city: 'Новосибирск', median: 160_000, p25: 130_000, p75: 200_000, sampleSize: 80, source: SALARY_HABR },
  { roleKey: 'frontend', grade: 'senior', scope: 'city', city: 'Новосибирск', median: 240_000, p25: 195_000, p75: 300_000, sampleSize: 70, source: SALARY_HABR },
  { roleKey: 'backend',  grade: 'senior', scope: 'city', city: 'Новосибирск', median: 255_000, p25: 205_000, p75: 315_000, sampleSize: 65, source: SALARY_HABR },

  // ── IT / по России (country scope) ──
  { roleKey: 'frontend',       grade: 'junior', scope: 'country', median: 105_000, p25: 80_000,  p75: 135_000, sampleSize: 900,  source: SALARY_HABR },
  { roleKey: 'frontend',       grade: 'middle', scope: 'country', median: 195_000, p25: 155_000, p75: 245_000, sampleSize: 1300, source: SALARY_HABR },
  { roleKey: 'frontend',       grade: 'senior', scope: 'country', median: 295_000, p25: 235_000, p75: 370_000, sampleSize: 1000, source: SALARY_HABR },
  { roleKey: 'frontend',       grade: 'lead',   scope: 'country', median: 390_000, p25: 315_000, p75: 490_000, sampleSize: 400,  source: SALARY_HABR },
  { roleKey: 'backend',        grade: 'junior', scope: 'country', median: 115_000, p25: 90_000,  p75: 150_000, sampleSize: 850,  source: SALARY_HABR },
  { roleKey: 'backend',        grade: 'middle', scope: 'country', median: 215_000, p25: 170_000, p75: 270_000, sampleSize: 1200, source: SALARY_HABR },
  { roleKey: 'backend',        grade: 'senior', scope: 'country', median: 320_000, p25: 255_000, p75: 400_000, sampleSize: 950,  source: SALARY_HABR },
  { roleKey: 'backend',        grade: 'lead',   scope: 'country', median: 420_000, p25: 340_000, p75: 530_000, sampleSize: 380,  source: SALARY_HABR },
  { roleKey: 'fullstack',      grade: 'middle', scope: 'country', median: 210_000, p25: 165_000, p75: 265_000, sampleSize: 750,  source: SALARY_HABR },
  { roleKey: 'fullstack',      grade: 'senior', scope: 'country', median: 315_000, p25: 250_000, p75: 395_000, sampleSize: 600,  source: SALARY_HABR },
  { roleKey: 'mobile',         grade: 'middle', scope: 'country', median: 225_000, p25: 175_000, p75: 285_000, sampleSize: 650,  source: SALARY_HABR },
  { roleKey: 'mobile',         grade: 'senior', scope: 'country', median: 345_000, p25: 275_000, p75: 430_000, sampleSize: 520,  source: SALARY_HABR },
  { roleKey: 'devops',         grade: 'middle', scope: 'country', median: 220_000, p25: 175_000, p75: 280_000, sampleSize: 580,  source: SALARY_HABR },
  { roleKey: 'devops',         grade: 'senior', scope: 'country', median: 340_000, p25: 270_000, p75: 425_000, sampleSize: 470,  source: SALARY_HABR },
  { roleKey: 'datascience',    grade: 'middle', scope: 'country', median: 230_000, p25: 180_000, p75: 295_000, sampleSize: 480,  source: SALARY_HABR },
  { roleKey: 'datascience',    grade: 'senior', scope: 'country', median: 350_000, p25: 275_000, p75: 440_000, sampleSize: 380,  source: SALARY_HABR },
  { roleKey: 'dataanalyst',    grade: 'middle', scope: 'country', median: 175_000, p25: 140_000, p75: 220_000, sampleSize: 680,  source: SALARY_HABR },
  { roleKey: 'dataanalyst',    grade: 'senior', scope: 'country', median: 270_000, p25: 215_000, p75: 340_000, sampleSize: 540,  source: SALARY_HABR },
  { roleKey: 'qa',             grade: 'middle', scope: 'country', median: 145_000, p25: 115_000, p75: 185_000, sampleSize: 900,  source: SALARY_HABR },
  { roleKey: 'qa',             grade: 'senior', scope: 'country', median: 225_000, p25: 180_000, p75: 285_000, sampleSize: 720,  source: SALARY_HABR },
  { roleKey: 'productmanager', grade: 'middle', scope: 'country', median: 175_000, p25: 140_000, p75: 225_000, sampleSize: 560,  source: SALARY_HABR },
  { roleKey: 'productmanager', grade: 'senior', scope: 'country', median: 280_000, p25: 225_000, p75: 350_000, sampleSize: 450,  source: SALARY_HABR },
  { roleKey: 'designer',       grade: 'middle', scope: 'country', median: 145_000, p25: 115_000, p75: 185_000, sampleSize: 620,  source: SALARY_HABR },
  { roleKey: 'designer',       grade: 'senior', scope: 'country', median: 240_000, p25: 190_000, p75: 305_000, sampleSize: 490,  source: SALARY_HABR },

  // ── Не-IT / по России — Росстат ~2024 ──
  // Без различия по грейду (grade='all'), медианы по стране
  { roleKey: 'accountant',      grade: 'all', scope: 'country', median: 85_000,  p25: 62_000,  p75: 115_000, sampleSize: 5000, source: SALARY_ROSSTAT },
  { roleKey: 'hr',              grade: 'all', scope: 'country', median: 82_000,  p25: 60_000,  p75: 115_000, sampleSize: 3000, source: SALARY_ROSSTAT },
  { roleKey: 'marketing',       grade: 'all', scope: 'country', median: 95_000,  p25: 68_000,  p75: 140_000, sampleSize: 2500, source: SALARY_ROSSTAT },
  { roleKey: 'sales',           grade: 'all', scope: 'country', median: 105_000, p25: 72_000,  p75: 155_000, sampleSize: 4000, source: SALARY_ROSSTAT },
  { roleKey: 'lawyer',          grade: 'all', scope: 'country', median: 110_000, p25: 75_000,  p75: 165_000, sampleSize: 2000, source: SALARY_ROSSTAT },
  { roleKey: 'financialanalyst', grade: 'all', scope: 'country', median: 125_000, p25: 90_000, p75: 185_000, sampleSize: 1500, source: SALARY_ROSSTAT },
  { roleKey: 'officemanager',   grade: 'all', scope: 'country', median: 68_000,  p25: 50_000,  p75: 92_000,  sampleSize: 3500, source: SALARY_ROSSTAT },
  { roleKey: 'copywriter',      grade: 'all', scope: 'country', median: 75_000,  p25: 52_000,  p75: 110_000, sampleSize: 1800, source: SALARY_ROSSTAT },
  { roleKey: 'customerservice', grade: 'all', scope: 'country', median: 72_000,  p25: 55_000,  p75: 98_000,  sampleSize: 4200, source: SALARY_ROSSTAT },

  // ── Не-IT / Москва ──
  { roleKey: 'accountant',      grade: 'all', scope: 'city', city: 'Москва', median: 135_000, p25: 98_000,  p75: 185_000, sampleSize: 1200, source: SALARY_ROSSTAT },
  { roleKey: 'hr',              grade: 'all', scope: 'city', city: 'Москва', median: 125_000, p25: 90_000,  p75: 175_000, sampleSize: 800,  source: SALARY_ROSSTAT },
  { roleKey: 'marketing',       grade: 'all', scope: 'city', city: 'Москва', median: 155_000, p25: 110_000, p75: 225_000, sampleSize: 700,  source: SALARY_ROSSTAT },
  { roleKey: 'sales',           grade: 'all', scope: 'city', city: 'Москва', median: 175_000, p25: 120_000, p75: 255_000, sampleSize: 1000, source: SALARY_ROSSTAT },
  { roleKey: 'lawyer',          grade: 'all', scope: 'city', city: 'Москва', median: 190_000, p25: 130_000, p75: 280_000, sampleSize: 600,  source: SALARY_ROSSTAT },
]

async function seedMarketSalaries() {
  // Upsert by unique (roleKey, grade, scope, city, region)
  for (const entry of MARKET_SALARIES) {
    const where = {
      roleKey: entry.roleKey,
      grade: entry.grade,
      scope: entry.scope,
      city: entry.city ?? null,
      region: entry.region ?? null,
    }
    const existing = await prisma.marketSalary.findFirst({ where })
    if (existing) {
      await prisma.marketSalary.update({
        where: { id: existing.id },
        data: {
          median: entry.median,
          p25: entry.p25,
          p75: entry.p75,
          sampleSize: entry.sampleSize,
          source: entry.source,
        },
      })
    } else {
      await prisma.marketSalary.create({ data: entry })
    }
  }
  console.info(`seed: ${MARKET_SALARIES.length} записей MarketSalary`)
}

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

  await seedMarketSalaries()

  console.info('seed: готово')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ── Статичный сид зарплат ──────────────────────────────────────────────────────
// Источник: Хабр Карьера 2025 + агрегация по открытым российским рынкам труда.
// Net-зарплаты (руки, после 13% НДФЛ), Россия в целом (scope=country).
// Обновляется при новом сиде — updatedAt проставляется автоматически Prisma.
// Данные актуальны на дату seed-запуска (проверять не реже 1 раза в год).

type SeedSalaryRow = {
  roleKey: string
  grade: string
  p25: number
  median: number
  p75: number
}

const STATIC_SALARIES: SeedSalaryRow[] = [
  // Frontend
  { roleKey: 'frontend', grade: 'junior', p25: 70_000,  median: 95_000,  p75: 130_000 },
  { roleKey: 'frontend', grade: 'middle', p25: 145_000, median: 200_000, p75: 265_000 },
  { roleKey: 'frontend', grade: 'senior', p25: 240_000, median: 320_000, p75: 415_000 },
  { roleKey: 'frontend', grade: 'lead',   p25: 330_000, median: 440_000, p75: 570_000 },
  // Backend
  { roleKey: 'backend',  grade: 'junior', p25: 80_000,  median: 110_000, p75: 145_000 },
  { roleKey: 'backend',  grade: 'middle', p25: 165_000, median: 225_000, p75: 295_000 },
  { roleKey: 'backend',  grade: 'senior', p25: 265_000, median: 360_000, p75: 470_000 },
  { roleKey: 'backend',  grade: 'lead',   p25: 375_000, median: 500_000, p75: 650_000 },
  // Fullstack
  { roleKey: 'fullstack', grade: 'junior', p25: 75_000,  median: 105_000, p75: 140_000 },
  { roleKey: 'fullstack', grade: 'middle', p25: 155_000, median: 210_000, p75: 280_000 },
  { roleKey: 'fullstack', grade: 'senior', p25: 255_000, median: 345_000, p75: 450_000 },
  { roleKey: 'fullstack', grade: 'lead',   p25: 360_000, median: 480_000, p75: 625_000 },
  // Mobile
  { roleKey: 'mobile',   grade: 'junior', p25: 80_000,  median: 115_000, p75: 155_000 },
  { roleKey: 'mobile',   grade: 'middle', p25: 175_000, median: 240_000, p75: 320_000 },
  { roleKey: 'mobile',   grade: 'senior', p25: 290_000, median: 400_000, p75: 525_000 },
  { roleKey: 'mobile',   grade: 'lead',   p25: 400_000, median: 540_000, p75: 710_000 },
  // DevOps
  { roleKey: 'devops',   grade: 'junior', p25: 75_000,  median: 100_000, p75: 135_000 },
  { roleKey: 'devops',   grade: 'middle', p25: 165_000, median: 225_000, p75: 300_000 },
  { roleKey: 'devops',   grade: 'senior', p25: 275_000, median: 375_000, p75: 500_000 },
  { roleKey: 'devops',   grade: 'lead',   p25: 380_000, median: 520_000, p75: 690_000 },
  // Data Science
  { roleKey: 'datascience', grade: 'junior', p25: 90_000,  median: 120_000, p75: 165_000 },
  { roleKey: 'datascience', grade: 'middle', p25: 190_000, median: 265_000, p75: 355_000 },
  { roleKey: 'datascience', grade: 'senior', p25: 315_000, median: 440_000, p75: 590_000 },
  { roleKey: 'datascience', grade: 'lead',   p25: 430_000, median: 600_000, p75: 800_000 },
  // Data Analyst
  { roleKey: 'dataanalyst', grade: 'junior', p25: 65_000,  median: 90_000,  p75: 125_000 },
  { roleKey: 'dataanalyst', grade: 'middle', p25: 140_000, median: 195_000, p75: 260_000 },
  { roleKey: 'dataanalyst', grade: 'senior', p25: 225_000, median: 310_000, p75: 415_000 },
  // Data Engineer
  { roleKey: 'dataengineer', grade: 'middle', p25: 175_000, median: 255_000, p75: 355_000 },
  { roleKey: 'dataengineer', grade: 'senior', p25: 290_000, median: 415_000, p75: 570_000 },
  { roleKey: 'dataengineer', grade: 'lead',   p25: 400_000, median: 570_000, p75: 760_000 },
  // QA
  { roleKey: 'qa',       grade: 'junior', p25: 55_000,  median: 80_000,  p75: 110_000 },
  { roleKey: 'qa',       grade: 'middle', p25: 120_000, median: 170_000, p75: 230_000 },
  { roleKey: 'qa',       grade: 'senior', p25: 200_000, median: 280_000, p75: 375_000 },
  { roleKey: 'qa',       grade: 'lead',   p25: 280_000, median: 390_000, p75: 520_000 },
  // Product Manager
  { roleKey: 'productmanager', grade: 'middle', p25: 155_000, median: 215_000, p75: 295_000 },
  { roleKey: 'productmanager', grade: 'senior', p25: 255_000, median: 365_000, p75: 500_000 },
  { roleKey: 'productmanager', grade: 'lead',   p25: 375_000, median: 535_000, p75: 725_000 },
  // UX/UI Designer
  { roleKey: 'designer', grade: 'junior', p25: 55_000,  median: 80_000,  p75: 115_000 },
  { roleKey: 'designer', grade: 'middle', p25: 120_000, median: 170_000, p75: 235_000 },
  { roleKey: 'designer', grade: 'senior', p25: 200_000, median: 280_000, p75: 380_000 },
  // Project Manager
  { roleKey: 'projectmanager', grade: 'middle', p25: 130_000, median: 185_000, p75: 255_000 },
  { roleKey: 'projectmanager', grade: 'senior', p25: 225_000, median: 320_000, p75: 440_000 },
  { roleKey: 'projectmanager', grade: 'lead',   p25: 330_000, median: 475_000, p75: 650_000 },
  // Business Analyst
  { roleKey: 'businessanalyst', grade: 'middle', p25: 145_000, median: 200_000, p75: 275_000 },
  { roleKey: 'businessanalyst', grade: 'senior', p25: 235_000, median: 330_000, p75: 450_000 },
  // Sysadmin
  { roleKey: 'sysadmin', grade: 'junior', p25: 45_000,  median: 65_000,  p75: 90_000  },
  { roleKey: 'sysadmin', grade: 'middle', p25: 90_000,  median: 135_000, p75: 190_000 },
  { roleKey: 'sysadmin', grade: 'senior', p25: 165_000, median: 240_000, p75: 340_000 },
  // DBA
  { roleKey: 'dba',      grade: 'middle', p25: 130_000, median: 190_000, p75: 265_000 },
  { roleKey: 'dba',      grade: 'senior', p25: 235_000, median: 345_000, p75: 480_000 },
  // Security
  { roleKey: 'security', grade: 'middle', p25: 135_000, median: 195_000, p75: 270_000 },
  { roleKey: 'security', grade: 'senior', p25: 250_000, median: 360_000, p75: 500_000 },
  // Architect
  { roleKey: 'architect', grade: 'senior', p25: 330_000, median: 475_000, p75: 660_000 },
  { roleKey: 'architect', grade: 'lead',   p25: 470_000, median: 680_000, p75: 950_000 },
  // ── Офисные/не-IT роли (grade: 'all' — без грейдации) ─────────────────────
  { roleKey: 'accountant',      grade: 'all', p25: 50_000, median: 75_000,  p75: 115_000 },
  { roleKey: 'hr',              grade: 'all', p25: 55_000, median: 82_000,  p75: 130_000 },
  { roleKey: 'marketing',       grade: 'all', p25: 60_000, median: 95_000,  p75: 155_000 },
  { roleKey: 'sales',           grade: 'all', p25: 55_000, median: 95_000,  p75: 165_000 },
  { roleKey: 'lawyer',          grade: 'all', p25: 70_000, median: 120_000, p75: 200_000 },
  { roleKey: 'financialanalyst',grade: 'all', p25: 85_000, median: 140_000, p75: 220_000 },
  { roleKey: 'officemanager',   grade: 'all', p25: 45_000, median: 68_000,  p75: 100_000 },
  { roleKey: 'copywriter',      grade: 'all', p25: 40_000, median: 65_000,  p75: 110_000 },
  { roleKey: 'customerservice', grade: 'all', p25: 40_000, median: 60_000,  p75: 90_000  },
]

async function seedStaticSalaries(): Promise<void> {
  let created = 0
  for (const row of STATIC_SALARIES) {
    const exists = await prisma.marketSalary.findFirst({
      where: { roleKey: row.roleKey, grade: row.grade, scope: 'country', city: null, region: null },
    })
    if (!exists) {
      await prisma.marketSalary.create({
        data: {
          roleKey: row.roleKey,
          grade: row.grade,
          scope: 'country',
          city: null,
          region: null,
          median: row.median,
          p25: row.p25,
          p75: row.p75,
          sampleSize: 0,
          source: 'habr-manual-seed',
        },
      })
      created += 1
    }
  }
  if (created > 0) {
    console.info(`seed: добавлено ${created} статичных записей зарплат (fallback для HH)`)
  }
}

// 70 вопросов: 7 дней × 10 вопросов в день
// Структура дня: sleep×1 + burnout×3 + stress×2 + engagement×2 + wellbeing×2
const QUESTIONS = [
  // ── День 1 ──
  { key: 'sleep_d1',        day: 1, order: 1,  group: 'sleep',       title: 'Как тебе спалось этой ночью?',                              helperText: 'сон',              lowText: 'ужасно',        highText: 'отлично', image: 'sloth_sleep',    scaleMax: 10 },
  { key: 'burnout_d1_a',    day: 1, order: 2,  group: 'burnout',     title: 'К концу дня я чувствую себя опустошённым',                  helperText: 'истощение',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d1_b',    day: 1, order: 3,  group: 'burnout',     title: 'Мне сложно сосредоточиться на задачах',                     helperText: 'фокус',            lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d1_c',    day: 1, order: 4,  group: 'burnout',     title: 'Работа кажется мне бессмысленной',                          helperText: 'смысл',            lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'stress_d1_a',     day: 1, order: 5,  group: 'stress',      title: 'Сегодня я чувствовал(а), что не справляюсь с объёмом дел', helperText: 'перегрузка',       lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'stress_d1_b',     day: 1, order: 6,  group: 'stress',      title: 'Сегодня я был(а) раздражён(а) или на взводе',              helperText: 'раздражение',      lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'engagement_d1_a', day: 1, order: 7,  group: 'engagement',  title: 'Сегодня я чувствовал(а) себя полным(ой) энергии на работе', helperText: 'энергия',         lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'engagement_d1_b', day: 1, order: 8,  group: 'engagement',  title: 'Сегодня время на работе летело незаметно',                  helperText: 'поток',            lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'wellbeing_d1_a',  day: 1, order: 9,  group: 'wellbeing',   title: 'Сегодня я чувствовал(а) себя в хорошем настроении',        helperText: 'настроение',       lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
  { key: 'wellbeing_d1_b',  day: 1, order: 10, group: 'wellbeing',   title: 'Сегодня я чувствовал(а) спокойствие и расслабленность',    helperText: 'спокойствие',      lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },

  // ── День 2 ──
  { key: 'sleep_d2',        day: 2, order: 1,  group: 'sleep',       title: 'Ты проснулся(ась) отдохнувшим(ей)?',                       helperText: 'пробуждение',      lowText: 'разбит',        highText: 'бодр',    image: 'sloth_sleep',    scaleMax: 10 },
  { key: 'burnout_d2_a',    day: 2, order: 2,  group: 'burnout',     title: 'При мысли о работе меня накрывает усталость',               helperText: 'усталость',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d2_b',    day: 2, order: 3,  group: 'burnout',     title: 'Мне безразлично, хорошо ли я сделал(а) своё дело',         helperText: 'цинизм',           lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d2_c',    day: 2, order: 4,  group: 'burnout',     title: 'Я чувствую себя физически вымотанным',                     helperText: 'истощение',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'stress_d2_a',     day: 2, order: 5,  group: 'stress',      title: 'Сегодня я ощущал(а) потерю контроля',                      helperText: 'контроль',         lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'stress_d2_b',     day: 2, order: 6,  group: 'stress',      title: 'Сегодня у меня было ощущение, что всё идёт не так',        helperText: 'тревога',          lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'engagement_d2_a', day: 2, order: 7,  group: 'engagement',  title: 'Сегодня я был(а) воодушевлён(а) своей работой',            helperText: 'воодушевление',    lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'engagement_d2_b', day: 2, order: 8,  group: 'engagement',  title: 'Сегодня работа давалась легко и с удовольствием',          helperText: 'лёгкость',         lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'wellbeing_d2_a',  day: 2, order: 9,  group: 'wellbeing',   title: 'Сегодня я чувствовал(а) себя активным(ой) и бодрым(ой)',  helperText: 'активность',       lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
  { key: 'wellbeing_d2_b',  day: 2, order: 10, group: 'wellbeing',   title: 'Сегодня моя жизнь казалась наполненной смыслом',           helperText: 'смысл',            lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },

  // ── День 3 ──
  { key: 'sleep_d3',        day: 3, order: 1,  group: 'sleep',       title: 'Насколько крепким был сон?',                               helperText: 'качество сна',     lowText: 'очень чутким', highText: 'глубоким', image: 'sloth_sleep',    scaleMax: 10 },
  { key: 'burnout_d3_a',    day: 3, order: 2,  group: 'burnout',     title: 'Я чувствую эмоциональное истощение от работы',             helperText: 'эмоции',           lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d3_b',    day: 3, order: 3,  group: 'burnout',     title: 'Мне не хочется общаться с коллегами',                      helperText: 'дистанция',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d3_c',    day: 3, order: 4,  group: 'burnout',     title: 'Я стал(а) циничнее относиться к своей работе',             helperText: 'цинизм',           lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'stress_d3_a',     day: 3, order: 5,  group: 'stress',      title: 'Сегодня трудности казались непреодолимыми',                helperText: 'безнадёга',        lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'stress_d3_b',     day: 3, order: 6,  group: 'stress',      title: 'Сегодня я чувствовал(а) тревогу',                          helperText: 'тревога',          lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'engagement_d3_a', day: 3, order: 7,  group: 'engagement',  title: 'Сегодня я чувствовал(а) гордость за свою работу',          helperText: 'гордость',         lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'engagement_d3_b', day: 3, order: 8,  group: 'engagement',  title: 'Сегодня я был(а) полностью погружён(а) в работу',          helperText: 'погружение',       lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'wellbeing_d3_a',  day: 3, order: 9,  group: 'wellbeing',   title: 'Сегодня я чувствовал(а) себя уверенно',                    helperText: 'уверенность',      lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
  { key: 'wellbeing_d3_b',  day: 3, order: 10, group: 'wellbeing',   title: 'Сегодня у меня было ощущение, что я справляюсь',           helperText: 'справляюсь',       lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },

  // ── День 4 ──
  { key: 'sleep_d4',        day: 4, order: 1,  group: 'sleep',       title: 'Насколько легко удалось заснуть?',                         helperText: 'засыпание',        lowText: 'долго',         highText: 'сразу',   image: 'sloth_sleep',    scaleMax: 10 },
  { key: 'burnout_d4_a',    day: 4, order: 2,  group: 'burnout',     title: 'После работы у меня нет сил ни на что другое',             helperText: 'истощение',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d4_b',    day: 4, order: 3,  group: 'burnout',     title: 'Утром мне тяжело вставать и идти на работу',               helperText: 'мотивация',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d4_c',    day: 4, order: 4,  group: 'burnout',     title: 'Я чувствую, что работаю на пределе возможностей',          helperText: 'предел',           lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'stress_d4_a',     day: 4, order: 5,  group: 'stress',      title: 'Сегодня я испытывал(а) давление со стороны',               helperText: 'давление',         lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'stress_d4_b',     day: 4, order: 6,  group: 'stress',      title: 'Сегодня я чувствовал(а), что времени ни на что не хватает', helperText: 'дефицит времени', lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'engagement_d4_a', day: 4, order: 7,  group: 'engagement',  title: 'Сегодня работа давала мне ощущение смысла',                helperText: 'смысл',            lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'engagement_d4_b', day: 4, order: 8,  group: 'engagement',  title: 'Сегодня я хотел(а) делать больше, чем требовалось',        helperText: 'инициатива',       lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'wellbeing_d4_a',  day: 4, order: 9,  group: 'wellbeing',   title: 'Сегодня мне было хорошо в целом',                          helperText: 'общее',            lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
  { key: 'wellbeing_d4_b',  day: 4, order: 10, group: 'wellbeing',   title: 'Сегодня я был(а) доволен(льна) собой',                    helperText: 'удовлетворённость', lowText: 'нет',          highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },

  // ── День 5 ──
  { key: 'sleep_d5',        day: 5, order: 1,  group: 'sleep',       title: 'Хватило ли сна, чтобы нормально функционировать?',         helperText: 'достаточность',    lowText: 'нет',           highText: 'да',      image: 'sloth_sleep',    scaleMax: 10 },
  { key: 'burnout_d5_a',    day: 5, order: 2,  group: 'burnout',     title: 'За последнее время работа вытягивает из меня все соки',    helperText: 'истощение',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d5_b',    day: 5, order: 3,  group: 'burnout',     title: 'Мне сложно проявлять энтузиазм в работе',                  helperText: 'энтузиазм',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d5_c',    day: 5, order: 4,  group: 'burnout',     title: 'Я чувствую себя эмоционально опустошённым(ой)',             helperText: 'эмоции',           lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'stress_d5_a',     day: 5, order: 5,  group: 'stress',      title: 'Сегодня я не мог(ла) отключиться от рабочих мыслей',       helperText: 'зацикленность',    lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'stress_d5_b',     day: 5, order: 6,  group: 'stress',      title: 'Сегодня я срывался(ась) на мелочах',                       helperText: 'раздражение',      lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'engagement_d5_a', day: 5, order: 7,  group: 'engagement',  title: 'Сегодня я был(а) сосредоточен(а) и продуктивен(на)',       helperText: 'продуктивность',   lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'engagement_d5_b', day: 5, order: 8,  group: 'engagement',  title: 'Сегодня я чувствовал(а) себя в потоке',                    helperText: 'поток',            lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'wellbeing_d5_a',  day: 5, order: 9,  group: 'wellbeing',   title: 'Сегодня я ощущал(а) радость или лёгкость',                 helperText: 'радость',          lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
  { key: 'wellbeing_d5_b',  day: 5, order: 10, group: 'wellbeing',   title: 'Сегодня я чувствовал(а) связь с окружающими',              helperText: 'связь',            lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },

  // ── День 6 ──
  { key: 'sleep_d6',        day: 6, order: 1,  group: 'sleep',       title: 'Просыпался(ась) ли ночью?',                                helperText: 'пробуждения',      lowText: 'несколько раз', highText: 'ни разу', image: 'sloth_sleep',    scaleMax: 10 },
  { key: 'burnout_d6_a',    day: 6, order: 2,  group: 'burnout',     title: 'Мне безразлично, что происходит на работе',                helperText: 'отстранённость',   lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d6_b',    day: 6, order: 3,  group: 'burnout',     title: 'Я избегаю думать о рабочих задачах вне работы',            helperText: 'дистанция',        lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d6_c',    day: 6, order: 4,  group: 'burnout',     title: 'Мне трудно находить смысл в своих рабочих задачах',        helperText: 'смысл',            lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'stress_d6_a',     day: 6, order: 5,  group: 'stress',      title: 'Сегодня я чувствовал(а) себя перегруженным(ой)',           helperText: 'перегрузка',       lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'stress_d6_b',     day: 6, order: 6,  group: 'stress',      title: 'Сегодня было ощущение, что я не успею сделать всё важное', helperText: 'тревога',          lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'engagement_d6_a', day: 6, order: 7,  group: 'engagement',  title: 'Сегодня мне было интересно то, чем я занимался(ась)',      helperText: 'интерес',          lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'engagement_d6_b', day: 6, order: 8,  group: 'engagement',  title: 'Сегодня я чувствовал(а), что моя работа имеет значение',  helperText: 'значимость',       lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'wellbeing_d6_a',  day: 6, order: 9,  group: 'wellbeing',   title: 'Сегодня я был(а) в гармонии с собой',                     helperText: 'гармония',         lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
  { key: 'wellbeing_d6_b',  day: 6, order: 10, group: 'wellbeing',   title: 'Сегодня у меня было что-то, что по-настоящему порадовало', helperText: 'радость',          lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },

  // ── День 7 ──
  { key: 'sleep_d7',        day: 7, order: 1,  group: 'sleep',       title: 'Как бы ты оценил(а) сон за эту неделю в целом?',          helperText: 'итог недели',      lowText: 'ужасно',        highText: 'отлично', image: 'sloth_sleep',    scaleMax: 10 },
  { key: 'burnout_d7_a',    day: 7, order: 2,  group: 'burnout',     title: 'На этой неделе работа давалась мне тяжелее обычного',      helperText: 'нагрузка',         lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d7_b',    day: 7, order: 3,  group: 'burnout',     title: 'За эту неделю я потерял(а) интерес к работе',              helperText: 'интерес',          lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'burnout_d7_c',    day: 7, order: 4,  group: 'burnout',     title: 'Эта неделя оставила меня морально выжатым(ой)',            helperText: 'итог',             lowText: 'нет',           highText: 'да',      image: 'sloth_burnout',  scaleMax: 5 },
  { key: 'stress_d7_a',     day: 7, order: 5,  group: 'stress',      title: 'На этой неделе стресса было больше, чем я могу вынести',  helperText: 'итог',             lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'stress_d7_b',     day: 7, order: 6,  group: 'stress',      title: 'Эта неделя оставила меня морально выжатым(ой) от напряжения', helperText: 'итог',         lowText: 'нет',           highText: 'да',      image: 'sloth_stress',   scaleMax: 5 },
  { key: 'engagement_d7_a', day: 7, order: 7,  group: 'engagement',  title: 'На этой неделе работа чаще приносила удовольствие',        helperText: 'итог',             lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'engagement_d7_b', day: 7, order: 8,  group: 'engagement',  title: 'На этой неделе я чувствовал(а) себя вовлечённым(ой)',      helperText: 'итог',             lowText: 'нет',           highText: 'да',      image: 'sloth_thinking', scaleMax: 5 },
  { key: 'wellbeing_d7_a',  day: 7, order: 9,  group: 'wellbeing',   title: 'На этой неделе я чаще чувствовал(а) себя хорошо',         helperText: 'итог',             lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
  { key: 'wellbeing_d7_b',  day: 7, order: 10, group: 'wellbeing',   title: 'Насколько ты держишься? Общая оценка недели',              helperText: 'итог',             lowText: 'нет',           highText: 'да',      image: 'sloth_mood',     scaleMax: 5 },
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
  // Удаляем старые вопросы с устаревшими ключами
  await prisma.question.deleteMany({
    where: {
      key: {
        in: ['mood', 'energy', 'sleep', 'stress', 'support', 'exhaustion', 'cynicism', 'focus', 'irritability', 'load'],
      },
    },
  })

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

  // Статичный fallback-сид зарплат. Используется, когда HH_APP_TOKEN не настроен
  // и DB пуста. Данные основаны на Хабр Карьера 2025 и агрегированных данных
  // российского рынка (net-зарплаты, руб/мес, в ценах 2025-2026 г.).
  // Запись создаётся только если записи по данному ключу ещё нет — не перетирает live HH данные.
  await seedStaticSalaries()
  console.info('seed: готово')
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

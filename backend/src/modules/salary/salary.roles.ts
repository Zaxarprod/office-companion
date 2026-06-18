export interface CanonicalRole {
  key: string
  label: string
  aliases: string[]
  hhRoleId?: number
}

export const ROLES: CanonicalRole[] = [
  // IT — разработка
  {
    key: 'frontend',
    label: 'Frontend-разработчик',
    aliases: [
      'frontend', 'фронтенд', 'фронтендер', 'front-end', 'front end',
      'react', 'vue', 'angular', 'javascript dev', 'js developer',
      'react dev', 'react developer', 'ui developer', 'верстальщик',
    ],
    hhRoleId: 96,
  },
  {
    key: 'backend',
    label: 'Backend-разработчик',
    aliases: [
      'backend', 'бэкенд', 'бэкендер', 'back-end', 'back end',
      'java dev', 'python dev', 'go dev', 'node dev', 'node.js dev',
      'php dev', 'ruby dev', 'java developer', 'python developer',
      'go developer', 'серверный разработчик',
    ],
    hhRoleId: 160,
  },
  {
    key: 'fullstack',
    label: 'Fullstack-разработчик',
    aliases: ['fullstack', 'фуллстек', 'full stack', 'full-stack', 'фулл-стек'],
    hhRoleId: 12,
  },
  {
    key: 'mobile',
    label: 'Мобильный разработчик',
    aliases: [
      'mobile', 'мобильный', 'ios', 'android', 'ios developer',
      'android developer', 'swift', 'kotlin', 'react native', 'flutter',
      'мобильный разработчик',
    ],
    hhRoleId: 164,
  },
  {
    key: 'devops',
    label: 'DevOps-инженер',
    aliases: [
      'devops', 'девопс', 'sre', 'site reliability', 'cloud engineer',
      'kubernetes', 'docker', 'ci/cd', 'инфраструктурщик',
    ],
    hhRoleId: 107,
  },
  {
    key: 'datascience',
    label: 'Data Scientist',
    aliases: [
      'data scientist', 'data science', 'датасайентист',
      'ml engineer', 'machine learning', 'ml', 'ai engineer',
      'нейросети', 'deep learning', 'дата сайентист',
    ],
    hhRoleId: 165,
  },
  {
    key: 'dataanalyst',
    label: 'Аналитик данных',
    aliases: [
      'data analyst', 'аналитик данных', 'дата аналитик',
      'bi analyst', 'bi-аналитик', 'tableau', 'power bi',
      'дата-аналитик',
    ],
    hhRoleId: 10,
  },
  {
    key: 'dataengineer',
    label: 'Дата-инженер',
    aliases: [
      'data engineer', 'дата инженер', 'дата-инженер',
      'etl developer', 'spark engineer', 'hadoop', 'airflow',
    ],
  },
  {
    key: 'qa',
    label: 'QA-инженер',
    aliases: [
      'qa', 'тестировщик', 'тестировщица', 'qa engineer',
      'quality assurance', 'тестирование', 'автотест',
      'test engineer', 'qa automation',
    ],
    hhRoleId: 124,
  },
  {
    key: 'productmanager',
    label: 'Продуктовый менеджер',
    aliases: [
      'product manager', 'продуктовый менеджер', 'продакт',
      'продуктолог', 'head of product',
    ],
    hhRoleId: 68,
  },
  {
    key: 'designer',
    label: 'UX/UI-дизайнер',
    aliases: [
      'designer', 'дизайнер', 'ux', 'ui', 'ux/ui', 'ui/ux',
      'ux designer', 'ui designer', 'продуктовый дизайнер',
      'figma', 'графический дизайнер',
    ],
    hhRoleId: 270,
  },
  {
    key: 'projectmanager',
    label: 'Проектный менеджер',
    aliases: [
      'project manager', 'проектный менеджер', 'руководитель проекта',
      'scrum master', 'скрам мастер', 'agile coach',
    ],
    hhRoleId: 141,
  },
  {
    key: 'businessanalyst',
    label: 'Бизнес-аналитик',
    aliases: [
      'business analyst', 'бизнес аналитик', 'бизнес-аналитик',
      'системный аналитик', 'system analyst', 'аналитик требований',
    ],
  },
  {
    key: 'sysadmin',
    label: 'Системный администратор',
    aliases: [
      'sysadmin', 'сисадмин', 'системный администратор',
      'linux admin', 'windows admin', 'network admin',
    ],
    hhRoleId: 203,
  },
  {
    key: 'dba',
    label: 'DBA / Администратор БД',
    aliases: [
      'dba', 'database administrator', 'администратор бд',
      'администратор баз данных', 'sql admin', 'postgres admin',
    ],
  },
  {
    key: 'security',
    label: 'Специалист по ИБ',
    aliases: [
      'security', 'безопасность', 'информационная безопасность',
      'иб', 'ибшник', 'pentester', 'пентестер', 'soc analyst',
    ],
    hhRoleId: 192,
  },
  {
    key: 'architect',
    label: 'Архитектор ПО',
    aliases: [
      'architect', 'архитектор', 'software architect',
      'system architect', 'solution architect', 'enterprise architect',
    ],
    hhRoleId: 25,
  },
  // Офис / не-IT
  {
    key: 'accountant',
    label: 'Бухгалтер',
    aliases: [
      'бухгалтер', 'accountant', 'главбух',
      'главный бухгалтер', '1с бухгалтер', 'бухгалтерия',
    ],
  },
  {
    key: 'hr',
    label: 'HR-специалист',
    aliases: [
      'hr', 'хр', 'рекрутер', 'recruiter',
      'hr specialist', 'hr manager', 'hr-менеджер',
      'менеджер по персоналу', 'кадровик',
    ],
  },
  {
    key: 'marketing',
    label: 'Маркетолог',
    aliases: [
      'маркетолог', 'marketing', 'marketer',
      'smm', 'digital marketing', 'seo', 'таргетолог',
      'контент-менеджер', 'контент менеджер',
    ],
  },
  {
    key: 'sales',
    label: 'Менеджер по продажам',
    aliases: [
      'sales', 'продажи', 'менеджер продаж',
      'sales manager', 'аккаунт менеджер',
      'account manager', 'продажник', 'b2b sales',
    ],
  },
  {
    key: 'lawyer',
    label: 'Юрист',
    aliases: ['юрист', 'lawyer', 'legal', 'attorney', 'адвокат', 'корпоративный юрист'],
  },
  {
    key: 'financialanalyst',
    label: 'Финансовый аналитик',
    aliases: ['финансовый аналитик', 'financial analyst', 'финансист', 'fp&a', 'казначей'],
  },
  {
    key: 'officemanager',
    label: 'Офис-менеджер',
    aliases: [
      'офис менеджер', 'офис-менеджер', 'office manager',
      'административный менеджер', 'секретарь', 'администратор офиса',
    ],
  },
  {
    key: 'copywriter',
    label: 'Копирайтер',
    aliases: ['копирайтер', 'copywriter', 'редактор', 'editor', 'content writer', 'автор'],
  },
  {
    key: 'customerservice',
    label: 'Специалист поддержки',
    aliases: [
      'поддержка', 'customer service', 'support',
      'техподдержка', 'helpdesk', 'клиентский сервис',
    ],
  },
]

export type Grade = 'intern' | 'junior' | 'middle' | 'senior' | 'lead'
export const GRADES: Grade[] = ['intern', 'junior', 'middle', 'senior', 'lead']

export const GRADE_ALIASES: Record<string, Grade> = {
  // canonical
  intern: 'intern',
  junior: 'junior',
  middle: 'middle',
  senior: 'senior',
  lead: 'lead',
  // russian
  интерн: 'intern',
  стажер: 'intern',
  стажёр: 'intern',
  практикант: 'intern',
  trainee: 'intern',
  джун: 'junior',
  младший: 'junior',
  jun: 'junior',
  'jr.': 'junior',
  jr: 'junior',
  мидл: 'middle',
  средний: 'middle',
  mid: 'middle',
  сеньор: 'senior',
  сениор: 'senior',
  старший: 'senior',
  sen: 'senior',
  'sr.': 'senior',
  sr: 'senior',
  лид: 'lead',
  ведущий: 'lead',
  тимлид: 'lead',
  'team lead': 'lead',
  teamlead: 'lead',
  principal: 'lead',
  'tech lead': 'lead',
  'engineering manager': 'lead',
  em: 'lead',
}

export const GRADE_TO_HH_EXPERIENCE: Record<Grade, string> = {
  intern: 'noExperience',
  junior: 'between1And3',
  middle: 'between3And6',
  senior: 'moreThan6',
  lead: 'moreThan6',
}

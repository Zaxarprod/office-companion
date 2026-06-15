const required = (name: string): string => {
  const value = process.env[name]
  if (!value) {
    throw new Error(`Не задана переменная окружения ${name}`)
  }
  return value
}

export const config = {
  port: Number(process.env.PORT ?? 3000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  botToken: process.env.BOT_TOKEN ?? '',
  authDev: process.env.AUTH_DEV === '1',
}

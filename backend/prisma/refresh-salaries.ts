import { PrismaClient } from '@prisma/client'

import { fetchVacancies } from '../src/modules/salary/hh.client'
import { aggregateSalaries, extractNetSalary } from '../src/modules/salary/hh.logic'
import { DATA_MAX_AGE_MS } from '../src/modules/salary/salary.logic'
import { ROLES, type Grade } from '../src/modules/salary/salary.roles'

const prisma = new PrismaClient()

// Регионы для наполнения: страна + крупные города (достоверные area id HH).
const AREAS: { areaId: number; scope: 'country' | 'city'; city: string | null }[] = [
  { areaId: 113, scope: 'country', city: null },
  { areaId: 1, scope: 'city', city: 'Москва' },
  { areaId: 2, scope: 'city', city: 'Санкт-Петербург' },
  { areaId: 3, scope: 'city', city: 'Екатеринбург' },
  { areaId: 4, scope: 'city', city: 'Новосибирск' },
]

const IT_GRADES: Grade[] = ['junior', 'middle', 'senior', 'lead']

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Upsert по композитному ключу (без unique-индекса — через findFirst). */
const upsertRow = async (params: {
  roleKey: string
  grade: string
  scope: 'country' | 'city'
  city: string | null
  median: number
  p25: number
  p75: number
  sampleSize: number
}): Promise<void> => {
  const where = {
    roleKey: params.roleKey,
    grade: params.grade,
    scope: params.scope,
    city: params.city,
    region: null,
  }
  const data = {
    median: params.median,
    p25: params.p25,
    p75: params.p75,
    sampleSize: params.sampleSize,
    source: 'hh-live',
  }
  const existing = await prisma.marketSalary.findFirst({ where })
  if (existing) {
    await prisma.marketSalary.update({ where: { id: existing.id }, data })
  } else {
    await prisma.marketSalary.create({ data: { ...where, ...data } })
  }
}

async function main() {
  // 1. Очистка неактуального: всё, что старше года, удаляем.
  const cutoff = new Date(Date.now() - DATA_MAX_AGE_MS)
  const removed = await prisma.marketSalary.deleteMany({ where: { updatedAt: { lt: cutoff } } })
  console.info(`refresh: удалено устаревших записей: ${removed.count}`)

  let updated = 0
  let skipped = 0

  for (const role of ROLES) {
    // IT-роли (есть hhRoleId) — по грейдам; прочие — без грейда (grade='all') через text.
    const grades: (Grade | null)[] = role.hhRoleId ? IT_GRADES : [null]

    for (const area of AREAS) {
      for (const grade of grades) {
        const res = await fetchVacancies({
          hhRoleId: role.hhRoleId,
          text: role.hhRoleId == null ? role.label : undefined,
          grade,
          areaId: area.areaId,
          maxPages: 2,
        })
        await delay(300) // вежливо к HH

        if (!res) {
          skipped += 1
          continue
        }
        const salaries = res.items
          .map(extractNetSalary)
          .filter((n): n is number => n != null)
        const agg = aggregateSalaries(salaries)
        if (!agg) {
          skipped += 1
          continue
        }

        await upsertRow({
          roleKey: role.key,
          grade: grade ?? 'all',
          scope: area.scope,
          city: area.city,
          median: agg.median,
          p25: agg.p25,
          p75: agg.p75,
          sampleSize: agg.sampleSize,
        })
        updated += 1
        console.info(
          `refresh: ${role.key}/${grade ?? 'all'}/${area.city ?? 'РФ'} → median ${agg.median} (n=${agg.sampleSize})`,
        )
      }
    }
  }

  console.info(`refresh: готово. Обновлено: ${updated}, пропущено (нет данных): ${skipped}`)
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())

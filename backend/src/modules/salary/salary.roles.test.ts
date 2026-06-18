/**
 * Регрессионные тесты hhRoleId — проверяем, что каждый ID соответствует
 * реальной роли на api.hh.ru/professional_roles (верифицировано вручную
 * 2026-06-18). При изменении — перепроверить через GET /professional_roles.
 *
 * Зеркало корректных ID из IT-категории HH:
 *   96  Программист, разработчик
 *  104  Руководитель группы разработки
 *  107  Руководитель проектов
 *  113  Системный администратор
 *  116  Специалист по информационной безопасности
 *  124  Тестировщик
 *  150  Бизнес-аналитик
 *  156  BI-аналитик, аналитик данных
 *  160  DevOps-инженер
 *  165  Дата-сайентист
 *
 * Прочие (не-IT категории HH, верифицированы):
 *   34  Дизайнер, художник
 *   73  Менеджер продукта
 */
import { describe, it } from 'node:test'
import assert from 'node:assert/strict'

import { ROLES } from './salary.roles'

// Проверенные соответствия role key → hhRoleId из api.hh.ru/professional_roles
const EXPECTED: Record<string, number> = {
  frontend:       96,  // Программист, разработчик
  devops:        160,  // DevOps-инженер
  datascience:   165,  // Дата-сайентист
  dataanalyst:   156,  // BI-аналитик, аналитик данных
  qa:            124,  // Тестировщик
  productmanager: 73,  // Менеджер продукта
  designer:       34,  // Дизайнер, художник
  projectmanager:107,  // Руководитель проектов
  businessanalyst:150, // Бизнес-аналитик
  sysadmin:      113,  // Системный администратор
  security:      116,  // Специалист по информационной безопасности
  architect:     104,  // Руководитель группы разработки
}

// Роли без отдельной категории в HH — должны использовать text-поиск
const EXPECT_NO_HH_ROLE_ID = ['backend', 'fullstack', 'mobile']

describe('salary.roles: hhRoleId соответствие HH API', () => {
  for (const [key, expectedId] of Object.entries(EXPECTED)) {
    it(`${key} → hhRoleId=${expectedId}`, () => {
      const role = ROLES.find((r) => r.key === key)
      assert.ok(role, `Роль "${key}" не найдена в ROLES`)
      assert.equal(
        role!.hhRoleId,
        expectedId,
        `${key}: ожидался id=${expectedId}, получен id=${role!.hhRoleId}`,
      )
    })
  }

  for (const key of EXPECT_NO_HH_ROLE_ID) {
    it(`${key} не имеет hhRoleId (text-поиск)`, () => {
      const role = ROLES.find((r) => r.key === key)
      assert.ok(role, `Роль "${key}" не найдена в ROLES`)
      assert.equal(
        role!.hhRoleId,
        undefined,
        `${key}: ожидается undefined, получен hhRoleId=${role!.hhRoleId}`,
      )
    })
  }
})

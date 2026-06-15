import type {
  CompatibilityDonutDto,
  CompatibilityDto,
  Relation,
} from '@contracts/compatibility'

export type { Relation }

// Клиентский ввод: birthday — Date (JSON.stringify сериализует в ISO на POST).
// Время и место опциональны: с временем у обоих поднимаемся до Уровня B.
export interface BirthInput {
  birthday: Date
  birthTime?: string
  lat?: number
  lon?: number
}

export interface CompatibilityInput {
  you: BirthInput
  target: BirthInput
  relation: Relation
}

export type CompatibilityDonut = CompatibilityDonutDto
// В ответе нет дат → Output === MappedOutput.
export type Compatibility = CompatibilityDto

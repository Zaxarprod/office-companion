import type { ColorToken } from '~/shared/styles/tokens'

export interface DistributionBar {
  /** Высота столбца (частота/количество); нормируется к максимуму внутри. */
  value: number
  /** Цвет столбца (токен). По умолчанию нейтральный. Так выделяем «вы», «медиану» и т.п. */
  tone?: ColorToken
  /** Подпись под столбцом (например «вы», «медиана», диапазон зарплат). */
  label?: string
  /** Стрелка вниз над столбцом (указатель «вы здесь»). Цвет — из tone. */
  arrow?: boolean
}

export interface DistributionChartProps {
  data: DistributionBar[]
  /** Высота области столбцов, px. По умолчанию 60. */
  height?: number
  /** Зазор между столбцами, px. По умолчанию 3. */
  gap?: number
}

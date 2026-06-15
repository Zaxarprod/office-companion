import type { CompatibilityInput } from '@contracts/compatibility'

import { buildChart } from '../../lib/astro'

import { buildCompatibility } from './compatibility.logic'

export const compatibilityService = {
  check: (input: CompatibilityInput) => {
    const you = buildChart(input.you)
    const target = buildChart(input.target)
    return buildCompatibility(you, target, input.relation)
  },
}

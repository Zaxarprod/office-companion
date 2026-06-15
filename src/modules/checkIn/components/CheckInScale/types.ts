import type { CheckInAnswerOption } from '../../types'

export interface CheckInScaleProps {
  options: CheckInAnswerOption[]
  value: number | null
  onChange: (value: number) => void
  /** Подпись минимальной оценки. */
  lowText: string
  /** Подпись максимальной оценки. */
  highText: string
}

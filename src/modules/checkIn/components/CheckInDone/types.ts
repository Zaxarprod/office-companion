import type { CheckIn, CheckInQuestion } from '../../types'

export interface CheckInDoneProps {
  checkIn: CheckIn
  /** Вопросы текущего дня — для подписей метрик. */
  questions: CheckInQuestion[]
  onHome: () => void
  onDynamics: () => void
}

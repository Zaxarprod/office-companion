import type { CheckIn } from '../../types'

export interface CheckInDoneProps {
  checkIn: CheckIn
  onHome: () => void
  onDynamics: () => void
}

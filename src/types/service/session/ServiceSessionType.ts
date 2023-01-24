import { SessionType } from '../../schema'
import { CreaetSessionService } from '../session'

export type ServiceSessionType = {
  findSession: (ip: string, url: string, deviceTitle: string) => Promise<SessionType | null>
  createdSession: ({ ip, deviceTitle, url }: CreaetSessionService) => Promise<SessionType>
  increaseAttempt: (id: string) => Promise<SessionType | null>
  resetAttempt: (id: string) => Promise<boolean>
}

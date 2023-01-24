import { SessionType } from '../schema'

export type RepositorySessionType = {
  findSession: (ip: string, url: string, deviceTitle: string) => Promise<SessionType | null>
  createdSession: (dbSession: SessionType) => Promise<SessionType>
  increaseAttempt: (id: string) => Promise<SessionType | null>
  resetAttempt: (id: string) => Promise<boolean>
}

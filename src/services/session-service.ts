import { SessionRepository } from '../repositories/session/session-db-mongoose-repository'
import { getNextStrId } from '../utils'
import { SessionType, CreaetSessionService } from '../types'

export class SessionService {
  constructor(protected sessionRepository: SessionRepository) {}

  async findSession(ip: string, url: string, deviceTitle: string): Promise<SessionType | null> {
    const foundSession = await this.sessionRepository.findSession(ip, url, deviceTitle)

    return foundSession
  }
  async createdSession({ ip, deviceTitle, url }: CreaetSessionService): Promise<SessionType> {
    const newUSession = new SessionType(ip, deviceTitle, url)
    const createdSession = await this.sessionRepository.createdSession(newUSession)

    return createdSession
  }
  async increaseAttempt(id: string): Promise<SessionType | null> {
    const isIncreaseAttempt = await this.sessionRepository.increaseAttempt(id)

    return isIncreaseAttempt
  }
  async resetAttempt(id: string): Promise<boolean> {
    const isResetAttempt = await this.sessionRepository.resetAttempt(id)

    return isResetAttempt
  }
}

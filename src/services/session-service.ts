import { sessionRepository } from '../repositories/session/session-db-repository'
import { getNextStrId } from '../utils'
import { SessionType, ServiceSessionType } from '../types'

export const sessionService: ServiceSessionType = {
  async findSession(ip, url, deviceTitle) {
    const foundSession = await sessionRepository.findSession(ip, url, deviceTitle)

    return foundSession
  },
  async createdSession({ ip, deviceTitle, url }) {
    const newUSession: SessionType = {
      id: getNextStrId(),
      ip,
      deviceTitle,
      url,
      issuedAtt: new Date().toISOString(),
      attempt: 1,
    }

    const createdSession = await sessionRepository.createdSession(newUSession)

    return createdSession
  },
  async increaseAttempt(id) {
    const isIncreaseAttempt = await sessionRepository.increaseAttempt(id)

    return isIncreaseAttempt
  },
  async resetAttempt(id) {
    const isResetAttempt = await sessionRepository.resetAttempt(id)

    return isResetAttempt
  },  
}

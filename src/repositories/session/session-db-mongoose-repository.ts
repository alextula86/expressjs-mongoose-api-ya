import { injectable } from 'inversify'
import { SessionModel } from '../db-mongoose'
import { SessionType } from '../../types'

@injectable()
export class SessionRepository {
  async findSession(ip: string, url: string, deviceTitle: string): Promise<SessionType | null> {
    const foundSession: SessionType | null = await SessionModel.findOne({
      $and: [{ ip }, { url }, { deviceTitle }]
    })

    if (!foundSession) {
      return null
    }

    return foundSession
  }
  async createdSession(createdSession: SessionType): Promise<SessionType> {
    await SessionModel.create(createdSession)

    return createdSession
  }
  async increaseAttempt(id: string): Promise<SessionType | null> {
    const document = await SessionModel.findOneAndUpdate({ id }, { $inc: { attempt: 1 } }, { returnDocument: "after", })

    if (!document) {
      return null
    }

    return null
  }
  async resetAttempt(id: string): Promise<boolean> {
    const { matchedCount } = await SessionModel.updateOne({ id }, {
      $set: { attempt: 1, issuedAtt: new Date().toISOString() },
    })

    return matchedCount === 1   
  }
}

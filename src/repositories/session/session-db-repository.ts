import { sessionCollection } from '../db'
import { SessionType } from '../../types'

export class sessionRepository {
  async findSession(ip: string, url: string, deviceTitle: string): Promise<SessionType | null> {
    const foundSession: SessionType | null = await sessionCollection.findOne({
      $and: [{ ip }, { url }, { deviceTitle }]
    })

    if (!foundSession) {
      return null
    }

    return foundSession
  }
  async createdSession(createdSession: SessionType): Promise<SessionType> {
    await sessionCollection.insertOne(createdSession)

    return createdSession
  }
  async increaseAttempt(id: string): Promise<SessionType | null> {
    const document = await sessionCollection.findOneAndUpdate({ id }, { $inc: { attempt: 1 } }, { returnDocument: "after", })

    if (!document) {
      return null
    }

    return document.value   
  }
  async resetAttempt(id: string): Promise<boolean> {
    const { matchedCount } = await sessionCollection.updateOne({ id }, {
      $set: { attempt: 1, issuedAtt: new Date().toISOString() },
    })

    return matchedCount === 1   
  }
}

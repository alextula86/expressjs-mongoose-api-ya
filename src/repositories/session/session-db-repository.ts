import { sessionCollection } from '../db'
import { RepositorySessionType, SessionType } from '../../types'

export const sessionRepository: RepositorySessionType = {
  async findSession(ip, url, deviceTitle) {
    const foundSession: SessionType | null = await sessionCollection.findOne({
      $and: [{ ip }, { url }, { deviceTitle }]
    })

    if (!foundSession) {
      return null
    }

    return foundSession
  },
  async createdSession(createdSession) {
    await sessionCollection.insertOne(createdSession)

    return createdSession
  },
  async increaseAttempt(id) {
    const document = await sessionCollection.findOneAndUpdate({ id }, { $inc: { attempt: 1 } }, { returnDocument: "after", })

    if (!document) {
      return null
    }

    return document.value   
  },   
  async resetAttempt(id) {
    const { matchedCount } = await sessionCollection.updateOne({ id }, {
      $set: { attempt: 1, issuedAtt: new Date().toISOString() },
    })

    return matchedCount === 1   
  }, 
}

import { NextFunction, Request, Response } from 'express'

import { container } from '../composition-roots'
import { SessionService } from '../services'

import { HTTPStatuses } from '../types'

export const сountRequestsMiddleware = async (req: Request & any, res: Response, next: NextFunction) => {
  const ip = req.ip
  const url = req.url
  const deviceTitle = req.headers['user-agent'] || ''

  const limitSecondsRate = 10
  const maxAttemps = 5
  
  const sessionService = container.resolve(SessionService)

  const foundSession = await sessionService.findSession(ip, url, deviceTitle)

  if (!foundSession) {
    await sessionService.createdSession({ ip, url, deviceTitle })
    return next()
  }

  const currentLocalDate = Date.now()
  const sessionDate = new Date(foundSession.issuedAtt).getTime()

  const diffSeconds = (currentLocalDate - sessionDate) / 1000

  if (diffSeconds > limitSecondsRate) {
    await sessionService.resetAttempt(foundSession.id)
    return next()
  }

  const response = await sessionService.increaseAttempt(foundSession.id)

  if (!response) {
    return res.status(HTTPStatuses.SERVERERROR500).send()
  }

  if (response.attempt > maxAttemps) {
    return res.status(HTTPStatuses.MANYREQUESTS429).send()
  }

  return next()
}

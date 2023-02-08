import { NextFunction, Request, Response } from 'express'
import * as dotenv from 'dotenv'
dotenv.config()
import { UserService } from '../services'
import { UserRepository } from '../repositories/user/user-db-mongoose-repository'
import { jwtService } from '../application'
import { HTTPStatuses } from '../types'

export const authBearerMiddleware = async (req: Request & any, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(HTTPStatuses.UNAUTHORIZED401).send()
  }

  const [authType, authToken] = req.headers.authorization.split(' ')

  const userId = await jwtService.getUserIdByAccessToken(authToken)

  if (authType !== 'Bearer' || !userId) {
    return res.status(HTTPStatuses.UNAUTHORIZED401).send()
  }

  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)

  const user = await userService.findUserById(userId)

  if (!user) {
    return res.status(HTTPStatuses.UNAUTHORIZED401).send()
  }

  req.user = await userService.findUserById(userId)
  next()
}

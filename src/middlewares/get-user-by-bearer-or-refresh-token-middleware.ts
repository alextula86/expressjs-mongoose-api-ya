import { NextFunction, Request, Response } from 'express'
import * as dotenv from 'dotenv'
dotenv.config()

import { container } from '../composition-roots'
import { UserService } from '../services'

import { jwtService } from '../application'

export const getUserByBearerOrRefreshTokenMiddleware = async (req: Request & any, res: Response, next: NextFunction) => {
  const userService = container.resolve(UserService) 

  if (req.headers.authorization) {
    const [authType, authToken] = req.headers.authorization.split(' ')
    const userId = await jwtService.getUserIdByAccessToken(authToken)

    if (authType !== 'Bearer' || !userId) {
      return next()
    }
     
    const user = await userService.findUserById(userId)

    if (!user) {
      return next()
    }

    req.user = await userService.findUserById(userId) // Записать только id пользователя
    return next()
  }

  next()
}

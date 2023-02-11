import { NextFunction, Request, Response } from 'express'
import * as dotenv from 'dotenv'
dotenv.config()

import { container } from '../composition-roots'
import { UserService, AuthService } from '../services'

import { jwtService } from '../application'

export const getUserByBearerOrRefreshTokenMiddleware = async (req: Request & any, res: Response, next: NextFunction) => {
  const userService = container.resolve(UserService) 
  const authService = container.resolve(AuthService)

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

    req.user = await userService.findUserById(userId)
    return next()
  }
  
  if (req.cookies.refreshToken) {
    // Верифицируем refresh токен и получаем идентификатор пользователя
    const refreshTokenData = await authService.checkAuthRefreshToken(req.cookies.refreshToken)

    // Если идентификатор пользователя не определен, возвращаем статус 401
    if (!refreshTokenData) {
      return next()
    }

    req.user = await userService.findUserById(refreshTokenData.userId) 

    return next()
  }

  next()
}

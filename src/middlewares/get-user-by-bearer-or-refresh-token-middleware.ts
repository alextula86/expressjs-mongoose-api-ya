import { NextFunction, Request, Response } from 'express'
import * as dotenv from 'dotenv'
dotenv.config()
import { UserService, AuthService } from '../services'
import { UserRepository } from '../repositories/user/user-db-repository'
import { jwtService } from '../application'

export const getUserByBearerOrRefreshTokenMiddleware = async (req: Request & any, res: Response, next: NextFunction) => {
  if (req.headers.authorization) {
    const [authType, authToken] = req.headers.authorization.split(' ')
    const userId = await jwtService.getUserIdByAccessToken(authToken)

    if (authType !== 'Bearer' || !userId) {
      return next()
    }

    const userRepository = new UserRepository()
    const userService = new UserService(userRepository)
  
    const user = await userService.findUserById(userId)

    if (!user) {
      return next()
    }

    req.user = await userService.findUserById(userId)
    return next()
  }
  
  if (req.cookies.refreshToken) {
    const userRepository = new UserRepository()
    const userService = new UserService(userRepository)
    const authService = new AuthService(userRepository, userService)

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

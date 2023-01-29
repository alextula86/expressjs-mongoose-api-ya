import { NextFunction, Response } from 'express'
import { UserRepository } from '../repositories/user/user-db-repository'
import { AuthService, UserService } from '../services'
import { HTTPStatuses } from '../types'
import { usersErrorsValidator } from '../errors'

import { RequestWithBody, RegistrationAuthService, ErrorsMessageType } from '../types'

export const existsUserByLoginOrEmail = async (req: RequestWithBody<RegistrationAuthService>, res: Response<ErrorsMessageType>, next: NextFunction) => {
  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)
  const authService = new AuthService(userRepository, userService)

  // Ищем пользователя по логину
  const userByLogin = await authService.checkExistsUserByLoginOrEmail(req.body.login)
  // Ищем пользователя по email
  const userByEmail = await authService.checkExistsUserByLoginOrEmail(req.body.email)

  // Если пользователь по логину найден,
  // Возвращаем статус 400 и сообщение об ошибке
  if (userByLogin) {
    return res.status(HTTPStatuses.BADREQUEST400).send({ errorsMessages: [usersErrorsValidator.loginError] })
  }

  // Если пользователь по email найден,
  // Возвращаем статус 400 и сообщение об ошибке
  if (userByEmail) {
    return res.status(HTTPStatuses.BADREQUEST400).send({ errorsMessages: [usersErrorsValidator.emailError] })
  }

  next()
}

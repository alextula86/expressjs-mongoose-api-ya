import { NextFunction, Response } from 'express'

import { container } from '../composition-roots'
import { AuthService } from '../services'

import { HTTPStatuses } from '../types'
import { usersErrorsValidator } from '../errors'
import { RequestWithBody, RegistrationAuthService, ErrorsMessageType } from '../types'

export const existsUserByLoginOrEmail = async (req: RequestWithBody<RegistrationAuthService>, res: Response<ErrorsMessageType>, next: NextFunction) => {
  const authService = container.resolve(AuthService)
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

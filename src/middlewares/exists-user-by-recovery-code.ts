import { NextFunction, Response } from 'express'
import { UserRepository } from '../repositories/user/user-db-mongoose-repository'
import { AuthService, UserService } from '../services'
import { usersErrorsValidator } from '../errors'
import { HTTPStatuses } from '../types'

import { RequestWithBody, ConfirmPasswordRecoveryuthService, ErrorsMessageType } from '../types'

export const existsUserByRecoveryCode = async (req: RequestWithBody<ConfirmPasswordRecoveryuthService>, res: Response<ErrorsMessageType>, next: NextFunction) => {
  const userRepository = new UserRepository()
  const userService = new UserService(userRepository)
  const authService = new AuthService(userRepository, userService)

  // Ищем пользователя по коду востановления пароля
  const user = await authService.checkExistsRecoveryCode(req.body.recoveryCode)

  // Если пользователь по коду востановления пароля не найден,
  // Если дата для востановления пароля по коду нет или просрочена
  // Возвращаем статус 400 и сообщение об ошибке
  if (!user || user.passwordRecovery.expirationDate < new Date() || user.passwordRecovery.isRecovered) {
    return res.status(HTTPStatuses.BADREQUEST400).send({ errorsMessages: [usersErrorsValidator.codeError] })
  }

  next()
}

import { NextFunction, Response } from 'express'
import { authService } from '../services/auth-service'
import { usersErrorsValidator } from '../errors'
import { HTTPStatuses } from '../types'

import { RequestWithBody, ConfirmationCodeAuthService, ErrorsMessageType } from '../types'

export const existsUserByConfirmationCode = async (req: RequestWithBody<ConfirmationCodeAuthService>, res: Response<ErrorsMessageType>, next: NextFunction) => {
  // Ищем пользователя по коду подтверждения email
  const user = await authService.checkExistsConfirmationCode(req.body.code)

  // Если пользователь по коду подтверждения email не найден,
  // Если дата для подтверждения email по коду просрочена
  // Если email уже подтвержден
  // Возвращаем статус 400 и сообщение об ошибке
  if (!user || user.emailConfirmation.expirationDate < new Date() || user.emailConfirmation.isConfirmed) {
    return res.status(HTTPStatuses.BADREQUEST400).send({ errorsMessages: [usersErrorsValidator.codeError] })
  }

  next()
}

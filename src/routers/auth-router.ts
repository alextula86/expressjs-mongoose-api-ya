import { Router, Response, Request } from 'express'
import { userService, authService, deviceService } from '../services'
import {
  authBearerMiddleware,
  authRefreshTokenMiddleware,
  loginOrEmailUserValidation,
  passwordUserValidation,
  newPasswordUserValidation,
  loginUserValidation,
  emailUserValidation,
  codeUserValidation,
  recoveryCodeUserValidation,
  inputValidationMiddleware,
  existsUserByLoginOrEmail,
  existsUserByEmail,
  existsUserByConfirmationCode,
  existsUserByRecoveryCode,
  сountRequestsMiddleware,
} from '../middlewares'

import {
  RequestWithBody,
  AuthUserModel,
  AuthAccessTokenModel,
  CreateUserModel,
  AuthUserCodeModel,
  AuthUserEmailModel,
  AuthUserConfirmPasswordModel,
  UserViewModel,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

import { jwtService } from '../application'

import { getNextStrId } from '../utils'

export const authRouter = Router()

const middlewaresLogin = [
  сountRequestsMiddleware,
  loginOrEmailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
]

const middlewaresRegistration = [
  сountRequestsMiddleware,
  loginUserValidation,
  emailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
  existsUserByLoginOrEmail,
]

const middlewaresRefreshToken = [
  сountRequestsMiddleware,
  authRefreshTokenMiddleware,
]

const middlewaresRegistrationConfirmation = [
  сountRequestsMiddleware,
  codeUserValidation,
  existsUserByConfirmationCode,
]

const middlewaresRegistrationEmailResending = [
  сountRequestsMiddleware,
  emailUserValidation,
  existsUserByEmail,
]

const middlewaresRecoveryCode = [
  сountRequestsMiddleware,
  emailUserValidation,
  inputValidationMiddleware,
]

const middlewaresConfirmPasswordModel = [
  сountRequestsMiddleware,
  newPasswordUserValidation,
  recoveryCodeUserValidation,
  inputValidationMiddleware,
  existsUserByRecoveryCode,
]

authRouter
  // Получение данных о пользователе
  .get('/me', authBearerMiddleware, async (req: Request & any, res: Response) => {
    // Ищем пользователя по идентификатору, если пользователь не найден то Middleware вернет статус 401
    const foundUserById = await userService.findUserById(req.user.userId)
    // Если пользователь найден возвращаем статус 200 и найденного пользователя
    res.status(HTTPStatuses.SUCCESS200).send(foundUserById)
  })
  // Аутентификация пользователя
  .post('/login', middlewaresLogin, async (req: RequestWithBody<AuthUserModel>, res: Response<AuthAccessTokenModel | ErrorsMessageType>) => {
    // Проверяем правильность ввода логина/email и пароля
    const user = await authService.checkCredentials(req.body.loginOrEmail, req.body.password)

    // Если логин/email и пароль введен неверно, возвращаем статус 401
    if (!user) {
      return res.status(HTTPStatuses.UNAUTHORIZED401).send()
    }

    const deviceId = getNextStrId()

    // Формируем access и refresh токены
    const { accessToken, refreshToken } = await authService.createUserAuthTokens(user.id, deviceId)

    const refreshTokenData = await jwtService.getRefreshTokenData(refreshToken)

    if (!refreshTokenData) {
      return res.status(HTTPStatuses.UNAUTHORIZED401).send()
    }

    await deviceService.createdDevice({
      id: deviceId,
      ip: req.ip,
      title: req.headers['user-agent'] || '',
      lastActiveDate: new Date(refreshTokenData.expRefreshToken).toISOString(),
      userId: user.id,
    })

    // Обновляем refresh токен у пользователя
    await authService.updateRefreshTokenByUserId(user.id, refreshToken)

    // Записываем refresh токен в cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })

    // Возвращаем статус 200 и сформированный access токен
    res.status(HTTPStatuses.SUCCESS200).send({ accessToken })
  })
  .post('/refresh-token', middlewaresRefreshToken, async (req: Request & any, res: Response) => {
    // Формируем access и refresh токены
    const { accessToken, refreshToken } = await authService.createUserAuthTokens(req.user.userId, req.device.id)

    // Обновляем refresh токен у пользователя
    await authService.updateRefreshTokenByUserId(req.user.userId, refreshToken)

    const refreshTokenData = await jwtService.getRefreshTokenData(refreshToken)

    if (!refreshTokenData) {
      return res.status(HTTPStatuses.UNAUTHORIZED401).send()
    }

    // Обновляем дату у устройства
    await deviceService.updateLastActiveDateDevice(req.device.id, new Date(refreshTokenData.expRefreshToken).toISOString())

    // Пишем новый refresh токен в cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })

    // Возвращаем статус 200 и сформированный новый access токен
    res.status(HTTPStatuses.SUCCESS200).send({ accessToken })
  })
  .post('/logout', authRefreshTokenMiddleware, async (req: Request & any, res: Response) => {
    // Удаляем refresh токен
    await authService.updateRefreshTokenByUserId(req.user.userId, '')
    await deviceService.deleteDeviceById(req.device.id)

    // Удаляем refresh токен из cookie
    res.clearCookie('refreshToken')

    // Возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  })  
  // Регистрация пользователя
  .post('/registration', middlewaresRegistration, async (req: RequestWithBody<CreateUserModel>, res: Response<UserViewModel | ErrorsMessageType>) => {
    // Добавляем пользователя и отправляем письмо с кодом для подтверждения регистрации
    const user = await authService.registerUser({
      login: req.body.login,
      password: req.body.password,
      email: req.body.email,
    })

    // Если по каким-либо причинам email с кодом не отправлен и пользователь не создался возвращаем статус 400
    if (!user) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // В случае отправки email с кодом и создания пользователя возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  })
  // Подтверждение email по коду
  .post('/registration-confirmation', middlewaresRegistrationConfirmation, async (req: RequestWithBody<AuthUserCodeModel>, res: Response<UserViewModel | ErrorsMessageType>) => {
    // Отправляем код подтверждения email
    const isConfirmed = await authService.confirmEmail(req.body.code)

    // Если код подтверждения email не отправлен, возвращаем статус 400
    if (!isConfirmed) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // Если код подтверждения email отправлен успешно, возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  })
  // Повторная отправка кода подтверждения email
  .post('/registration-email-resending', middlewaresRegistrationEmailResending, async (req: RequestWithBody<AuthUserEmailModel>, res: Response<UserViewModel | ErrorsMessageType>) => {
    // Повторно формируем код подтверждения email, обновляем код у пользователя и отправляем письмо
    const isResending = await authService.resendingCode(req.body.email)

    // Если новый код подтверждения email не сформирован или не сохранен для пользователя или письмо не отправлено,
    // возвращаем статус 400
    if (!isResending) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // Если новый код подтверждения email сформирован, сохранен для пользователя и письмо отправлено,
    // возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  })
  // Восстановление пароля с помощью подтверждения по электронной почте. 
  .post('/password-recovery', middlewaresRecoveryCode, async (req: RequestWithBody<AuthUserEmailModel>, res: Response<UserViewModel | ErrorsMessageType>) => {
    // Проверяем зарегистрирован ли пользователь в системе
    const user = await authService.checkExistsUserByLoginOrEmail(req.body.email)
    // Если пользователь не зарегестрирован, возвращаем статус 204 для предотвращения обнаружения электронной почты пользователя
    if (!user) {
      return res.status(HTTPStatuses.NOCONTENT204).send()
    }
    
    // Формируем код востановления пароля, обновляем его у пользователя и отправляем письмо
    const isPasswordRecovery = await authService.passwordRecoveryCode(req.body.email)

    // Если код востановления пароля не сформирован или не сохранен для пользователя или письмо не отправлено,
    // возвращаем статус 400
    if (!isPasswordRecovery) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // Если код востановления пароля сформирован, сохранен для пользователя и письмо отправлено,
    // возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  })
  // Подтверждение восстановление пароля
  .post('/new-password', middlewaresConfirmPasswordModel, async (req: RequestWithBody<AuthUserConfirmPasswordModel>, res: Response<UserViewModel | ErrorsMessageType>) => {
    // Обновляем пароль пользователя
    const isUpdatedUserPassword = await authService.updatedUserPassword(req.body.newPassword, req.body.recoveryCode)

    // Если пароль не обновился возвращаем статус 400
    if (!isUpdatedUserPassword) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // В случае успешного обновления пароля пользователя возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  })

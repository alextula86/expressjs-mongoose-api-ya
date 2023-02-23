import { Request, Response } from 'express'
import { injectable } from 'inversify'
import { UserService, AuthService, DeviceService } from '../services'

import {
  RequestWithBody,
  ResponseViewModelDetail,
  AuthUserModel,
  UserAuthViewModel,
  AuthAccessTokenModel,
  CreateUserModel,
  AuthUserCodeModel,
  AuthUserEmailModel,
  AuthUserConfirmPasswordModel,
  UserType,
  UserViewModel,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

import { usersErrorsValidator } from '../errors'
import { jwtService } from '../application'
import { getNextStrId } from '../utils'

@injectable()
export class AuthController {
  constructor(
    protected authService: AuthService,
    protected userService: UserService,
    protected deviceService: DeviceService,
    ) {}
  async me(req: Request & any, res: Response<UserAuthViewModel>) {
    // Ищем пользователя по идентификатору, если пользователь не найден, то Middleware вернет статус 401
    const foundUserById = await this.userService.findUserById(req.user.userId)
    // Если пользователь по идентификатору не найден, возвращаем статус 401
    if (!foundUserById) {
      return res.status(HTTPStatuses.UNAUTHORIZED401).send()
    }
    
    // Если пользователь найден возвращаем статус 200 и найденного пользователя
    res.status(HTTPStatuses.SUCCESS200).send(this._getUserAuthViewModel(foundUserById))
  }
  async login(req: RequestWithBody<AuthUserModel>, res: Response<AuthAccessTokenModel | ErrorsMessageType>) {
    // Проверяем правильность ввода логина/email и пароля
    const user = await this.authService.checkCredentials(req.body.loginOrEmail, req.body.password)

    // Если логин/email и пароль введен неверно, возвращаем статус 401
    if (!user) {
      return res.status(HTTPStatuses.UNAUTHORIZED401).send()
    }

    const deviceId = getNextStrId()

    // Формируем access и refresh токены
    const { accessToken, refreshToken } = await this.authService.createUserAuthTokens(user.id, deviceId)

    const refreshTokenData = await jwtService.getRefreshTokenData(refreshToken)

    if (!refreshTokenData) {
      return res.status(HTTPStatuses.UNAUTHORIZED401).send()
    }

    await this.deviceService.createdDevice({
      id: deviceId,
      ip: req.ip,
      title: req.headers['user-agent'] || '',
      lastActiveDate: new Date(refreshTokenData.expRefreshToken).toISOString(),
      userId: user.id,
    })

    // Обновляем refresh токен у пользователя
    await this.authService.updateRefreshTokenByUserId(user.id, refreshToken)

    // Записываем refresh токен в cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })

    // Возвращаем статус 200 и сформированный access токен
    res.status(HTTPStatuses.SUCCESS200).send({ accessToken })
  }
  async refreshToken(req: Request & any, res: Response) {
    // Формируем access и refresh токены
    const { accessToken, refreshToken } = await this.authService.createUserAuthTokens(req.user.userId, req.device.id)

    // Обновляем refresh токен у пользователя
    await this.authService.updateRefreshTokenByUserId(req.user.userId, refreshToken)

    const refreshTokenData = await jwtService.getRefreshTokenData(refreshToken)

    if (!refreshTokenData) {
      return res.status(HTTPStatuses.UNAUTHORIZED401).send()
    }

    // Обновляем дату у устройства
    await this.deviceService.updateLastActiveDateDevice(req.device.id, new Date(refreshTokenData.expRefreshToken).toISOString())

    // Пишем новый refresh токен в cookie
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: true })

    // Возвращаем статус 200 и сформированный новый access токен
    res.status(HTTPStatuses.SUCCESS200).send({ accessToken })
  }
  async logout(req: Request & any, res: Response) {
    // Удаляем refresh токен
    await this.authService.updateRefreshTokenByUserId(req.user.userId, '')
    await this.deviceService.deleteDeviceById(req.device.id)

    // Удаляем refresh токен из cookie
    res.clearCookie('refreshToken')

    // Возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async registration(req: RequestWithBody<CreateUserModel>, res: Response<UserViewModel | ErrorsMessageType>) {
    // Добавляем пользователя и отправляем письмо с кодом для подтверждения регистрации
    const user = await this.authService.registerUser({
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
  }
  async registrationConfirmation(req: RequestWithBody<AuthUserCodeModel>, res: Response<UserViewModel | ErrorsMessageType>) {
    // Отправляем код подтверждения email
    const isConfirmed = await this.authService.confirmEmail(req.body.code)

    // Если пользователь по коду подтверждения email не найден,
    // Если дата для подтверждения email по коду просрочена
    // Если email уже подтвержден
    // Возвращаем статус 400 и сообщение об ошибке
    if (!isConfirmed) {
      return res.status(HTTPStatuses.BADREQUEST400).send({ errorsMessages: [usersErrorsValidator.codeError] })
    }

    // Если код подтверждения email отправлен успешно, возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async registrationEmailResending(req: RequestWithBody<AuthUserEmailModel>, res: Response<UserViewModel | ErrorsMessageType>) {
    // Повторно формируем код подтверждения email, обновляем код у пользователя и отправляем письмо
    const isResending = await this.authService.resendingCode(req.body.email)

    // Если новый код подтверждения email не сформирован или не сохранен для пользователя или письмо не отправлено,
    // возвращаем статус 400
    if (!isResending) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // Если новый код подтверждения email сформирован, сохранен для пользователя и письмо отправлено,
    // возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async passwordRecovery(req: RequestWithBody<AuthUserEmailModel>, res: Response<UserViewModel | ErrorsMessageType>) {
    // Проверяем зарегистрирован ли пользователь в системе
    const user = await this.authService.checkExistsUserByLoginOrEmail(req.body.email)
    // Если пользователь не зарегестрирован, возвращаем статус 204 для предотвращения обнаружения электронной почты пользователя
    if (!user) {
      return res.status(HTTPStatuses.NOCONTENT204).send()
    }
    
    // Формируем код востановления пароля, обновляем его у пользователя и отправляем письмо
    const isPasswordRecovery = await this.authService.passwordRecoveryCode(req.body.email)

    // Если код востановления пароля не сформирован или не сохранен для пользователя или письмо не отправлено,
    // возвращаем статус 400
    if (!isPasswordRecovery) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // Если код востановления пароля сформирован, сохранен для пользователя и письмо отправлено,
    // возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async newPassword(req: RequestWithBody<AuthUserConfirmPasswordModel>, res: Response<UserViewModel | ErrorsMessageType>) {
    // Обновляем пароль пользователя
    const isUpdatedUserPassword = await this.authService.updatedUserPassword(req.body.newPassword, req.body.recoveryCode)

    // Если пароль не обновился возвращаем статус 400
    if (!isUpdatedUserPassword) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    // В случае успешного обновления пароля пользователя возвращаем статус 204
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  _getUserAuthViewModel(dbUser: UserType): UserAuthViewModel {
    return {
      userId: dbUser.id,
      login: dbUser.accountData.login,
      email: dbUser.accountData.email,
    }
  }
}

import { injectable, inject } from 'inversify'
import bcrypt from 'bcrypt'
import { add } from 'date-fns'
import { UserService } from './user-service'
import { UserRepository } from '../repositories'
import { jwtService } from '../application'
import { emailManager } from '../managers'
import { generateUUID } from '../utils'
import { UserModel } from '../models'

import {
  UserType,
  CreaetUserService,
} from '../types'

@injectable()
export class AuthService {
  constructor(
    @inject(UserRepository) protected userRepository: UserRepository, 
    @inject(UserService) protected userService: UserService
  ) {}
  // Регистрация пользователя
  async registerUser({
    login,
    password,
    email,
  }: CreaetUserService): Promise<UserType | null> {
    // Формируем соль
    const passwordSalt = bcrypt.genSaltSync(10)
    // Формируем хэш пароля
    const passwordHash = await this.userService._generateHash(password, passwordSalt)
    // Создаем пользователя
    const madeUser = UserModel.make(login, passwordHash, email)
    // Сохраняем пользователя в базе
    const registeredUser = await this.userRepository.save(madeUser)

    try {
      // Отправляем код подтверждения email
      await emailManager.sendEmailCreatedUser(registeredUser.accountData.email, registeredUser.emailConfirmation.confirmationCode)
      // Возвращаем сформированного пользователя
      return registeredUser
    } catch (error) {
      // Если письмо не отправилось, то удаляем добавленного пользователя
      await this.userRepository.deleteUserById(registeredUser.id)
      // Возвращаем null
      return null
    }
  }
  async checkCredentials(loginOrEmail: string, password: string): Promise<UserType | null> {
    const user = await this.userRepository.findByLoginOrEmail(loginOrEmail)

    if (!user) {
      return null
    }

    const passwordSalt = user.accountData.passwordHash.slice(0, 29)
    const passwordHash = await this._generateHash(password, passwordSalt)

    if (passwordHash !== user.accountData.passwordHash) {
      return null
    }

    return user
  }
  // Верификация refresh токен
  async checkRefreshToken(token: string): Promise<{ userId: string, deviceId: string } | null> {
    // Если refresh токен не передан, останавливаем выполнение
    if (!token) {
      return null
    }

    // Получаем идентификатор пользователя и устройства по refresh токену
    const refreshTokenData = await jwtService.getRefreshTokenData(token)

    // Если идентификатор пользователя и устройства не найдены, останавливаем выполнение
    if (!refreshTokenData) {
      return null
    }

    // Получаем refresh токен пользователя
    const foundRefreshToken = await this.userRepository.findRefreshTokenByUserId(refreshTokenData.userId)

    // Если refresh токен по идентификатору пользователя не найден, останавливаем выполнение
    if (!foundRefreshToken) {
      return null
    }

    // Если переданный refresh токен не равен refresh токену пользователя, останавливаем выполнение
    if (foundRefreshToken.refreshToken !== token) {
      return null
    }

    return refreshTokenData
  }
  // Верификация refresh токен
  async checkAuthRefreshToken(token: string): Promise<{ userId: string, deviceId: string, expRefreshToken: number } | null> {
    // Если refresh токен не передан, останавливаем выполнение
    if (!token) {
      return null
    }

    // Получаем идентификатор пользователя и устройства по refresh токену
    const refreshTokenData = await jwtService.getRefreshTokenData(token)

    // Если идентификатор пользователя и устройства не найдены, останавливаем выполнение
    if (!refreshTokenData) {
      return null
    }

    return refreshTokenData
  }
  // Удаление refresh токен
  async updateRefreshTokenByUserId(userId: string, refreshToken: string): Promise<boolean> {
    // Удаляем refresh токен
    const isUpdatedRefreshToken = await this.userRepository.updateRefreshTokenByUserId(userId, refreshToken)

    // Возвращаем обновлен(true) / не обновлен(false)
    return isUpdatedRefreshToken
  }
  // Подтверждение email по коду
  async confirmEmail(code: string): Promise<boolean> {
    // Ищем пользователя по коду подтверждения email
    const user = await this.userRepository.findByConfirmationCode(code)

    // Если пользователь по коду подтверждения email не найден, возвращаем false
    if (!user) {
      return false
    }

    // Если дата для подтверждения email по коду просрочена
    // Если email уже подтвержден
    // Возвращаем false
    if (!user.canBeConfirmed()) {
      return false
    }

    // Обновляем признак подтвержения
    user.confirm()
    const createdUser = await this.userRepository.save(user)

    // Возвращаем подтвержен(true)
    return !!createdUser
  }
  // Повторная отправка кода подтверждения email
  async resendingCode(email: string): Promise<boolean> {
    // Генерируем код для подтверждения email
    const confirmationCode = generateUUID()

    // Обновляем код подтвержения
    const isUpdatedConfirmationCode = await this.userRepository.updateConfirmationCodeByEmail(email, confirmationCode)

    try {
      // Если обновление кода подтверждения email прошло успешно, отправляем письмо
      if (isUpdatedConfirmationCode) {
        await emailManager.sendEmailCreatedUser(email, confirmationCode)
      }
      // Возвращаем результат обнорвления кода подтверждения email
      return isUpdatedConfirmationCode
    } catch (error) {
      // Возвращаем false
      return false
    }
  }
  // Отправка кода для востановления пароля
  async passwordRecoveryCode(email: string): Promise<boolean> {
    // Генерируем код для востановления пароля 
    const recoveryCode = generateUUID()
    // Генерируем дату истечения востановления пароля
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 })
    // Обновляем код востановления пароля 
    const isUpdateRecoveryCodeByEmail = await this.userRepository.updateRecoveryCodeByEmail(email, recoveryCode, expirationDate)

    try {
      // Если обновление кода подтверждения email прошло успешно, отправляем письмо
      if (isUpdateRecoveryCodeByEmail) {
        await emailManager.sendEmailWithRecoveryCode(email, recoveryCode)
      }
      // Возвращаем результат обнорвления кода востановления пароля
      return isUpdateRecoveryCodeByEmail
    } catch (error) {
      // Возвращаем false
      return false
    }
  }
  async updatedUserPassword(newPassword: string, recoveryCode: string): Promise<boolean> {
    const passwordSalt = await bcrypt.genSaltSync(10)
    const passwordHash = await this._generateHash(newPassword, passwordSalt)
    
    const isUpdatedUserPassword = await this.userRepository.updatedUserPassword(passwordHash, recoveryCode)

    return isUpdatedUserPassword
  }
  // Проверяем существует ли пользователь по логину
  async checkExistsUserByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
    const user = await this.userRepository.findByLoginOrEmail(loginOrEmail)

    if (!user) {
      return null
    }

    return user
  }
  // Проверяем существует ли пользователь по email
  async checkExistsUserByEmail(email: string): Promise<UserType | null> {
    const user = await this.userRepository.findByLoginOrEmail(email)

    if (!user) {
      return null
    }

    return user
  }
  // Проверяем существует ли пользователь по коду подтверждения email
  async checkExistsConfirmationCode(confirmationCode: string): Promise<UserType | null> {
    const user = await this.userRepository.findByConfirmationCode(confirmationCode)

    if (!user) {
      return null
    }

    return user
  }
  // Проверяем существует ли пользователь по коду востановления пароля
  async checkExistsRecoveryCode(recoveryCode: string): Promise<UserType | null> {
    const user = await this.userRepository.findByRecoveryCode(recoveryCode)

    if (!user) {
      return null
    }

    return user
  }
  async createUserAuthTokens(userId: string, deviceId: string): Promise<{ accessToken: string, refreshToken: string }> {
    // Формируем access токен
    const accessToken = await jwtService.createAccessToken(userId)
    // Формируем refresh токен
    const refreshToken = await jwtService.createRefreshToken(userId, deviceId)

    return { accessToken, refreshToken }
  }
  // Формируем hash из пароля и его соли
  async _generateHash(password: string, salt: string): Promise<string> {
    const hash = await bcrypt.hash(password, salt)
    return hash
  }
}

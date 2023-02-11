import { injectable, inject } from 'inversify'
import { trim } from 'lodash'
import bcrypt from 'bcrypt'
import { add } from 'date-fns'
import { UserService } from './user-service'
import { UserRepository } from '../repositories/user/user-db-mongoose-repository'
import { jwtService } from '../application'
import { emailManager } from '../managers'
import { getNextStrId, generateUUID } from '../utils'

import {
  UserType,
  UserViewModel,
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
  }: CreaetUserService): Promise<UserViewModel | null> {
    // Формируем соль
    const passwordSalt = bcrypt.genSaltSync(10)
    // Формируем хэш пароля
    const passwordHash = await this.userService._generateHash(password, passwordSalt)
    // Генерируем код для подтверждения email
    const confirmationCode = generateUUID()
    // Формируем пользователя
    const newUser: UserType = {
      id: getNextStrId(),
      accountData: {
        login: trim(String(login)),
        email: trim(String(email)),
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode,
        expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
        isConfirmed: false,
      },
      passwordRecovery: {
        recoveryCode: '',
        expirationDate: new Date(),
        isRecovered: true,
      },
      refreshToken: '',
    }

    // Создаем пользователя
    const registeredUser = await this.userRepository.createdUser(newUser)

    try {
      // Отправляем код подтверждения email
      await emailManager.sendEmailCreatedUser(newUser.accountData.email, confirmationCode)
      // Возвращаем сформированного пользователя
      return registeredUser
    } catch (error) {
      // Если письмо не отправилось, то удаляем добавленного пользователя
      await this.userRepository.deleteUserById(newUser.id)
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
    // Обновляем признак подтвержения по коду подтверждения
    const isConfirmed = await this.userRepository.updateConfirmationByCode(code)

    // Возвращаем подтвержен(true) / не подтвержден(false)
    return isConfirmed
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

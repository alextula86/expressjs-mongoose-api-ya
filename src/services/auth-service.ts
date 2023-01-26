import { trim } from 'lodash'
import bcrypt from 'bcrypt'
import { add } from 'date-fns'
import { userService } from './user-service'
import { userRepository } from '../repositories/user/user-db-repository'
import { jwtService } from '../application'
import { emailManager } from '../managers'
import { getNextStrId, generateUUID } from '../utils'
import { UserType, ServiceAuthType } from '../types'

export const authService: ServiceAuthType = {
  // Регистрация пользователя
  async registerUser({ login, password, email }) {
    // Формируем соль
    const passwordSalt = bcrypt.genSaltSync(10)
    // Формируем хэш пароля
    const passwordHash = await userService._generateHash(password, passwordSalt)
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
    const registeredUser = await userRepository.createdUser(newUser)

    try {
      // Отправляем код подтверждения email
      await emailManager.sendEmailCreatedUser(newUser.accountData.email, confirmationCode)
      // Возвращаем сформированного пользователя
      return registeredUser
    } catch (error) {
      // Если письмо не отправилось, то удаляем добавленного пользователя
      await userRepository.deleteUserById(newUser.id)
      // Возвращаем null
      return null
    }
  },
  async checkCredentials(loginOrEmail, password) {
    const user = await userRepository.findByLoginOrEmail(loginOrEmail)

    if (!user) {
      return null
    }

    const passwordSalt = user.accountData.passwordHash.slice(0, 29)
    const passwordHash = await this._generateHash(password, passwordSalt)

    if (passwordHash !== user.accountData.passwordHash) {
      return null
    }

    return user
  },
  // Верификация refresh токен
  async checkRefreshToken(token) {
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
    const foundRefreshToken = await userRepository.findRefreshTokenByUserId(refreshTokenData.userId)

    // Если refresh токен по идентификатору пользователя не найден, останавливаем выполнение
    if (!foundRefreshToken) {
      return null
    }

    // Если переданный refresh токен не равен refresh токену пользователя, останавливаем выполнение
    if (foundRefreshToken.refreshToken !== token) {
      return null
    }

    return refreshTokenData
  },
  // Верификация refresh токен
  async checkAuthRefreshToken(token) {
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
  },
  // Удаление refresh токен
  async updateRefreshTokenByUserId(userId, refreshToken) {
    // Удаляем refresh токен
    const isUpdatedRefreshToken = await userRepository.updateRefreshTokenByUserId(userId, refreshToken)

    // Возвращаем обновлен(true) / не обновлен(false)
    return isUpdatedRefreshToken
  },
  // Подтверждение email по коду
  async confirmEmail(code) {
    // Обновляем признак подтвержения по коду подтверждения
    const isConfirmed = await userRepository.updateConfirmationByCode(code)

    // Возвращаем подтвержен(true) / не подтвержден(false)
    return isConfirmed
  },
  // Повторная отправка кода подтверждения email
  async resendingCode(email) {
    // Генерируем код для подтверждения email
    const confirmationCode = generateUUID()

    // Обновляем код подтвержения
    const isUpdatedConfirmationCode = await userRepository.updateConfirmationCodeByEmail(email, confirmationCode)

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
  },
  // Отправка кода для востановления пароля
  async passwordRecoveryCode(email) {
    // Генерируем код для востановления пароля 
    const recoveryCode = generateUUID()
    // Генерируем дату истечения востановления пароля
    const expirationDate = add(new Date(), { hours: 1, minutes: 30 })
    // Обновляем код востановления пароля 
    const isUpdateRecoveryCodeByEmail = await userRepository.updateRecoveryCodeByEmail(email, recoveryCode, expirationDate)

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
  },
  async updatedUserPassword(newPassword, recoveryCode) {
    const passwordSalt = await bcrypt.genSaltSync(10)
    const passwordHash = await this._generateHash(newPassword, passwordSalt)
    
    const isUpdatedUserPassword = await userRepository.updatedUserPassword(passwordHash, recoveryCode)

    return isUpdatedUserPassword
  },  
  // Проверяем существует ли пользователь по логину
  async checkExistsUserByLoginOrEmail(loginOrEmail) {
    const user = await userRepository.findByLoginOrEmail(loginOrEmail)

    if (!user) {
      return null
    }

    return user
  },
  // Проверяем существует ли пользователь по email
  async checkExistsUserByEmail(email) {
    const user = await userRepository.findByLoginOrEmail(email)

    if (!user) {
      return null
    }

    return user
  },
  // Проверяем существует ли пользователь по коду подтверждения email
  async checkExistsConfirmationCode(confirmationCode) {
    const user = await userRepository.findByConfirmationCode(confirmationCode)

    if (!user) {
      return null
    }

    return user
  },
  // Проверяем существует ли пользователь по коду востановления пароля
  async checkExistsRecoveryCode(recoveryCode) {
    const user = await userRepository.findByRecoveryCode(recoveryCode)

    if (!user) {
      return null
    }

    return user
  },  
  async createUserAuthTokens(userId, deviceid) {
    // Формируем access токен
    const accessToken = await jwtService.createAccessToken(userId)
    // Формируем refresh токен
    const refreshToken = await jwtService.createRefreshToken(userId, deviceid)

    return { accessToken, refreshToken }
  },
  // Формируем hash из пароля и его соли
  async _generateHash(password, salt) {
    const hash = await bcrypt.hash(password, salt)
    return hash
  },
}

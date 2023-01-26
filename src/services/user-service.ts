import { trim } from 'lodash'
import bcrypt from 'bcrypt'
import { userRepository } from '../repositories/user/user-db-repository'
import { getNextStrId, generateUUID } from '../utils'
import { UserType, SortDirection, ServiceUserType } from '../types'

export const userService: ServiceUserType = {
  async findAllUsers({
    searchLoginTerm,
    searchEmailTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }) {
    const foundAllUsers = await userRepository.findAllUsers({
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    })

    return foundAllUsers
  },
  async findUserById(id) {
    const foundUserById = await userRepository.findUserById(id)

    return foundUserById
  },
  async createdUser({ login, password, email }) {
    const passwordSalt = await bcrypt.genSaltSync(10)
    const passwordHash = await this._generateHash(password, passwordSalt)
    
    const newUser: UserType = {
      id: getNextStrId(),
      accountData: {
        login: trim(String(login)),
        email: trim(String(email)),
        passwordHash,
        createdAt: new Date().toISOString(),
      },
      emailConfirmation: {
        confirmationCode: generateUUID(),
        expirationDate: new Date(),
        isConfirmed: true,
      },
      passwordRecovery: {
        recoveryCode: '',
        expirationDate: new Date(),
        isRecovered: true
      },
      refreshToken: '',
    }

    const createdUser = await userRepository.createdUser(newUser)

    return createdUser
  },
  async deleteUserById(id) {
    const isDeleteUserById = await userRepository.deleteUserById(id)

    return isDeleteUserById
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
  async _generateHash(password, salt) {
    const hash = await bcrypt.hash(password, salt)
    return hash
  }
}

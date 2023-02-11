import { injectable, inject } from 'inversify'
import { trim } from 'lodash'
import bcrypt from 'bcrypt'
import { UserRepository } from '../repositories/user/user-db-mongoose-repository'
import { generateUUID } from '../utils'

import {
  UserType,
  UserViewModel,
  UserAuthViewModel,
  QueryUserModel,
  CreaetUserService,
  ResponseViewModelDetail,
  SortDirection,
} from '../types'

@injectable()
export class UserService {
  constructor(@inject(UserRepository) protected userRepository: UserRepository) {}
  async findAllUsers({
    searchLoginTerm,
    searchEmailTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryUserModel): Promise<ResponseViewModelDetail<UserViewModel>> {
    const foundAllUsers = await this.userRepository.findAllUsers({
      searchLoginTerm,
      searchEmailTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    })

    return foundAllUsers
  }
  async findUserById(id: string): Promise<UserAuthViewModel | null> {
    const foundUserById = await this.userRepository.findUserById(id)

    return foundUserById
  }
  async createdUser({ login, password, email }: CreaetUserService): Promise<UserViewModel> {
    const passwordSalt = await bcrypt.genSaltSync(10)
    const passwordHash = await this._generateHash(password, passwordSalt)
    
    const accountData = {
      login: trim(String(login)),
      email: trim(String(email)),
      passwordHash,
      createdAt: new Date().toISOString(),
    }

    const emailConfirmation = {
      confirmationCode: generateUUID(),
      expirationDate: new Date(),
      isConfirmed: true,
    }

    const passwordRecovery = {
      recoveryCode: '',
      expirationDate: new Date(),
      isRecovered: true
    }

    const refreshToken = ''

    const newUser = new UserType(accountData, emailConfirmation, passwordRecovery, refreshToken)
    const createdUser = await this.userRepository.createdUser(newUser)

    return createdUser
  }
  async deleteUserById(id: string): Promise<boolean> {
    const isDeleteUserById = await this.userRepository.deleteUserById(id)

    return isDeleteUserById
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
  async _generateHash(password: string, salt: string): Promise<string> {
    const hash = await bcrypt.hash(password, salt)
    return hash
  }
}

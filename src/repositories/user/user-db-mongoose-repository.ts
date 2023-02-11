import { injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { UserModel } from '../db-mongoose'

import {
  UserType,
  UserViewModel,
  UserAuthViewModel,
  QueryUserModel,
  ResponseViewModelDetail,
  SortDirection,
} from '../../types'

@injectable()
export class UserRepository {
  async findAllUsers({
    searchLoginTerm,
    searchEmailTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryUserModel): Promise<ResponseViewModelDetail<UserViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10

    const query: any = []
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    if (searchLoginTerm) {
      query.push({ 'accountData.login': { $regex: searchLoginTerm, $options: 'i' } })
    }

    if (searchEmailTerm) {
      query.push({ 'accountData.email': { $regex: searchEmailTerm, $options: 'i' } })
    }

    const filter = !isEmpty(query) ? { $or: query } : {}
 
    const totalCount = await UserModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const users: UserType[] = await UserModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean()

    return this._getUsersViewModelDetail({
      items: users,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  }
  async findUserById(id: string): Promise<UserAuthViewModel | null> {
    const foundUser: UserType | null = await UserModel.findOne({ id })

    if (!foundUser) {
      return null
    }

    return this._getUserAuthViewModel(foundUser)
  }
  async findRefreshTokenByUserId(userId: string): Promise<{ refreshToken: string } | null> {
    const foundUser: UserType | null = await UserModel.findOne({ 'id': userId })

    if (!foundUser) {
      return null
    }

    return { refreshToken: foundUser.refreshToken }
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
    const foundUser: UserType | null = await UserModel.findOne({ $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }] })

    if (!foundUser) {
      return null
    }

    return foundUser
  }
  async findByConfirmationCode(code: string): Promise<UserType | null> {
    const foundUser: UserType | null = await UserModel.findOne({ 'emailConfirmation.confirmationCode': code })

    if (!foundUser) {
      return null
    }

    return foundUser
  }
  async findByRecoveryCode(code: string): Promise<UserType | null> {
    const foundUser: UserType | null = await UserModel.findOne({ 'passwordRecovery.recoveryCode': code })

    if (!foundUser) {
      return null
    }

    return foundUser
  }
  async createdUser(createdUser: UserType): Promise<UserViewModel> {
    await UserModel.create(createdUser)

    return this._getUserViewModel(createdUser)
  }
  async deleteUserById(id: string): Promise<boolean> {
    const { deletedCount } = await UserModel.deleteOne({ id })

    return deletedCount === 1
  }
  async updateConfirmationByCode(code: string): Promise<boolean> {
    const result = await UserModel.updateOne({ 'emailConfirmation.confirmationCode': code }, {
      $set: {
        'emailConfirmation.isConfirmed': true
      }
    })

    return result.modifiedCount === 1
  }
  async updateConfirmationCodeByEmail(email: string, code: string): Promise<boolean> {
    const result = await UserModel.updateOne({ 'accountData.email': email }, {
      $set: {
        'emailConfirmation.confirmationCode': code
      }
    })

    return result.modifiedCount === 1
  }
  async updateRecoveryCodeByEmail(email: string, recoveryCode: string, expirationDate: Date): Promise<boolean> {
    const result = await UserModel.updateOne({ 'accountData.email': email }, {
      $set: {
        'passwordRecovery.recoveryCode': recoveryCode,
        'passwordRecovery.expirationDate': expirationDate,
        'passwordRecovery.isRecovered': false,
      }
    })

    return result.modifiedCount === 1
  }
  async updatedUserPassword(passwordHash: string, recoveryCode: string): Promise<boolean> {
    const result = await UserModel.updateOne({ 'passwordRecovery.recoveryCode': recoveryCode }, {
      $set: {
        'accountData.passwordHash': passwordHash,
        'passwordRecovery.isRecovered': true,
      }
    })

    return result.modifiedCount === 1
  }
  async updateRefreshTokenByUserId(userId: string, refreshToken: string): Promise<boolean> {
    const result = await UserModel.updateOne({ 'id': userId }, {
      $set: {
        refreshToken,
      }
    })

    return result.modifiedCount === 1
  }
  _getUserViewModel(dbUser: UserType): UserViewModel {
    return {
      id: dbUser.id,
      login: dbUser.accountData.login,
      email: dbUser.accountData.email,
      createdAt: dbUser.accountData.createdAt,
    }
  }
  _getUsersViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<UserType>): ResponseViewModelDetail<UserViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        login: item.accountData.login,
        email: item.accountData.email,
        createdAt: item.accountData.createdAt,
      })),
    }
  }
  _getUserAuthViewModel(dbUser: UserType): UserAuthViewModel {
    return {
      userId: dbUser.id,
      login: dbUser.accountData.login,
      email: dbUser.accountData.email,
    }
  }
}

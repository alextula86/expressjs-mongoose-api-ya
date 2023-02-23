import { injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { UserModel, UserHydratedDocumentType } from '../models'

import {
  UserType,
  QueryUserModel,
  ResponseViewModelDetail,
  SortDirection,
} from '../types'

@injectable()
export class UserRepository {
  async findAllUsers({
    searchLoginTerm,
    searchEmailTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryUserModel): Promise<ResponseViewModelDetail<UserType>> {
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

    return {
      items: users,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    }
  }
  async findUserById(id: string): Promise<UserType | null> {
    const foundUser: UserType | null = await UserModel.findOne({ id })

    if (!foundUser) {
      return null
    }

    return foundUser
  }
  async findRefreshTokenByUserId(userId: string): Promise<{ refreshToken: string } | null> {
    const foundUser: UserType | null = await UserModel.findOne({ 'id': userId })

    if (!foundUser) {
      return null
    }

    return { refreshToken: foundUser.refreshToken }
  }
  async findByLoginOrEmail(loginOrEmail: string): Promise<UserType | null> {
    const foundUser = await UserModel.findOne({ $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }] })

    if (!foundUser) {
      return null
    }

    return foundUser
  }
  async findByConfirmationCode(code: string) {
    const foundUser = await UserModel.findOne({ 'emailConfirmation.confirmationCode': code })

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
  async save(user: UserHydratedDocumentType): Promise<UserHydratedDocumentType> {
    return await user.save()
  }
  async createdUser(createdUser: UserType): Promise<UserType> {
    await UserModel.create(createdUser)

    return createdUser
  }
  async deleteUserById(id: string): Promise<boolean> {
    const { deletedCount } = await UserModel.deleteOne({ id })

    return deletedCount === 1
  }
  /*async updateConfirmation(userId: string): Promise<boolean> {
    const user = await UserModel.findOne({ id: userId })
    user!.emailConfirmation.isConfirmed = true
    await this.save(user)
    return true
  }*/
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
}

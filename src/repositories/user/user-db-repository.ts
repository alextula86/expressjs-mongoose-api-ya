import { isEmpty } from 'lodash'
import { userCollection } from '../db'
import { RepositoryUserType, SortDirection, UserType } from '../../types'

export const userRepository: RepositoryUserType = {
  async findAllUsers({
    searchLoginTerm,
    searchEmailTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }) {
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
 
    const totalCount = await userCollection.count(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const users: UserType[] = await userCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .toArray()

    return this._getUsersViewModelDetail({
      items: users,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  },
  async findUserById(id) {
    const foundUser: UserType | null = await userCollection.findOne({ id })

    if (!foundUser) {
      return null
    }

    return this._getUserAuthViewModel(foundUser)
  },
  async findRefreshTokenByUserId(userId) {
    const foundUser: UserType | null = await userCollection.findOne({ 'id': userId })

    if (!foundUser) {
      return null
    }

    return { refreshToken: foundUser.refreshToken }
  },
  async findByLoginOrEmail(loginOrEmail: string) {
    const foundUser: UserType | null = await userCollection.findOne({ $or: [{ 'accountData.login': loginOrEmail }, { 'accountData.email': loginOrEmail }] })

    if (!foundUser) {
      return null
    }

    return foundUser
  },
  async findByConfirmationCode(code) {
    const foundUser: UserType | null = await userCollection.findOne({ 'emailConfirmation.confirmationCode': code })

    if (!foundUser) {
      return null
    }

    return foundUser
  },
  async findByRecoveryCode(code) {
    const foundUser: UserType | null = await userCollection.findOne({ 'passwordRecovery.recoveryCode': code })

    if (!foundUser) {
      return null
    }

    return foundUser
  },
  async createdUser(createdUser) {
    await userCollection.insertOne(createdUser)

    return this._getUserViewModel(createdUser)
  },
  async deleteUserById(id) {
    const { deletedCount } = await userCollection.deleteOne({ id })

    return deletedCount === 1
  },
  async updateConfirmationByCode(code) {
    const result = await userCollection.updateOne({ 'emailConfirmation.confirmationCode': code }, {
      $set: {
        'emailConfirmation.isConfirmed': true
      }
    })

    return result.modifiedCount === 1
  },
  async updateConfirmationCodeByEmail(email, code) {
    const result = await userCollection.updateOne({ 'accountData.email': email }, {
      $set: {
        'emailConfirmation.confirmationCode': code
      }
    })

    return result.modifiedCount === 1
  },
  async updateRecoveryCodeByEmail(email, recoveryCode, expirationDate) {
    const result = await userCollection.updateOne({ 'accountData.email': email }, {
      $set: {
        'passwordRecovery.recoveryCode': recoveryCode,
        'passwordRecovery.expirationDate': expirationDate,
        'passwordRecovery.isRecovered': false,
      }
    })

    return result.modifiedCount === 1
  },
  async updatedUserPassword(passwordHash, recoveryCode) {
    const result = await userCollection.updateOne({ 'passwordRecovery.recoveryCode': recoveryCode }, {
      $set: {
        'accountData.passwordHash': passwordHash,
        'passwordRecovery.isRecovered': true,
      }
    })

    return result.modifiedCount === 1
  },
  async updateRefreshTokenByUserId(userId, refreshToken) {
    const result = await userCollection.updateOne({ 'id': userId }, {
      $set: {
        refreshToken,
      }
    })

    return result.modifiedCount === 1
  },
  _getUserViewModel(dbUser) {
    return {
      id: dbUser.id,
      login: dbUser.accountData.login,
      email: dbUser.accountData.email,
      createdAt: dbUser.accountData.createdAt,
    }
  },
  _getUsersViewModelDetail({ items, totalCount, pagesCount, page, pageSize }) {
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
  },
  _getUserAuthViewModel(dbUser) {
    return {
      userId: dbUser.id,
      login: dbUser.accountData.login,
      email: dbUser.accountData.email,
    }
  },  
}

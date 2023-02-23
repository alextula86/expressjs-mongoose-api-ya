import { Response } from 'express'
import { injectable, inject } from 'inversify'
import { UserService } from '../services'

import {
  RequestWithBody,
  RequestWithQuery,
  RequestWithParams,
  URIParamsUserModel,
  QueryUserModel,
  CreateUserModel,
  UserType,
  UserViewModel,
  ResponseViewModelDetail,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

@injectable()
export class UserController {
  constructor(@inject(UserService) protected userService: UserService) {}
  async getUsers(req: RequestWithQuery<QueryUserModel>, res: Response<ResponseViewModelDetail<UserViewModel>>) {
    const allUsers = await this.userService.findAllUsers({
      searchLoginTerm: req.query.searchLoginTerm,
      searchEmailTerm: req.query.searchEmailTerm,
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })  

    res.status(HTTPStatuses.SUCCESS200).send(this._getUsersViewModelDetail(allUsers))
  }
  async createUser(req: RequestWithBody<CreateUserModel>, res: Response<UserViewModel | ErrorsMessageType>) {
    const createdUser = await this.userService.createdUser({
      login: req.body.login,
      password: req.body.password,
      email: req.body.email,
    })

    res.status(HTTPStatuses.CREATED201).send(this._getUserViewModel(createdUser))
  }
  async deleteUser(req: RequestWithParams<URIParamsUserModel>, res: Response<boolean>) {
    const isUserDeleted = await this.userService.deleteUserById(req.params.id)

    if (!isUserDeleted) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
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
}

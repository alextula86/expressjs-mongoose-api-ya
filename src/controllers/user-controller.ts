import { Response } from 'express'
import { UserService } from '../services'

import {
  RequestWithBody,
  RequestWithQuery,
  RequestWithParams,
  URIParamsUserModel,
  QueryUserModel,
  CreateUserModel,
  UserViewModel,
  ResponseViewModelDetail,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

export class UserController {
  constructor(protected userService: UserService) {}
  async getUsers(req: RequestWithQuery<QueryUserModel>, res: Response<ResponseViewModelDetail<UserViewModel>>) {
    const allUsers = await this.userService.findAllUsers({
      searchLoginTerm: req.query.searchLoginTerm,
      searchEmailTerm: req.query.searchEmailTerm,
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })  

    res.status(HTTPStatuses.SUCCESS200).send(allUsers)
  }
  async createUser(req: RequestWithBody<CreateUserModel>, res: Response<UserViewModel | ErrorsMessageType>) {
    const createdUser = await this.userService.createdUser({
      login: req.body.login,
      password: req.body.password,
      email: req.body.email,
    })

    res.status(HTTPStatuses.CREATED201).send(createdUser)
  }
  async deleteUser(req: RequestWithParams<URIParamsUserModel>, res: Response<boolean>) {
    const isUserDeleted = await this.userService.deleteUserById(req.params.id)

    if (!isUserDeleted) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
}

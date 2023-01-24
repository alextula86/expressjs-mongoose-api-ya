import { Router, Response } from 'express'
import { userService } from '../services'
import {
  authBasicMiddleware,
  loginUserValidation,
  emailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
} from '../middlewares'

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

export const usersRouter = Router()

const middlewares = [
  authBasicMiddleware,
  loginUserValidation,
  emailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
]

usersRouter
  .get('/', authBasicMiddleware, async (req: RequestWithQuery<QueryUserModel>, res: Response<ResponseViewModelDetail<UserViewModel>>) => {
    const allUsers = await userService.findAllUsers({
      searchLoginTerm: req.query.searchLoginTerm,
      searchEmailTerm: req.query.searchEmailTerm,
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })  

    res.status(HTTPStatuses.SUCCESS200).send(allUsers)
  })
  .post('/', middlewares, async (req: RequestWithBody<CreateUserModel>, res: Response<UserViewModel | ErrorsMessageType>) => {
    const createdUser = await userService.createdUser({
      login: req.body.login,
      password: req.body.password,
      email: req.body.email,
    })

    res.status(HTTPStatuses.CREATED201).send(createdUser)
  })
  .delete('/:id', authBasicMiddleware, async (req: RequestWithParams<URIParamsUserModel>, res: Response<boolean>) => {
    const isUserDeleted = await userService.deleteUserById(req.params.id)

    if (!isUserDeleted) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  })

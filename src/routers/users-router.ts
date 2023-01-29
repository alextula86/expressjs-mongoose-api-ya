import { Router } from 'express'
import { userController } from '../composition-roots'
import {
  authBasicMiddleware,
  loginUserValidation,
  emailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
} from '../middlewares'

export const usersRouter = Router()

const middlewares = [
  authBasicMiddleware,
  loginUserValidation,
  emailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
]

usersRouter
  .get('/', authBasicMiddleware, userController.getUsers.bind(userController))
  .post('/', middlewares, userController.createUser.bind(userController))
  .delete('/:id', authBasicMiddleware, userController.deleteUser.bind(userController))

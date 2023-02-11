import { Router } from 'express'
import { UserController } from '../controllers'
import { container } from '../composition-roots'
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

const userController = container.resolve(UserController)

usersRouter
  .get('/', authBasicMiddleware, userController.getUsers.bind(userController))
  .post('/', middlewares, userController.createUser.bind(userController))
  .delete('/:id', authBasicMiddleware, userController.deleteUser.bind(userController))

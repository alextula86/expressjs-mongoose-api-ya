import { Router } from 'express'
import { commentsController } from '../composition-roots'
import {
  authBearerMiddleware,
  contentCommentValidation,
  inputValidationMiddleware,
} from '../middlewares'

export const commentsRouter = Router()

const middlewares = [
  authBearerMiddleware,
  contentCommentValidation,
  inputValidationMiddleware,
]

commentsRouter
  .get('/:id', commentsController.getComment.bind(commentsController))  
  .put('/:id', middlewares, commentsController.updateComment.bind(commentsController))
  .delete('/:id', authBearerMiddleware, commentsController.deleteComment.bind(commentsController))

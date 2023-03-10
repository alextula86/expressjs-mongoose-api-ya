import { Router } from 'express'
import { CommentsController } from '../controllers'
import { container } from '../composition-roots'
import {
  authBearerMiddleware,
  getUserByBearerOrRefreshTokenMiddleware,
  contentCommentValidation,
  likeStatusCommentValidation,
  inputValidationMiddleware,
} from '../middlewares'

export const commentsRouter = Router()

const middlewares = [
  authBearerMiddleware,
  contentCommentValidation,
  inputValidationMiddleware,
]

const middlewaresLikeStatus = [
  authBearerMiddleware,
  likeStatusCommentValidation,
  inputValidationMiddleware,
]

const commentsController = container.resolve(CommentsController)

commentsRouter
  .get('/:id', getUserByBearerOrRefreshTokenMiddleware, commentsController.getComment.bind(commentsController))  
  .put('/:id', middlewares, commentsController.updateComment.bind(commentsController))
  .put('/:id/like-status', middlewaresLikeStatus, commentsController.updateCommentLikeStatus.bind(commentsController))
  .delete('/:id', authBearerMiddleware, commentsController.deleteComment.bind(commentsController))

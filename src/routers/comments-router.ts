import { Router, Response } from 'express'
import { isEmpty } from 'lodash'
import { commentService } from '../services'
import {
  authBearerMiddleware,
  contentCommentValidation,
  inputValidationMiddleware,
} from '../middlewares'

import {
  RequestWithParams,
  RequestWithParamsAndBody,
  URIParamsCommentModel,
  UpdateCommentModel,
  CommentViewModel,
  HTTPStatuses,
} from '../types'

export const commentsRouter = Router()

const middlewares = [
  authBearerMiddleware,
  contentCommentValidation,
  inputValidationMiddleware,
]

commentsRouter
  .get('/:id', async (req: RequestWithParams<URIParamsCommentModel>, res: Response<CommentViewModel>) => {
    const commentById = await commentService.findCommentById(req.params.id)

    if (!commentById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.SUCCESS200).send(commentById)
  })  
  .put('/:id', middlewares, async (req: RequestWithParamsAndBody<URIParamsCommentModel, UpdateCommentModel> & any, res: Response<boolean>) => {
    const commentById = await commentService.findCommentById(req.params.id)

    if (isEmpty(commentById)) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    if (commentById.userId !== req.user!.userId || commentById.userLogin !== req.user!.login) {
      return res.status(HTTPStatuses.FORBIDDEN403).send()
    }

    const isCommentUpdated = await commentService.updateComment({
      id: commentById.id,
      content: req.body.content,
    })

    if (!isCommentUpdated) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.NOCONTENT204).send()
  })
  .delete('/:id', authBearerMiddleware, async (req: RequestWithParams<URIParamsCommentModel> & any, res: Response<boolean>) => {
    const commentById = await commentService.findCommentById(req.params.id)

    if (!isEmpty(commentById) && (commentById.userId !== req.user!.userId || commentById.userLogin !== req.user!.login)) {
      return res.status(HTTPStatuses.FORBIDDEN403).send()
    }

    const isCommentDeleted = await commentService.deleteCommentById(req.params.id)

    if (!isCommentDeleted) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  })

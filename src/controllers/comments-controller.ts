import { Response } from 'express'
import { isEmpty } from 'lodash'
import { CommentService } from '../services'

import {
  RequestWithParams,
  RequestWithParamsAndBody,
  URIParamsCommentModel,
  UpdateCommentModel,
  CommentViewModel,
  HTTPStatuses,
} from '../types'

export class CommentsController {
  constructor(
    protected commentService: CommentService,
  ) {}
  async getComment(req: RequestWithParams<URIParamsCommentModel>, res: Response<CommentViewModel>) {
    const commentById = await this.commentService.findCommentById(req.params.id)

    if (!commentById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.SUCCESS200).send(commentById)
  }
  async updateComment(req: RequestWithParamsAndBody<URIParamsCommentModel, UpdateCommentModel> & any, res: Response<boolean>) {
    const commentById = await this.commentService.findCommentById(req.params.id)

    if (isEmpty(commentById)) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    if (commentById.userId !== req.user!.userId || commentById.userLogin !== req.user!.login) {
      return res.status(HTTPStatuses.FORBIDDEN403).send()
    }

    const isCommentUpdated = await this.commentService.updateComment({
      id: commentById.id,
      content: req.body.content,
    })

    if (!isCommentUpdated) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async deleteComment(req: RequestWithParams<URIParamsCommentModel> & any, res: Response<boolean>) {
    const commentById = await this.commentService.findCommentById(req.params.id)

    if (!isEmpty(commentById) && (commentById.userId !== req.user!.userId || commentById.userLogin !== req.user!.login)) {
      return res.status(HTTPStatuses.FORBIDDEN403).send()
    }

    const isCommentDeleted = await this.commentService.deleteCommentById(req.params.id)

    if (!isCommentDeleted) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
}

import { Response } from 'express'
import { injectable } from 'inversify'
import { isEmpty } from 'lodash'
import { CommentService } from '../services'

import {
  RequestWithParams,
  RequestWithParamsAndBody,
  URIParamsCommentModel,
  UserRequestModel,
  UpdateCommentModel,
  AddLikeToCommentModel,
  CommentType,
  CommentViewModel,
  LikeStatuses,
  HTTPStatuses,
} from '../types'

@injectable()
export class CommentsController {
  constructor(
    protected commentService: CommentService,
  ) {}
  async getComment(req: RequestWithParams<URIParamsCommentModel> & any, res: Response<CommentViewModel>) {
    const commentById = await this.commentService.findCommentById(req.params.id)

    if (!commentById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.SUCCESS200).send(this._getCommentViewModel(commentById, req?.user?.userId))
  }
  async updateComment(req: RequestWithParamsAndBody<URIParamsCommentModel, UpdateCommentModel> & UserRequestModel & any, res: Response<boolean>) {
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
  async updateLikeStatusToComment(req: RequestWithParamsAndBody<URIParamsCommentModel, AddLikeToCommentModel> & UserRequestModel & any, res: Response<boolean>) {
    const commentById = await this.commentService.findCommentById(req.params.id)

    if (isEmpty(commentById)) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    const isLikeUpdated = await this.commentService.updateLikeStatusToComment(commentById.id, {
      userId: req.user!.userId,
      userLogin: req.user!.login,
      likeStatus: req.body.likeStatus,
    })

    if (!isLikeUpdated) {
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
  _getCommentViewModel(dbComment: CommentType, userId: string): CommentViewModel {
    const myStatus = this._getMyStatus(dbComment, userId)
    
    return {
      id: dbComment.id,
      content: dbComment.content,
      commentatorInfo: {
        userId: dbComment.userId,
        userLogin: dbComment.userLogin,
      },
      createdAt: dbComment.createdAt,
      likesInfo: {
        likesCount: dbComment.likesCount,
        dislikesCount: dbComment.dislikesCount,
        myStatus,
        // likes: dbComment.likes,
        // dislikes: dbComment.dislikes,
      },      
    }
  } 
  _getMyStatus(dbComment: CommentType, userId: string): LikeStatuses {
    if (!userId) {
      return LikeStatuses.NONE
    }

    const currentLike = dbComment.likes.find(item => item.userId === userId)

    if (currentLike) {
      return currentLike.likeStatus
    }

    const currentDislike = dbComment.dislikes.find(item => item.userId === userId)

    if (currentDislike) {
      return currentDislike.likeStatus
    }

    return LikeStatuses.NONE
    
  }
}

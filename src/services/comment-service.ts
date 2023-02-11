import { injectable, inject } from 'inversify'
import { trim } from 'lodash'
import { CommentRepository } from '../repositories/comment/comment-db-mongoose-repository'

import {
  CommentType,
  LikeStatusCommentType,
  QueryCommentModel,
  CreateCommentService,
  UpdateCommentService,
  UpdateLikeToCommentService,
  ResponseViewModelDetail,
  SortDirection,

 } from '../types'

 @injectable()
export class CommentService {
  constructor(@inject(CommentRepository) protected commentRepository: CommentRepository) {}
  async findAllCommentsByPostId(postId: string, {
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection = SortDirection.DESC,
  }: QueryCommentModel): Promise<ResponseViewModelDetail<CommentType>> {
    const foundAllComments = await this.commentRepository.findAllCommentsByPostId(postId, {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    })

    return foundAllComments
  }
  async findCommentById(id: string ): Promise<CommentType | null> {
    const foundCommentById = await this.commentRepository.findCommentById(id)

    return foundCommentById
  }
  async createdComment({
    content,
    postId,
    userId,
    userLogin,
  }: CreateCommentService): Promise<CommentType> {
    const commentContent = trim(String(content))
    
    const newComment = new CommentType(commentContent, postId, userId, userLogin)
    const createdComment = await this.commentRepository.createdComment(newComment)

    return createdComment
  }
  async updateComment({
    id,
    content,
  }: UpdateCommentService): Promise<boolean> {
    const updatedComment = {
      id,
      content: trim(String(content)),
    }

    const isUpdatedComment = await this.commentRepository.updateComment(updatedComment)

    return isUpdatedComment
  }
  async updateLikeStatusToComment(commentId: string, {
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeToCommentService): Promise<boolean> {
    const createdLikeStatus = new LikeStatusCommentType(userId, userLogin, likeStatus)
    const isUpdatedComment = await this.commentRepository.updateLikeStatusToComment(commentId, createdLikeStatus)

    return isUpdatedComment
  }
  async deleteCommentById(id: string): Promise<boolean> {
    const isDeleteCommentById = await this.commentRepository.deleteCommentById(id)

    return isDeleteCommentById
  }
}

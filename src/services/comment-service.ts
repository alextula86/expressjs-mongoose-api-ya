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
  async updateCommentLikeStatus(commentId: string, {
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeToCommentService): Promise<boolean> {
    // Определяем лайкал ли пользователь комментарий
    const foundCommentLikeStatuses = await this.commentRepository.findCommentLikeStatusesByUserId(commentId, userId)
    // Если пользователь не лайкал комментарий, то создаем инстанс лайк статуса и добавляем его для комментария
    if (!foundCommentLikeStatuses) {
      const createdLikeStatus = new LikeStatusCommentType(userId, userLogin, likeStatus)
      const isAddCommentLikeStatus = await this.commentRepository.addCommentLikeStatus(commentId, createdLikeStatus)

      return isAddCommentLikeStatus
    }

    // Определяем лайк статус пользователя
    const likeStatusUserData = foundCommentLikeStatuses.likes.find(item => item.userId === userId)

    // Если лайк статус пользователя равен переданому лайк статусу не производим обновление лайк статуса
    if (likeStatusUserData && likeStatusUserData.likeStatus === likeStatus) {
      return true
    }

    // Обновляем лайк статус пользователя
    const isUpdatedCommentLikeStatuses = await this.commentRepository.updateCommentLikeStatusesByUserId(commentId, userId, likeStatus)

    return isUpdatedCommentLikeStatuses
  }
  async deleteCommentById(id: string): Promise<boolean> {
    const isDeleteCommentById = await this.commentRepository.deleteCommentById(id)

    return isDeleteCommentById
  }
}

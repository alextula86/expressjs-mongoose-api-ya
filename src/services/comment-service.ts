import { trim } from 'lodash'
import { CommentRepository } from '../repositories/comment/comment-db-repository'

import {
  CommentType,
  CommentViewModel,
  QueryCommentModel,
  CreateCommentService,
  UpdateCommentService,
  ResponseViewModelDetail,
  SortDirection,
 } from '../types'

export class CommentService {
  constructor(protected commentRepository: CommentRepository) {}
  async findAllCommentsByPostId(postId: string, {
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection = SortDirection.DESC,
  }: QueryCommentModel): Promise<ResponseViewModelDetail<CommentViewModel>> {
    const foundAllComments = await this.commentRepository.findAllCommentsByPostId(postId, {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    })

    return foundAllComments
  }
  async findCommentById(id: string): Promise<CommentViewModel | null> {
    const foundCommentById = await this.commentRepository.findCommentById(id)

    return foundCommentById
  }
  async createdComment({
    content,
    postId,
    userId,
    userLogin,
  }: CreateCommentService): Promise<CommentViewModel> {
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
  async deleteCommentById(id: string): Promise<boolean> {
    const isDeleteCommentById = await this.commentRepository.deleteCommentById(id)

    return isDeleteCommentById
  }
}

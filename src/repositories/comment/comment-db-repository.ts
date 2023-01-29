import { commentCollection } from '../db'

import {
  CommentType,
  CommentViewModel,
  QueryCommentModel,
  UpdateCommentService,
  
  ResponseViewModelDetail, SortDirection } from '../../types'

export class CommentRepository {
  async findAllCommentsByPostId(postId: string, {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryCommentModel): Promise<ResponseViewModelDetail<CommentViewModel>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10
    
    const filter: any = { postId: { $eq: postId } }
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    const totalCount = await commentCollection.count(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const comments: CommentType[] = await commentCollection
      .find(filter) 
      .sort(sort)
      .skip(skip)
      .limit(size)
      .toArray()

    return this._getCommentsViewModelDetail({
      items: comments,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  }
  async findCommentById(id: string): Promise<CommentViewModel | null> {
    const foundComment: CommentType | null = await commentCollection.findOne({ id })

    if (!foundComment) {
      return null
    }

    return this._getCommentViewModel(foundComment)
  }
  async createdComment(createdComment: CommentType): Promise<CommentViewModel> {
    await commentCollection.insertOne(createdComment)

    return this._getCommentViewModel(createdComment)
  }
  async updateComment({id, content }: UpdateCommentService): Promise<boolean> {
    const { matchedCount } = await commentCollection.updateOne({ id }, {
      $set: { content }
    })

    return matchedCount === 1
  }
  async deleteCommentById(id: string): Promise<boolean> {
    const { deletedCount } = await commentCollection.deleteOne({ id })

    return deletedCount === 1
  }
  _getCommentViewModel(dbComments: CommentType): CommentViewModel {
    return {
      id: dbComments.id,
      content: dbComments.content,
      userId: dbComments.userId,
      userLogin: dbComments.userLogin,
      createdAt: dbComments.createdAt,
    }
  }
  _getCommentsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<CommentType>): ResponseViewModelDetail<CommentViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        content: item.content,
        userId: item.userId,
        userLogin: item.userLogin,
        createdAt: item.createdAt,
      })),
    }
  }
}

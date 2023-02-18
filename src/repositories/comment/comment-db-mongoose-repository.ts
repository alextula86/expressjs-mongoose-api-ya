import { injectable } from 'inversify'
import { CommentModel } from '../db-mongoose'

import {
  CommentType,
  QueryCommentModel,
  UpdateCommentService,
  ResponseViewModelDetail,
  LikeStatusCommentType,
  LikeStatuses,
  SortDirection,
} from '../../types'

@injectable()
export class CommentRepository {
  async findAllCommentsByPostId(postId: string, {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryCommentModel): Promise<ResponseViewModelDetail<CommentType>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10
    
    const filter: any = { postId: { $eq: postId } }
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    const totalCount = await CommentModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const comments: CommentType[] = await CommentModel
      .find(filter) 
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean()

    return {
      items: comments,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    }
  }
  async findCommentById(id: string): Promise<CommentType | null> {
    const foundComment: CommentType | null = await CommentModel.findOne({ id })

    if (!foundComment) {
      return null
    }

    return foundComment
  }
  async createdComment(createdComment: CommentType): Promise<CommentType> {
    await CommentModel.create(createdComment)

    return createdComment
  }
  async updateComment({ id, content }: UpdateCommentService): Promise<boolean> {
    const { matchedCount } = await CommentModel.updateOne({ id }, {
      $set: { content }
    })

    return matchedCount === 1
  }
  /*
  async updateLikeStatusToComment(commentId: string, createdLikeStatus: LikeStatusCommentType
  ): Promise<boolean> {
     if (createdLikeStatus.likeStatus === LikeStatuses.LIKE) {
      await CommentModel.findOneAndUpdate(
        { id: commentId, "dislikes.userId": createdLikeStatus.userId },
        { $inc: { dislikesCount: -1 }, $set: { myStatus: createdLikeStatus.likeStatus }, $pull: { dislikes: { userId: createdLikeStatus.userId } } },
      )      
      
      await CommentModel.findOneAndUpdate(
        { id: commentId, "likes.userId": { $ne: createdLikeStatus.userId } },
        { $inc: { likesCount: 1 }, $set: { myStatus: createdLikeStatus.likeStatus }, $push: { likes: createdLikeStatus } },
        { returnDocument: 'after' }
      )

      return true
    }

    if (createdLikeStatus.likeStatus === LikeStatuses.DISLIKE) {
      await CommentModel.findOneAndUpdate(
        { id: commentId, "likes.userId": createdLikeStatus.userId },
        { $inc: { likesCount: -1 }, $set: { myStatus: createdLikeStatus.likeStatus }, $pull: { likes: { userId: createdLikeStatus.userId } } },
      )      
      
      await CommentModel.findOneAndUpdate(
        { id: commentId, "dislikes.userId": { $ne: createdLikeStatus.userId } },
        { $inc: { dislikesCount: 1 }, $set: { myStatus: createdLikeStatus.likeStatus }, $push: { dislikes: createdLikeStatus } },
        { returnDocument: 'after' }
      )

      return true
    }

    if (createdLikeStatus.likeStatus === LikeStatuses.NONE) {
      await CommentModel.findOneAndUpdate(
        { id: commentId, "likes.userId": createdLikeStatus.userId },
        { $inc: { likesCount: -1 }, $set: { myStatus: createdLikeStatus.likeStatus }, $pull: { likes: { userId: createdLikeStatus.userId } } },
      )  
      
      await CommentModel.findOneAndUpdate(
        { id: commentId, "dislikes.userId": createdLikeStatus.userId },
        { $inc: { dislikesCount: -1 }, $set: { myStatus: createdLikeStatus.likeStatus }, $pull: { dislikes: { userId: createdLikeStatus.userId } } },
      )
      
      return true
    } 
  }
  */
  async findCommentLikeStatusesByUserId(commentId: string, userId: string): Promise<CommentType | null> {      
    const foundCommentLikeStatuses: CommentType | null = await CommentModel.findOne({ id: commentId, "likes.userId": userId })
    
    return foundCommentLikeStatuses
  }
  async addCommentLikeStatus(commentId: string, createdLikeStatus: LikeStatusCommentType): Promise<boolean> {      
    const updatedCommentLikeStatus = await CommentModel.findOneAndUpdate(
      { id: commentId },
      { $push: { likes: createdLikeStatus } },
      { returnDocument: 'after' },
    )

    if (updatedCommentLikeStatus) {
      const likesCount = updatedCommentLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.LIKE).length
      const dislikesCount = updatedCommentLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.DISLIKE).length

      await CommentModel.updateOne(
        { id: commentId },
        { $set: { likesCount, dislikesCount } },
      )
    }

    return true
  }
  async updateCommentLikeStatusesByUserId(commentId: string, userId: string, likeStatus: LikeStatuses ): Promise<boolean> {      
    const updatedCommentLikeStatus = await CommentModel.findOneAndUpdate(
      { id: commentId, "likes.userId": userId },
      { $set: { 'likes.$.likeStatus': likeStatus } },
      { returnDocument: 'after' },
    )  
    
    if (updatedCommentLikeStatus) {
      const likesCount = updatedCommentLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.LIKE).length
      const dislikesCount = updatedCommentLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.DISLIKE).length

      await CommentModel.updateOne(
        { id: commentId },
        { $set: { likesCount, dislikesCount } },
      )
    }
    
    return true
  }  
  async deleteCommentById(id: string): Promise<boolean> {
    const { deletedCount } = await CommentModel.deleteOne({ id })

    return deletedCount === 1
  }
}

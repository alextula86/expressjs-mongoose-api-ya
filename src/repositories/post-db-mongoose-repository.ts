import { injectable } from 'inversify'
import { PostModel } from './db-mongoose'

import {
  PostType,
  QueryPostModel,
  UpdatePostService,
  LikeStatusPostType,
  ResponseViewModelDetail,
  LikeStatuses,
  SortDirection,
} from '../types'

@injectable()
export class PostRepository {
  async findAllPosts({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostType>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10

    const filter: any = {}
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    if (searchNameTerm) {
      filter.title = { $regex: searchNameTerm, $options: 'i' }
    }

    const totalCount = await PostModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const posts: PostType[] = await PostModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean()

    return {
      items: posts,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    }
  }
  async findPostById(id: string): Promise<PostType | null> {
    const foundPost: PostType | null = await PostModel.findOne({ id })

    if (!foundPost) {
      return null
    }

    return foundPost
  }
  async createdPost(createdPost: PostType): Promise<PostType> {
    await PostModel.create(createdPost)

    return createdPost
  }
  async updatePost({
    id,
    title,
    shortDescription,
    content,
    blogId,
    blogName,
  }: UpdatePostService): Promise<boolean> {
    const { matchedCount } = await PostModel.updateOne({ id }, {
      $set: {
        title,
        shortDescription,
        content,
        blogId,
        blogName,
      }
    })

    return matchedCount === 1   
  }
  async findPostLikeStatusesByUserId(postId: string, userId: string): Promise<PostType | null> {      
    const foundPostLikeStatuses: PostType | null = await PostModel.findOne({ id: postId, "likes.userId": userId })
    
    return foundPostLikeStatuses
  }
  async addPostLikeStatus(postId: string, createdLikeStatus: LikeStatusPostType): Promise<boolean> {      
    const updatedPostLikeStatus = await PostModel.findOneAndUpdate(
      { id: postId },
      { $push: { likes: createdLikeStatus } },
      { returnDocument: 'after' },
    )

    if (updatedPostLikeStatus) {
      const likesCount = updatedPostLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.LIKE).length
      const dislikesCount = updatedPostLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.DISLIKE).length

      await PostModel.updateOne(
        { id: postId },
        { $set: { likesCount, dislikesCount } },
      )
    }

    return true
  }
  async updatePostLikeStatusesByUserId(postId: string, userId: string, likeStatus: LikeStatuses ): Promise<boolean> {      
    const updatedPostLikeStatus = await PostModel.findOneAndUpdate(
      { id: postId, "likes.userId": userId },
      { $set: { 'likes.$.likeStatus': likeStatus } },
      { returnDocument: 'after' },
    )  
    
    if (updatedPostLikeStatus) {
      const likesCount = updatedPostLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.LIKE).length
      const dislikesCount = updatedPostLikeStatus.likes.filter(item => item.likeStatus === LikeStatuses.DISLIKE).length

      await PostModel.updateOne(
        { id: postId },
        { $set: { likesCount, dislikesCount } },
      )
    }
    
    return true
  }
  async deletePostById(id: string): Promise<boolean> {
    const { deletedCount } = await PostModel.deleteOne({ id })

    return deletedCount === 1
  }
}

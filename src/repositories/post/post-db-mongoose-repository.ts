import { injectable } from 'inversify'
import { PostModel } from '../db-mongoose'

import {
  PostType,
  PostViewModel,
  QueryPostModel,
  ResponseViewModelDetail,
  SortDirection,
} from '../../types'

@injectable()
export class PostRepository {
  async findAllPosts({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostViewModel>> {
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

    return this._getPostsViewModelDetail({
      items: posts,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  }
  async findPostById(id: string): Promise<PostViewModel | null> {
    const foundPost: PostType | null = await PostModel.findOne({ id })

    if (!foundPost) {
      return null
    }

    return this._getPostViewModel(foundPost)
  }
  async createdPost(createdPost: PostType): Promise<PostViewModel> {
    await PostModel.create(createdPost)

    return this._getPostViewModel(createdPost)
  }
  async updatePost({
    id,
    title,
    shortDescription,
    content,
    blogId,
    blogName,
  }: PostType): Promise<boolean> {
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
  async deletePostById(id: string): Promise<boolean> {
    const { deletedCount } = await PostModel.deleteOne({ id })

    return deletedCount === 1
  }
  _getPostViewModel(dbPost: PostType): PostViewModel {
    return {
      id: dbPost.id,
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      createdAt: dbPost.createdAt,
    }
  }
  _getPostsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<PostType>): ResponseViewModelDetail<PostViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        shortDescription: item.shortDescription,
        content: item.content,
        blogId: item.blogId,
        blogName: item.blogName,
        createdAt: item.createdAt,
      })),
    }
  }
}

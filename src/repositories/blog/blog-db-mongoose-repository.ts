import { injectable } from 'inversify'
import { BlogModel, PostModel } from '../db-mongoose'

import {
  BlogType,
  PostType,
  BlogViewModel,
  PostViewModel,
  QueryBlogModel,
  QueryPostModel,
  ResponseViewModelDetail,
  SortDirection,
} from '../../types'

@injectable()
export class BlogRepository {
  async findAllBlogs({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryBlogModel): Promise<ResponseViewModelDetail<BlogType>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10
    
    const filter: any = {}
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' }
    }

    const totalCount = await BlogModel.countDocuments(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const blogs: BlogType[] = await BlogModel
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .lean()

    return {
      items: blogs,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    }
  }
  async findBlogById(id: string): Promise<BlogType | null> {
    const foundBlog: BlogType | null = await BlogModel.findOne({ id })

    if (!foundBlog) {
      return null
    }

    return foundBlog
  }
  async findPostsByBlogId(blogId: string, {
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostType>> {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10

    const filter: any = { blogId: { $eq: blogId } }
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
  async createdBlog(createdBlog: BlogType): Promise<BlogType> {
    await BlogModel.create(createdBlog)

    return createdBlog
  }
  async createdPostByBlogId(createdPost: PostType): Promise<PostType> {
    await PostModel.create(createdPost)

    return createdPost
  }
  async updateBlog({id, name, description, websiteUrl }: BlogType): Promise<boolean> {
    const { matchedCount } = await BlogModel.updateOne({ id }, {
      $set: {
        name,
        description,
        websiteUrl,
      }
    })

    return matchedCount === 1
  }
  async deleteBlogById(id: string): Promise<boolean> {
    const { deletedCount } = await BlogModel.deleteOne({ id })

    return deletedCount === 1
  }
}

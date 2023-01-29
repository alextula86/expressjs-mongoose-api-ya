import { trim } from 'lodash'
import { blogRepository } from '../repositories/blog/blog-db-repository'
import { getNextStrId } from '../utils'

import {
  BlogType,
  PostType,
  BlogViewModel,
  PostViewModel,
  QueryBlogModel,
  QueryPostModel,
  CreaetBlogService,
  UpdateBlogService,
  CreaetPostService,
  ResponseViewModelDetail,
  SortDirection,
} from '../types'

class BlogService {
  async findAllBlogs({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryBlogModel): Promise<ResponseViewModelDetail<BlogViewModel>> {
    const foundAllBlogs = await blogRepository.findAllBlogs({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    })

    return foundAllBlogs
  }

  async findBlogById(id: string): Promise<BlogViewModel | null> {
    const foundBlogById = await blogRepository.findBlogById(id)

    return foundBlogById
  }

  async findPostsByBlogId(blogId: string, {
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostViewModel>> {
    const foundPostsByBlogId = await blogRepository.findPostsByBlogId(blogId, {
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    })
    return foundPostsByBlogId
  }

  async createdBlog({
    name, 
    description, 
    websiteUrl,
  }: CreaetBlogService): Promise<BlogViewModel> {
    const blogName = trim(String(name))
    const blogDescription = trim(String(description))
    const blogWebsiteUrl = trim(String(websiteUrl))
    
    const newBlog = new BlogType(blogName, blogDescription, blogWebsiteUrl)
    const createdBlog = await blogRepository.createdBlog(newBlog)

    return createdBlog
  }

  async createdPostByBlogId({
    title,
    shortDescription,
    content,
    blogId,
    blogName,
  }: CreaetPostService): Promise<PostViewModel> {
    const newPost: PostType = {
      id: getNextStrId(),
      title: trim(String(title)),
      shortDescription: trim(String(shortDescription)),
      content: trim(String(content)),
      blogId,
      blogName,
      createdAt: new Date().toISOString(),
    }

    const createdPost = await blogRepository.createdPostByBlogId(newPost)

    return createdPost
  }

  async updateBlog({
    id,
    name,
    description,
    websiteUrl,
  }: UpdateBlogService): Promise<boolean> {
    const updatedBlog = {
      id,
      name: trim(String(name)),
      description: trim(String(description)),
      websiteUrl: trim(String(websiteUrl)),
    }

    const isUpdatedBlog = await blogRepository.updateBlog(updatedBlog)

    return isUpdatedBlog
  }

  async deleteBlogById(id: string):  Promise<boolean> {
    const isDeleteBlogById = await blogRepository.deleteBlogById(id)

    return isDeleteBlogById
  }
}

export const blogService = new BlogService()

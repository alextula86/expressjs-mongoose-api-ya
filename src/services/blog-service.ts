import { trim } from 'lodash'
import { BlogRepository } from '../repositories/blog/blog-db-repository'
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

export class BlogService {
  constructor(protected blogRepository: BlogRepository) {}
  async findAllBlogs({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryBlogModel): Promise<ResponseViewModelDetail<BlogViewModel>> {
    const foundAllBlogs = await this.blogRepository.findAllBlogs({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    })

    return foundAllBlogs
  }
  async findBlogById(id: string): Promise<BlogViewModel | null> {
    const foundBlogById = await this.blogRepository.findBlogById(id)

    return foundBlogById
  }
  async findPostsByBlogId(blogId: string, {
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostViewModel>> {
    const foundPostsByBlogId = await this.blogRepository.findPostsByBlogId(blogId, {
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
    const createdBlog = await this.blogRepository.createdBlog(newBlog)

    return createdBlog
  }
  async createdPostByBlogId({
    title,
    shortDescription,
    content,
    blogId,
    blogName,
  }: CreaetPostService): Promise<PostViewModel> {
    const postTitle = trim(String(title))
    const postShortDescription = trim(String(shortDescription))
    const postContent = trim(String(content))

    const newPost = new PostType(postTitle, postShortDescription, postContent, blogId, blogName)
    const createdPost = await this.blogRepository.createdPostByBlogId(newPost)

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

    const isUpdatedBlog = await this.blogRepository.updateBlog(updatedBlog)

    return isUpdatedBlog
  }
  async deleteBlogById(id: string):  Promise<boolean> {
    const isDeleteBlogById = await this.blogRepository.deleteBlogById(id)

    return isDeleteBlogById
  }
}

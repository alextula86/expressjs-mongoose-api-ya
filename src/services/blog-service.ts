import 'reflect-metadata'
import { injectable, inject } from 'inversify'
import { trim } from 'lodash'
import { BlogRepository } from '../repositories'

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

@injectable()
export class BlogService {
  constructor(@inject(BlogRepository) protected blogRepository: BlogRepository) {}
  async findAllBlogs({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryBlogModel): Promise<ResponseViewModelDetail<BlogType>> {
    const foundAllBlogs = await this.blogRepository.findAllBlogs({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection
    })

    return foundAllBlogs
  }
  async findBlogById(id: string): Promise<BlogType | null> {
    const foundBlogById = await this.blogRepository.findBlogById(id)

    return foundBlogById
  }
  async findPostsByBlogId(blogId: string, {
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostType>> {
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
  }: CreaetBlogService): Promise<BlogType> {
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
  }: CreaetPostService): Promise<PostType> {
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

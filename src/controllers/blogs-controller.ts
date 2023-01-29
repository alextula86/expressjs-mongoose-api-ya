import { Response } from 'express'
import { BlogService } from '../services/blog-service'

import {
  RequestWithBody,
  RequestWithQuery,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  URIParamsBlogModel,
  URIParamsPostsByBlogId,
  QueryBlogModel,
  QueryPostModel,
  CreateBlogModel,
  CreatePostForBlogModel,
  UpdateBlogModel,
  BlogViewModel,
  PostViewModel,
  ResponseViewModelDetail,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

export class BlogsController {
  constructor(protected blogService: BlogService) {}
  async getBlogs(req: RequestWithQuery<QueryBlogModel>, res: Response<ResponseViewModelDetail<BlogViewModel>>) {
    const allBlogs = await this.blogService.findAllBlogs({
      searchNameTerm: req.query.searchNameTerm,
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })

    res.status(HTTPStatuses.SUCCESS200).send(allBlogs)
  }
  async getBlog(req: RequestWithParams<URIParamsBlogModel>, res: Response<BlogViewModel>) {
    const blogById = await this.blogService.findBlogById(req.params.id)

    if (!blogById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.SUCCESS200).send(blogById)
  }
  async getPostsByBlogId(req: RequestWithParamsAndQuery<URIParamsPostsByBlogId, QueryPostModel>, res: Response<ResponseViewModelDetail<PostViewModel>>) {
    const blogById = await this.blogService.findBlogById(req.params.blogId)

    if (!blogById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    const postsByBlogId = await this.blogService.findPostsByBlogId(req.params.blogId, {
      searchNameTerm: req.query.searchNameTerm,
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })

    res.status(HTTPStatuses.SUCCESS200).send(postsByBlogId)
  }
  async createBlog(req: RequestWithBody<CreateBlogModel>, res: Response<BlogViewModel | ErrorsMessageType>) {
    const createdBlog = await this.blogService.createdBlog({
      name: req.body.name,
      description: req.body.description,
      websiteUrl: req.body.websiteUrl,
    })

    res.status(HTTPStatuses.CREATED201).send(createdBlog)
  }
  async createPostByBlogId(req: RequestWithParamsAndBody<URIParamsPostsByBlogId, CreatePostForBlogModel>, res: Response<PostViewModel | ErrorsMessageType>) {
    const blogById = await this.blogService.findBlogById(req.params.blogId)

    if (!blogById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    const createdPostByBlogId = await this.blogService.createdPostByBlogId({
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      blogId: blogById.id,
      blogName: blogById.name,
    })

    res.status(HTTPStatuses.CREATED201).send(createdPostByBlogId)
  }
  async updateBlog(req: RequestWithParamsAndBody<URIParamsBlogModel, UpdateBlogModel>, res: Response<boolean>) {
    const blogById = await this.blogService.findBlogById(req.params.id)

    if (!blogById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    const isBlogUpdated = await this.blogService.updateBlog({
      id: blogById.id,
      name: req.body.name,
      description: req.body.description,
      websiteUrl: req.body.websiteUrl,
    })

    if (!isBlogUpdated) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async deleteBlog(req: RequestWithParams<URIParamsBlogModel>, res: Response<boolean>) {
    const isBlogDeleted = await this.blogService.deleteBlogById(req.params.id)

    if (!isBlogDeleted) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
}

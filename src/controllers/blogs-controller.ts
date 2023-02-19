import { Response } from 'express'
import { injectable } from 'inversify'
// import moment from 'moment'
import { BlogService } from '../services/blog-service'

import {
  BlogType,
  PostType,
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
  LikeStatuses,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

@injectable()
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

    res.status(HTTPStatuses.SUCCESS200).send(this._getBlogsViewModelDetail(allBlogs))
  }
  async getBlog(req: RequestWithParams<URIParamsBlogModel>, res: Response<BlogViewModel>) {
    const blogById = await this.blogService.findBlogById(req.params.id)

    if (!blogById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.SUCCESS200).send(this._getBlogViewModel(blogById))
  }
  async getPostsByBlogId(req: RequestWithParamsAndQuery<URIParamsPostsByBlogId, QueryPostModel> & any, res: Response<ResponseViewModelDetail<PostViewModel>>) {
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

    res.status(HTTPStatuses.SUCCESS200).send(this._getPostsViewModelDetail(postsByBlogId, req?.user?.userId))
  }
  async createBlog(req: RequestWithBody<CreateBlogModel>, res: Response<BlogViewModel | ErrorsMessageType>) {
    const createdBlog = await this.blogService.createdBlog({
      name: req.body.name,
      description: req.body.description,
      websiteUrl: req.body.websiteUrl,
    })

    res.status(HTTPStatuses.CREATED201).send(this._getBlogViewModel(createdBlog))
  }
  async createPostByBlogId(req: RequestWithParamsAndBody<URIParamsPostsByBlogId, CreatePostForBlogModel> & any, res: Response<PostViewModel | ErrorsMessageType>) {
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

    res.status(HTTPStatuses.CREATED201).send(this._getPostViewModel(createdPostByBlogId, req?.user?.userId))
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
  _getMyPostStatus(db: PostType, userId: string): LikeStatuses {
    if (!userId) {
      return LikeStatuses.NONE
    }

    const currentLike1 = db.likes.find(item => item.userId === userId)

    if (!currentLike1) {
      return LikeStatuses.NONE
    }

    return currentLike1.likeStatus
  }
  _getBlogViewModel(dbBlog: BlogType): BlogViewModel {
    return {
      id: dbBlog.id,
      name: dbBlog.name,
      description: dbBlog.description,
      websiteUrl: dbBlog.websiteUrl,
      createdAt: dbBlog.createdAt,
    }
  }
  _getPostViewModel(dbPost: PostType, userId: string): PostViewModel {
    const myStatus = this._getMyPostStatus(dbPost, userId)
    /*const newestLikes = dbPost.likes
      .filter(item => item.likeStatus === LikeStatuses.LIKE)
      .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)))
      .slice(0, 3)*/

    return {
      id: dbPost.id,
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      createdAt: dbPost.createdAt,
      extendedLikesInfo: {
        likesCount: dbPost.likesCount,
        dislikesCount: dbPost.dislikesCount,
        myStatus: myStatus,
        newestLikes: dbPost.newestLikes.map(item => ({
          addedAt: item.addedAt,
          userId: item.userId,
          login: item.login,
        })),
      }
    }
  }
  _getBlogsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<BlogType>): ResponseViewModelDetail<BlogViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        websiteUrl: item.websiteUrl,
        createdAt: item.createdAt,
      })),
    }
  }
  _getPostsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<PostType>, userId: string): ResponseViewModelDetail<PostViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => {
        const myStatus = this._getMyPostStatus(item, userId)
        /*const newestLikes = item.likes
          .filter(item => item.likeStatus === LikeStatuses.LIKE)
          .sort((a, b) => moment(b.createdAt).diff(moment(a.createdAt)))
          .slice(0, 3)*/

        return {
        id: item.id,
        title: item.title,
        shortDescription: item.shortDescription,
        content: item.content,
        blogId: item.blogId,
        blogName: item.blogName,
        createdAt: item.createdAt,
        extendedLikesInfo: {
          likesCount: item.likesCount,
          dislikesCount: item.dislikesCount,
          myStatus: myStatus,
          newestLikes: item.newestLikes.map(item => ({
            addedAt: item.addedAt,
            userId: item.userId,
            login: item.login,
          })),
        }
      }}),
    }
  }
}

import { Response } from 'express'
import { isEmpty } from 'lodash'
import { BlogService, PostService, CommentService } from '../services'

import {
  RequestWithBody,
  RequestWithQuery,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  URIParamsPostModel,
  URIParamsCommentsByPostId,
  QueryPostModel,
  QueryCommentModel,
  CreatePostModel,
  CreateCommentsModel,
  UpdatePostModel,
  PostViewModel,
  CommentType,
  CommentViewModel,
  ResponseViewModelDetail,
  LikeStatuses,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

export class PostsController {
  constructor(
    protected postService: PostService,
    protected blogService: BlogService,
    protected commentService: CommentService,
  ) {}
  async getPosts(req: RequestWithQuery<QueryPostModel>, res: Response<ResponseViewModelDetail<PostViewModel>>) {
    const allPosts = await this.postService.findAllPosts({
      searchNameTerm: req.query.searchNameTerm,
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })
    
    res.status(HTTPStatuses.SUCCESS200).send(allPosts)
  }
  async getPost(req: RequestWithParams<URIParamsPostModel>, res: Response<PostViewModel>) {
    const postById = await this.postService.findPostById(req.params.id)

    if (!postById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.SUCCESS200).send(postById)
  }
  async getCommentsByPostId(req: RequestWithParamsAndQuery<URIParamsCommentsByPostId, QueryCommentModel> & any, res: Response<ResponseViewModelDetail<CommentViewModel>>) {
    const postById = await this.postService.findPostById(req.params.postId)

    if (!postById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    const commentsByPostId = await this.commentService.findAllCommentsByPostId(req.params.postId, {
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })

    res.status(HTTPStatuses.SUCCESS200).send(this._getCommentsViewModelDetail(commentsByPostId, req?.user?.userId))
  }
  async createPost(req: RequestWithBody<CreatePostModel>, res: Response<PostViewModel | ErrorsMessageType>) {
    const blogById = await this.blogService.findBlogById(req.body.blogId)

    if (isEmpty(blogById)) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    const createdPost = await this.postService.createdPost({
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      blogId: blogById.id,
      blogName: blogById.name,
    })

    res.status(HTTPStatuses.CREATED201).send(createdPost)
  }
  async createCommentsByPostId(req: RequestWithParamsAndBody<URIParamsCommentsByPostId, CreateCommentsModel> & any, res: Response<CommentViewModel | ErrorsMessageType>) {
    const postById = await this.postService.findPostById(req.params.postId)
    
    if (!postById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    const createdCommentByPostId = await this.commentService.createdComment({
      content: req.body.content,
      postId: postById.id,
      userId: req.user!.userId,
      userLogin: req.user!.login,
    })

    res.status(HTTPStatuses.CREATED201).send(this._getCommentViewModel(createdCommentByPostId, req?.user?.userId))
  }
  async updatePost(req: RequestWithParamsAndBody<URIParamsPostModel, UpdatePostModel>, res: Response<boolean>) {
    const blogById = await this.blogService.findBlogById(req.body.blogId)

    if (isEmpty(blogById)) {
      return res.status(HTTPStatuses.BADREQUEST400).send()
    }

    const isPostUpdated = await this.postService.updatePost({
      id: req.params.id,
      title: req.body.title,
      shortDescription: req.body.shortDescription,
      content: req.body.content,
      blogId: blogById.id,
      blogName: blogById.name,
    })

    if (!isPostUpdated) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async deletePost(req: RequestWithParams<URIParamsPostModel>, res: Response<boolean>) {
    const isPostDeleted = await this.postService.deletePostById(req.params.id)

    if (!isPostDeleted) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  _getMyStatus(dbComment: CommentType, userId: string): LikeStatuses {
    if (!userId) {
      return LikeStatuses.NONE
    }

    const currentLike = dbComment.likes.find(item => item.userId === userId)

    if (currentLike) {
      return currentLike.likeStatus
    }

    const currentDislike = dbComment.dislikes.find(item => item.userId === userId)

    if (currentDislike) {
      return currentDislike.likeStatus
    }

    return LikeStatuses.NONE
    
  }
  _getCommentViewModel(dbComment: CommentType, userId: string): CommentViewModel {
    const myStatus = this._getMyStatus(dbComment, userId)

    return {
      id: dbComment.id,
      content: dbComment.content,
      commentatorInfo: {
        userId: dbComment.userId,
        userLogin: dbComment.userLogin,
      },
      createdAt: dbComment.createdAt,
      likesInfo: {
        likesCount: dbComment.likesCount,
        dislikesCount: dbComment.dislikesCount,
        myStatus,
        likes: dbComment.likes,
        dislikes: dbComment.dislikes,
      },      
    }
  }
  _getCommentsViewModelDetail({
    items,
    totalCount,
    pagesCount,
    page,
    pageSize,
  }: ResponseViewModelDetail<CommentType>, userId: string): ResponseViewModelDetail<CommentViewModel> {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => {
        const myStatus = this._getMyStatus(item, userId)

        return {
          id: item.id,
          content: item.content,
          commentatorInfo: {
            userId: item.userId,
            userLogin: item.userLogin,
          },
          createdAt: item.createdAt,
          likesInfo: {
            likesCount: item.likesCount,
            dislikesCount: item.dislikesCount,
            myStatus,
            likes: item.likes,
            dislikes: item.dislikes,
          },      
        }
      }),
    }
  }
}

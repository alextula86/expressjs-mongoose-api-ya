import { Response } from 'express'
import { injectable } from 'inversify'
import { isEmpty } from 'lodash'
// import moment from 'moment'
import { BlogService, PostService, CommentService } from '../services'

import {
  PostType,
  RequestWithBody,
  RequestWithQuery,
  RequestWithParams,
  RequestWithParamsAndBody,
  RequestWithParamsAndQuery,
  URIParamsPostModel,
  URIParamsCommentsByPostId,
  UserRequestModel,
  QueryPostModel,
  QueryCommentModel,
  CreatePostModel,
  CreateCommentsModel,
  UpdatePostModel,
  PostViewModel,
  CommentType,
  CommentViewModel,
  AddLikeToPostModel,
  ResponseViewModelDetail,
  LikeStatuses,
  HTTPStatuses,
  ErrorsMessageType,
} from '../types'

@injectable()
export class PostsController {
  constructor(
    protected postService: PostService,
    protected blogService: BlogService,
    protected commentService: CommentService,
  ) {}
  async getPosts(req: RequestWithQuery<QueryPostModel> & any, res: Response<ResponseViewModelDetail<PostViewModel>>) {
    const allPosts = await this.postService.findAllPosts({
      searchNameTerm: req.query.searchNameTerm,
      pageNumber: req.query.pageNumber, 
      pageSize: req.query.pageSize,
      sortBy: req.query.sortBy,
      sortDirection: req.query.sortDirection,
    })
    
    res.status(HTTPStatuses.SUCCESS200).send(this._getPostsViewModelDetail(allPosts, req?.user?.userId))
  }
  async getPost(req: RequestWithParams<URIParamsPostModel> & any, res: Response<PostViewModel>) {
    const postById = await this.postService.findPostById(req.params.id)

    if (!postById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.SUCCESS200).send(this._getPostViewModel(postById, req?.user?.userId))
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
  async createPost(req: RequestWithBody<CreatePostModel> & any, res: Response<PostViewModel | ErrorsMessageType>) {
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

    res.status(HTTPStatuses.CREATED201).send(this._getPostViewModel(createdPost, req?.user?.userId))
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
  async updateCommentLikeStatus(req: RequestWithParamsAndBody<URIParamsPostModel, AddLikeToPostModel> & UserRequestModel & any, res: Response<boolean>) {
    // Получить сначала юзера!!!!
    const postById = await this.postService.findPostById(req.params.id)

    if (isEmpty(postById)) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    const isLikeUpdated = await this.postService.updatePostLikeStatus(postById.id, {
      userId: req.user!.userId,
      userLogin: req.user!.login,
      likeStatus: req.body.likeStatus,
    })

    if (!isLikeUpdated) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }

    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  _getMyCommentStatus(db: CommentType, userId: string): LikeStatuses {
    if (!userId) {
      return LikeStatuses.NONE
    }

    const currentLike1 = db.likes.find(item => item.userId === userId)

    if (!currentLike1) {
      return LikeStatuses.NONE
    }

    return currentLike1.likeStatus
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
        // likes: dbPost.likes,
      }
    }
  }
  _getCommentViewModel(dbComment: CommentType, userId: string): CommentViewModel {
    const myStatus = this._getMyCommentStatus(dbComment, userId)

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
        // likes: dbComment.likes,
      },      
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
          // likes: item.likes,
        }
      }}),
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
        const myStatus = this._getMyCommentStatus(item, userId)

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
            // likes: item.likes,
          },      
        }
      }),
    }
  }
}

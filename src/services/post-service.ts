import { injectable, inject } from 'inversify'
import { trim } from 'lodash'
import { PostRepository } from '../repositories'

import {
  PostType,
  LikeStatusPostType,
  QueryPostModel,
  UpdatePostService,
  CreaetPostService,
  UpdateLikeToPostService,
  ResponseViewModelDetail,
  SortDirection,
} from '../types'

@injectable()
export class PostService {
  constructor(@inject(PostRepository) protected postRepository: PostRepository){}
  async findAllPosts({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy = 'createdAt',
    sortDirection =  SortDirection.DESC,
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostType>> {
    const foundAllPosts = await this.postRepository.findAllPosts({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    })

    return foundAllPosts
  }
  async findPostById(id: string): Promise<PostType | null> {
    const foundPostById = await this.postRepository.findPostById(id)

    return foundPostById
  }
  async createdPost({
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

    const createdPost = await this.postRepository.createdPost(newPost)

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
    const updatedPost = {
      id,
      title: trim(String(title)),
      shortDescription: trim(String(shortDescription)),
      content: trim(String(content)),
      blogId,
      blogName,
    }

    const isUpdatedPost = await this.postRepository.updatePost(updatedPost)

    return isUpdatedPost
  }
  async updatePostLikeStatus(postId: string, {
    userId,
    userLogin,
    likeStatus,
  }: UpdateLikeToPostService): Promise<boolean> {
    // Определяем лайкал ли пользователь пост
    const foundPostLikeStatuses = await this.postRepository.findPostLikeStatusesByUserId(postId, userId)
    // Если пользователь не лайкал пост, то создаем инстанс лайк статуса и добавляем его для поста
    if (!foundPostLikeStatuses) {
      const createdLikeStatus = new LikeStatusPostType(userId, userLogin, likeStatus)
      const isAddPostLikeStatus = await this.postRepository.addPostLikeStatus(postId, createdLikeStatus)

      return isAddPostLikeStatus
    }

    // Определяем лайк статус пользователя
    const likeStatusUserData = foundPostLikeStatuses.likes.find(item => item.userId === userId)

    // Если лайк статус пользователя равен переданому лайк статусу не производим обновление лайк статуса
    if (likeStatusUserData && likeStatusUserData.likeStatus === likeStatus) {
      return true
    }

    // Обновляем лайк статус пользователя
    const isUpdatedPostLikeStatuses = await this.postRepository.updatePostLikeStatusesByUserId(postId, userId, likeStatus)

    return isUpdatedPostLikeStatuses
  }
  async deletePostById(id: string): Promise<boolean> {
    const isDeletePostById = await this.postRepository.deletePostById(id)

    return isDeletePostById
  }
}

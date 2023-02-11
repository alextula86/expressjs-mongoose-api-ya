import { injectable, inject } from 'inversify'
import { trim } from 'lodash'
import { PostRepository } from '../repositories/post/post-db-mongoose-repository'

import {
  PostType,
  PostViewModel,
  QueryPostModel,
  UpdatePostService,
  CreaetPostService,
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
  }: QueryPostModel): Promise<ResponseViewModelDetail<PostViewModel>> {
    const foundAllPosts = await this.postRepository.findAllPosts({
      searchNameTerm,
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
    })

    return foundAllPosts
  }
  async findPostById(id: string): Promise<PostViewModel | null> {
    const foundPostById = await this.postRepository.findPostById(id)

    return foundPostById
  }
  async createdPost({
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
    const updatedPost: PostType = {
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
  async deletePostById(id: string): Promise<boolean> {
    const isDeletePostById = await this.postRepository.deletePostById(id)

    return isDeletePostById
  }
}

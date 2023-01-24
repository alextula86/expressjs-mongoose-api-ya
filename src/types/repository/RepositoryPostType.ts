import { PostViewModel, QueryPostModel } from '../models'
import { UpdatePostService } from '../service'
import { PostType } from '../schema'
import { ResponseViewModelDetail } from '../response'

export type RepositoryPostType = {
  findAllPosts: ({ searchNameTerm, pageNumber, pageSize, sortBy, sortDirection }: QueryPostModel) => Promise<ResponseViewModelDetail<PostViewModel>>
  findPostById: (id: string) => Promise<PostViewModel | null>
  createdPost: ({ id, title, shortDescription, content, blogId, blogName, createdAt }: PostType) => Promise<PostViewModel>
  updatePost: ({ id, title, shortDescription, content, blogId, blogName }: PostType) => Promise<boolean>
  deletePostById: (id: string) => Promise<boolean>
  _getPostViewModel: (dbPost: PostType) => PostViewModel
  _getPostsViewModelDetail: ({ items, totalCount, pagesCount, page, pageSize }: ResponseViewModelDetail<PostType>) => ResponseViewModelDetail<PostViewModel>
}

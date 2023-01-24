import { QueryCommentModel, CommentViewModel } from '../models'
import { UpdateCommentService } from '../service'
import { CommentType } from '../schema'
import { ResponseViewModelDetail } from '../response'

export type RepositoryCommentType = {
  findAllCommentsByPostId: (postId: string, { pageNumber, pageSize, sortBy, sortDirection }: QueryCommentModel) => Promise<ResponseViewModelDetail<CommentViewModel>>
  findCommentById: (id: string) => Promise<CommentViewModel | null>
  createdComment: (createdComment: CommentType) => Promise<CommentViewModel>
  updateComment: ({ id, content }: UpdateCommentService) => Promise<boolean>
  deleteCommentById: (id: string) => Promise<boolean>
  _getCommentViewModel: (dbComments: CommentType) => CommentViewModel
  _getCommentsViewModelDetail: ({ items, totalCount, pagesCount, page, pageSize }: ResponseViewModelDetail<CommentType>) => ResponseViewModelDetail<CommentViewModel>
}

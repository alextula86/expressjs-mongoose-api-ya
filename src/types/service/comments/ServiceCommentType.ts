import { QueryCommentModel, CommentViewModel } from '../../models'
import { ResponseViewModelDetail } from '../../response'
import { CreateCommentService, UpdateCommentService } from '../../service'

export type ServiceCommentType = {
  findAllCommentsByPostId: (postId: string, { pageNumber, pageSize, sortBy, sortDirection }: QueryCommentModel) => Promise<ResponseViewModelDetail<CommentViewModel>>
  findCommentById: (id: string) => Promise<CommentViewModel | null>
  createdComment: ({ content, postId, userId, userLogin }: CreateCommentService) => Promise<CommentViewModel>
  updateComment: ({ id, content }: UpdateCommentService) => Promise<boolean>
  deleteCommentById: (id: string) => Promise<boolean>
}

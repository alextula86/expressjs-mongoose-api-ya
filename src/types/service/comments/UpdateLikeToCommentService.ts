import { LikeStatuses } from '../../enums'

export type UpdateLikeToCommentService = {
  userId: string
  userLogin: string
  likeStatus: LikeStatuses
}

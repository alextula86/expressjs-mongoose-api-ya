import { LikeStatuses } from '../../enums'

export type UpdateLikeToPostService = {
  userId: string
  userLogin: string
  likeStatus: LikeStatuses
}

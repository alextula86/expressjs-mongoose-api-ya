import { LikeStatusCommentType } from '../../schema'
import { LikeStatuses } from '../../enums'

type CommentatorInfo = {
  userId: string,
  userLogin: string,
}

type LikesInfo = {
  likesCount: number
  dislikesCount: number
  myStatus: LikeStatuses
  likes?: LikeStatusCommentType[]
  dislikes?: LikeStatusCommentType[]
}

export type CommentViewModel = {
  id: string
  content: string
  commentatorInfo: CommentatorInfo
  createdAt: string
  likesInfo: LikesInfo
 
}

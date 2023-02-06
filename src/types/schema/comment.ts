import { getNextStrId } from '../../utils'
import { LikeStatuses } from '../enums'

export class LikeStatusCommentType {
  id: string
  createdAt: string
  constructor(
    public userId: string,
    public userLogin: string,
    public likeStatus: LikeStatuses,
  ) {
    this.id = getNextStrId()
    this.createdAt = new Date().toISOString()
  }
}

export class CommentType {
  id: string
  createdAt: string
  likesCount: number
  dislikesCount: number
  likes: LikeStatusCommentType[]
  dislikes: LikeStatusCommentType[]
  constructor(
    public content: string,
    public postId: string,
    public userId: string,
    public userLogin: string,
  ) {
    this.id = getNextStrId()
    this.likesCount = 0
    this.dislikesCount = 0
    this.likes = []
    this.dislikes = []
    this.createdAt = new Date().toISOString()
  }
}
  
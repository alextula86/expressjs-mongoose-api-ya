import { getNextStrId } from '../../utils'
import { LikeStatuses } from '../enums'

export class LikeStatusPostType {
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

export class PostType {
  id: string
  createdAt?: string
  likesCount: number
  dislikesCount: number
  likes: LikeStatusPostType[]
  constructor(
    public title: string,
    public shortDescription: string,
    public content: string,
    public blogId: string,
    public blogName: string,
  ) {
    this.id = getNextStrId()
    this.likesCount = 0
    this.dislikesCount = 0
    this.likes = []
    this.createdAt = new Date().toISOString()
  }
}

import { LikeStatusPostType, NewestLikes } from '../../schema'
import { LikeStatuses } from '../../enums'

type ExtendedLikesInfo = {
  likesCount: number
  dislikesCount: number
  myStatus: LikeStatuses
  newestLikes: NewestLikes[]
  likes?: LikeStatusPostType[]
  
}

export type PostViewModel = {
  id: string
  title: string
  shortDescription: string
  content: string
  blogId: string
  blogName: string
  createdAt?: string
  extendedLikesInfo: ExtendedLikesInfo
}



import { getNextStrId } from '../../utils'
  
export class CommentType {
  id: string
  createdAt: string
  constructor(
    public content: string,
    public postId: string,
    public userId: string,
    public userLogin: string,
  ) {
    this.id = getNextStrId()
    this.createdAt = new Date().toISOString()
  }
}
  
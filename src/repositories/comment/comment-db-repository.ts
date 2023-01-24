import { commentCollection } from '../db'
import { RepositoryCommentType, CommentType, SortDirection } from '../../types'

export const commentRepository: RepositoryCommentType = {
  async findAllCommentsByPostId(postId, {
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }) {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10
    
    const filter: any = { postId: { $eq: postId } }
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    const totalCount = await commentCollection.count(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const comments: CommentType[] = await commentCollection
      .find(filter) 
      .sort(sort)
      .skip(skip)
      .limit(size)
      .toArray()

    return this._getCommentsViewModelDetail({
      items: comments,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  },
  async findCommentById(id) {
    const foundComment: CommentType | null = await commentCollection.findOne({ id })

    if (!foundComment) {
      return null
    }

    return this._getCommentViewModel(foundComment)
  },
  async createdComment(createdComment) {
    await commentCollection.insertOne(createdComment)

    return this._getCommentViewModel(createdComment)
  },  
  async updateComment({id, content }) {
    const { matchedCount } = await commentCollection.updateOne({ id }, {
      $set: { content }
    })

    return matchedCount === 1
  },
  async deleteCommentById(id) {
    const { deletedCount } = await commentCollection.deleteOne({ id })

    return deletedCount === 1
  },
  _getCommentViewModel(dbComments) {
    return {
      id: dbComments.id,
      content: dbComments.content,
      userId: dbComments.userId,
      userLogin: dbComments.userLogin,
      createdAt: dbComments.createdAt,
    }
  },
  _getCommentsViewModelDetail({ items, totalCount, pagesCount, page, pageSize }) {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        content: item.content,
        userId: item.userId,
        userLogin: item.userLogin,
        createdAt: item.createdAt,
      })),
    }
  },
}

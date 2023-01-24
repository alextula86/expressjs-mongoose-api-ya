import { postCollection } from '../../repositories/db'
import { RepositoryPostType, PostType, SortDirection } from '../../types'

export const postRepository: RepositoryPostType = {
  async findAllPosts({
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }) {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10

    const filter: any = {}
    const sort: any = { [sortBy]: sortDirection === SortDirection.ASC ? 1 : -1 }

    if (searchNameTerm) {
      filter.title = { $regex: searchNameTerm, $options: 'i' }
    }

    const totalCount = await postCollection.count(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const posts: PostType[] = await postCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .toArray()

    return this._getPostsViewModelDetail({
      items: posts,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  },
  async findPostById(id) {
    const foundPost: PostType | null = await postCollection.findOne({ id })

    if (!foundPost) {
      return null
    }

    return this._getPostViewModel(foundPost)
  },
  async createdPost(createdPost) {
    await postCollection.insertOne(createdPost)

    return this._getPostViewModel(createdPost)
  },
  async updatePost({ id, title, shortDescription, content, blogId, blogName }) {
    const { matchedCount } = await postCollection.updateOne({ id }, {
      $set: {
        title,
        shortDescription,
        content,
        blogId,
        blogName,
      }
    })

    return matchedCount === 1   
  },
  async deletePostById(id) {
    const { deletedCount } = await postCollection.deleteOne({ id })

    return deletedCount === 1
  },
  _getPostViewModel(dbPost) {
    return {
      id: dbPost.id,
      title: dbPost.title,
      shortDescription: dbPost.shortDescription,
      content: dbPost.content,
      blogId: dbPost.blogId,
      blogName: dbPost.blogName,
      createdAt: dbPost.createdAt,
    }
  },
  _getPostsViewModelDetail({ items, totalCount, pagesCount, page, pageSize }) {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        title: item.title,
        shortDescription: item.shortDescription,
        content: item.content,
        blogId: item.blogId,
        blogName: item.blogName,
        createdAt: item.createdAt,
      })),
    }
  },
}

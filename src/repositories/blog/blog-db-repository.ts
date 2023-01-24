import { blogCollection, postCollection } from '../../repositories/db'
import { RepositoryBlogType, BlogType, PostType, SortDirection  } from '../../types'

export const blogRepository: RepositoryBlogType = {
  async findAllBlogs({
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
      filter.name = { $regex: searchNameTerm, $options: 'i' }
    }

    const totalCount = await blogCollection.count(filter)
    const pagesCount = Math.ceil(totalCount / size)
    const skip = (number - 1) * size

    const blogs: BlogType[] = await blogCollection
      .find(filter)
      .sort(sort)
      .skip(skip)
      .limit(size)
      .toArray()

    return this._getBlogsViewModelDetail({
      items: blogs,
      totalCount,
      pagesCount,
      page: number,
      pageSize: size,
    })
  },
  async findBlogById(id) {
    const foundBlog: BlogType | null = await blogCollection.findOne({ id })

    if (!foundBlog) {
      return null
    }

    return this._getBlogViewModel(foundBlog)
  },
  async findPostsByBlogId(blogId, {
    searchNameTerm,
    pageNumber,
    pageSize,
    sortBy,
    sortDirection,
  }) {
    const number = pageNumber ? Number(pageNumber) : 1
    const size = pageSize ? Number(pageSize) : 10

    const filter: any = { blogId: { $eq: blogId } }
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
  async createdBlog(createdBlog) {
    await blogCollection.insertOne(createdBlog)

    return this._getBlogViewModel(createdBlog)
  },
  async createdPostByBlogId(createdPost) {
    await postCollection.insertOne(createdPost)

    return this._getPostViewModel(createdPost)
  },
  async updateBlog({id, name, description, websiteUrl }) {
    const { matchedCount } = await blogCollection.updateOne({ id }, {
      $set: {
        name,
        description,
        websiteUrl,
      }
    })

    return matchedCount === 1
  },
  async deleteBlogById(id) {
    const { deletedCount } = await blogCollection.deleteOne({ id })

    return deletedCount === 1
  },
  _getBlogViewModel(dbBlog) {
    return {
      id: dbBlog.id,
      name: dbBlog.name,
      description: dbBlog.description,
      websiteUrl: dbBlog.websiteUrl,
      createdAt: dbBlog.createdAt,
    }
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
  _getBlogsViewModelDetail({ items, totalCount, pagesCount, page, pageSize }) {
    return {
      pagesCount,
      page,
      pageSize,
      totalCount,
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        websiteUrl: item.websiteUrl,
        createdAt: item.createdAt,
      })),
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

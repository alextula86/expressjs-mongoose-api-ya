import { BlogViewModel, PostViewModel, QueryBlogModel, QueryPostModel } from '../models'
import { UpdateBlogService } from '../service'
import { BlogType, PostType } from '../schema'
import { ResponseViewModelDetail } from '../response'

export type RepositoryBlogType = {
  findAllBlogs: ({ searchNameTerm, pageNumber, pageSize, sortBy, sortDirection }: QueryBlogModel) => Promise<ResponseViewModelDetail<BlogViewModel>>
  findBlogById: (id: string) => Promise<BlogViewModel | null>
  findPostsByBlogId: (blogId: string, { searchNameTerm, pageNumber, pageSize, sortBy, sortDirection }: QueryPostModel) => Promise<ResponseViewModelDetail<PostViewModel>>
  createdBlog: (createdBlog: BlogType) => Promise<BlogViewModel>
  createdPostByBlogId: (createdPost: PostType) => Promise<PostViewModel>
  updateBlog: ({ id, name, description, websiteUrl }: BlogType) => Promise<boolean>
  deleteBlogById: (id: string) => Promise<boolean>
  _getBlogViewModel: (dbBlog: BlogType) => BlogViewModel
  _getPostViewModel: (dbPosts: PostType) => PostViewModel
  _getBlogsViewModelDetail: ({ items, totalCount, pagesCount, page, pageSize }: ResponseViewModelDetail<BlogType>) => ResponseViewModelDetail<BlogViewModel>
  _getPostsViewModelDetail: ({ items, totalCount, pagesCount, page, pageSize }: ResponseViewModelDetail<PostType>) => ResponseViewModelDetail<PostViewModel>
}

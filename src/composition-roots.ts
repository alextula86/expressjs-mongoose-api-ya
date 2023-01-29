import { BlogRepository } from './repositories/blog/blog-db-repository'
import { PostRepository } from './repositories/post/post-db-repository'
import { CommentRepository } from './repositories/comment/comment-db-repository'

import { BlogService, PostService, CommentService } from './services'
import { BlogsController, PostsController, CommentsController } from './controllers'

const blogRepository = new BlogRepository()
const blogService = new BlogService(blogRepository)
export const blogsController = new BlogsController(blogService)

const commentRepository = new CommentRepository()
const commentService = new CommentService(commentRepository)
export const commentsController = new CommentsController(commentService)

const postRepository = new PostRepository()
const postService = new PostService(postRepository)
export const postsController = new PostsController(postService, blogService, commentService)

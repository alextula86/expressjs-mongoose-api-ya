import { BlogRepository } from './repositories/blog/blog-db-repository'
import { PostRepository } from './repositories/post/post-db-repository'
import { CommentRepository } from './repositories/comment/comment-db-repository'
import { UserRepository } from './repositories/user/user-db-mongoose-repository'
import { DeviceRepository } from './repositories/device/device-db-repository'

import {
    BlogService,
    PostService,
    CommentService,
    UserService,
    AuthService,
    DeviceService,
} from './services'

import {
    BlogsController,
    PostsController,
    CommentsController,
    UserController,
    AuthController,
    DeviceController,
} from './controllers'

const blogRepository = new BlogRepository()
const blogService = new BlogService(blogRepository)
export const blogsController = new BlogsController(blogService)

const commentRepository = new CommentRepository()
const commentService = new CommentService(commentRepository)
export const commentsController = new CommentsController(commentService)

const postRepository = new PostRepository()
const postService = new PostService(postRepository)
export const postsController = new PostsController(postService, blogService, commentService)

const userRepository = new UserRepository()
const userService = new UserService(userRepository)
export const userController = new UserController(userService)

const deviceRepository = new DeviceRepository()
const deviceService = new DeviceService(deviceRepository)
export const deviceController = new DeviceController(deviceService)

const authService = new AuthService(userRepository, userService)
export const authController = new AuthController(authService, userService, deviceService)

import 'reflect-metadata'
import { Container } from 'inversify'

import { BlogRepository } from './repositories/blog/blog-db-mongoose-repository'
import { PostRepository } from './repositories/post/post-db-mongoose-repository'
import { CommentRepository } from './repositories/comment/comment-db-mongoose-repository'
import { UserRepository } from './repositories/user/user-db-mongoose-repository'
import { DeviceRepository } from './repositories/device/device-db-mongoose-repository'

import {
    BlogService,
    PostService,
    CommentService,
    UserService,
    AuthService,
    DeviceService,
    SessionService,
} from './services'

import {
    BlogsController,
    PostsController,
    CommentsController,
    UserController,
    AuthController,
    DeviceController,
} from './controllers'

/*const blogRepository = new BlogRepository()
const blogService = new BlogService(blogRepository)
export const blogsController = new BlogsController(blogService)*/

/*const commentRepository = new CommentRepository()
const commentService = new CommentService(commentRepository)
export const commentsController = new CommentsController(commentService)*/

/*const postRepository = new PostRepository()
const postService = new PostService(postRepository)
export const postsController = new PostsController(postService, blogService, commentService)
*/
/*const userRepository = new UserRepository()
const userService = new UserService(userRepository)
export const userController = new UserController(userService)

const deviceRepository = new DeviceRepository()
const deviceService = new DeviceService(deviceRepository)
export const deviceController = new DeviceController(deviceService)

const authService = new AuthService(userRepository, userService)
export const authController = new AuthController(authService, userService, deviceService)*/

export const container = new Container()

container.bind(BlogsController).to(BlogsController)
container.bind<BlogService>(BlogService).to(BlogService)
container.bind<BlogRepository>(BlogRepository).to(BlogRepository)

container.bind(PostsController).to(PostsController)
container.bind<PostService>(PostService).to(PostService)
container.bind<PostRepository>(PostRepository).to(PostRepository)

container.bind(CommentsController).to(CommentsController)
container.bind<CommentService>(CommentService).to(CommentService)
container.bind<CommentRepository>(CommentRepository).to(CommentRepository)

container.bind(DeviceController).to(DeviceController)
container.bind<DeviceService>(DeviceService).to(DeviceService)
container.bind<DeviceRepository>(DeviceRepository).to(DeviceRepository)

container.bind(AuthController).to(AuthController)
container.bind<AuthService>(AuthService).to(AuthService)

container.bind<SessionService>(SessionService).to(SessionService)

container.bind(UserController).to(UserController)
container.bind<UserService>(UserService).to(UserService)
container.bind<UserRepository>(UserRepository).to(UserRepository)

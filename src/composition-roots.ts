import 'reflect-metadata'
import { Container } from 'inversify'

import { BlogRepository } from './repositories/blog/blog-db-mongoose-repository'
import { PostRepository } from './repositories/post/post-db-mongoose-repository'
import { CommentRepository } from './repositories/comment/comment-db-mongoose-repository'
import { UserRepository } from './repositories/user/user-db-mongoose-repository'
import { DeviceRepository } from './repositories/device/device-db-mongoose-repository'
import { SessionRepository } from './repositories/session/session-db-mongoose-repository'

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

export const container = new Container()

container.bind(BlogsController).to(BlogsController)
container.bind(BlogService).to(BlogService)
container.bind(BlogRepository).to(BlogRepository)

container.bind(PostsController).to(PostsController)
container.bind(PostService).to(PostService)
container.bind(PostRepository).to(PostRepository)

container.bind(CommentsController).to(CommentsController)
container.bind(CommentService).to(CommentService)
container.bind(CommentRepository).to(CommentRepository)

container.bind(DeviceController).to(DeviceController)
container.bind(DeviceService).to(DeviceService)
container.bind(DeviceRepository).to(DeviceRepository)

container.bind(AuthController).to(AuthController)
container.bind(AuthService).to(AuthService)

container.bind(SessionService).to(SessionService)
container.bind(SessionRepository).to(SessionRepository)

container.bind(UserController).to(UserController)
container.bind(UserService).to(UserService)
container.bind(UserRepository).to(UserRepository)

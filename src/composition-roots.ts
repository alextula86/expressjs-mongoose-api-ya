import 'reflect-metadata'
import { Container } from 'inversify'

import { 
    BlogRepository,
    PostRepository,
    CommentRepository,
    UserRepository,
    DeviceRepository,
    SessionRepository,
} from './repositories'

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

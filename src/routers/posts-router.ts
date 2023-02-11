import { Router } from 'express'
import { PostsController } from '../controllers'
import { container } from '../composition-roots'

import {
  authBasicMiddleware,
  authBearerMiddleware,
  getUserByBearerOrRefreshTokenMiddleware,
  titlePostValidation,
  shortPostDescriptionValidation,
  contentPostValidation,
  blogIdPostValidation,
  contentCommentValidation,
  inputValidationMiddleware,
} from '../middlewares'

export const postsRouter = Router()

const middlewares = [
  authBasicMiddleware,
  titlePostValidation,
  shortPostDescriptionValidation,
  contentPostValidation,
  blogIdPostValidation,
  inputValidationMiddleware,
]

const middlewaresComment = [
  authBearerMiddleware,
  contentCommentValidation,
  inputValidationMiddleware
]

const postsController = container.resolve(PostsController)

postsRouter
  .get('/', postsController.getPosts.bind(postsController))
  .get('/:id', postsController.getPost.bind(postsController) )
  .get('/:postId/comments', getUserByBearerOrRefreshTokenMiddleware, postsController.getCommentsByPostId.bind(postsController) )  
  .post('/', middlewares, postsController.createPost.bind(postsController) )
  .post('/:postId/comments', middlewaresComment, postsController.createCommentsByPostId.bind(postsController) )
  .put('/:id', middlewares, postsController.updatePost.bind(postsController) )
  .delete('/:id', authBasicMiddleware, postsController.deletePost.bind(postsController) )

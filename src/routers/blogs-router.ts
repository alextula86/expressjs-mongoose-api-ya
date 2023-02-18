import { Router } from 'express'
import { BlogsController } from '../controllers'
import { container } from '../composition-roots'
import {
  authBasicMiddleware,
  authBearerMiddleware,
  getUserByBearerOrRefreshTokenMiddleware,
  nameBlogValidation,
  descriptionBlogValidation,
  websiteUrlBlogValidation,
  titlePostValidation,
  shortPostDescriptionValidation,
  contentPostValidation,
  inputValidationMiddleware,
} from '../middlewares'

export const blogsRouter = Router()

const middlewares = [
  authBasicMiddleware,
  nameBlogValidation,
  descriptionBlogValidation,
  websiteUrlBlogValidation,
  inputValidationMiddleware
]

const middlewaresPost = [
  authBearerMiddleware,
  titlePostValidation,
  shortPostDescriptionValidation,
  contentPostValidation,
  inputValidationMiddleware
]

const blogsController = container.resolve(BlogsController)

blogsRouter
  .get('/', blogsController.getBlogs.bind(blogsController))
  .get('/:id', blogsController.getBlog.bind(blogsController))
  .get('/:blogId/posts', getUserByBearerOrRefreshTokenMiddleware, blogsController.getPostsByBlogId.bind(blogsController))
  .post('/', middlewares, blogsController.createBlog.bind(blogsController))
  .post('/:blogId/posts', middlewaresPost, blogsController.createPostByBlogId.bind(blogsController))  
  .put('/:id', middlewares, blogsController.updateBlog.bind(blogsController))
  .delete('/:id', authBasicMiddleware, blogsController.deleteBlog.bind(blogsController))

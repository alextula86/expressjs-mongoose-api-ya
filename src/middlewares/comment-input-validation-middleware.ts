import { body } from 'express-validator';
import { commentsErrorsValidator } from '../errors'

export const contentCommentValidation = body('content')
    .not().isEmpty()
    .withMessage(commentsErrorsValidator.contentError.message)
    .isString()
    .withMessage(commentsErrorsValidator.contentError.message)
    .trim()
    .isLength({ min: 20, max: 300 })
    .withMessage(commentsErrorsValidator.contentError.message)

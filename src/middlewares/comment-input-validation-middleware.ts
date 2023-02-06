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

export const likeStatusCommentValidation = body('likeStatus')
    .not().isEmpty()
    .withMessage(commentsErrorsValidator.likeStatus.message)
    .isString()
    .withMessage(commentsErrorsValidator.likeStatus.message)
    .trim()
    .matches(/^(Like|Dislike|None)$/)
    .withMessage(commentsErrorsValidator.likeStatus.message)

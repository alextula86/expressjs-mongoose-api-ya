import mongoose from 'mongoose'
import { LikeStatuses, CommentType, LikeStatusCommentType } from '../types'

const { Schema } = mongoose

const likeStatusCommentSchema = new Schema<LikeStatusCommentType>({
  id: {
    type: String,
    required: [true, 'The id field is required'],
  },

  userId: {
    type: String,
    required: [true, 'The userId field is required'],
  },

  userLogin: {
    type: String,
    required: [true, 'The userLogin field is required'],
    trim: true,
    minLength: [3, 'The userLogin field must be at least 3, got {VALUE}'],
    maxLength: [10, 'The userLogin field must be no more than 10, got {VALUE}'],
    match: /^[a-zA-Z0-9_-]*$/,
  },

  likeStatus: {
    type: String,
    enum: {
      values: [LikeStatuses.NONE, LikeStatuses.LIKE, LikeStatuses.DISLIKE],
      message: '{VALUE} is not supported',
    },
    default: LikeStatuses.NONE,
  },

  createdAt: {
    type: String,
    required: [true, 'The createdAt field is required'],
  },
});

export const commentSchema = new Schema<CommentType>({
  id: {
    type: String,
    required: [true, 'The id field is required'],
  },

  likesCount: {
    type: Number,
    default: 0,
  },

  dislikesCount: {
    type: Number,
    default: 0,
  },

  likes: {
    type: [likeStatusCommentSchema],
    default: [],
  },

  content: {
    type: String,
    required: [true, 'The content field is required'],
    trim: true,
    min: [20, 'The content field must be at least 20, got {VALUE}'],
    max: [300, 'The content field must be no more than 300, got {VALUE}'],
  },

  postId: {
    type: String,
    required: [true, 'The postId field is required'],
  },

  userId: {
    type: String,
    required: [true, 'The userId field is required'],
  },

  userLogin: {
    type: String,
    required: [true, 'The userLogin field is required'],
    trim: true,
    minLength: [3, 'The userLogin field must be at least 3, got {VALUE}'],
    maxLength: [10, 'The userLogin field must be no more than 10, got {VALUE}'],
    match: /^[a-zA-Z0-9_-]*$/,
  },

  createdAt: {
    type: String,
    required: [true, 'The createdAt field is required'],
  },
})

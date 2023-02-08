import mongoose from 'mongoose'
const { Schema } = mongoose

export const postSchema = new Schema({
  id: {
    type: String,
    required: [true, 'The id field is required'],
  },

  title: {
    type: String,
    required: [true, 'The title field is required'],
    trim: true,
    minLength: [3, 'The title field must be at least 3, got {VALUE}'],
    maxLength: [30, 'The title field must be no more than 30, got {VALUE}'],
  },

  shortDescription: {
    type: String,
    required: [true, 'The shortDescription field is required'],
    trim: true,
    minLength: [3, 'The shortDescription field must be at least 3, got {VALUE}'],
    maxLength: [100, 'The shortDescription field must be no more than 100, got {VALUE}'],
  },

  content: {
    type: String,
    required: [true, 'The content field is required'],
    trim: true,
    minLength: [3, 'The content field must be at least 3, got {VALUE}'],
    maxLength: [1000, 'The content field must be no more than 100, got {VALUE}'],
  },

  blogId: {
    type: String,
    required: [true, 'The blogId field is required'],
    trim: true,
    minLength: [1, 'The blogId field must be at least 1, got {VALUE}'],
    maxLength: [20, 'The blogId field must be no more than 20, got {VALUE}'],
  },

  blogName: {
    type: String,
    required: [true, 'The blogName field is required'],
    trim: true,
    minLength: [3, 'The blogName field must be at least 3, got {VALUE}'],
    maxLength: [15, 'The blogName field must be no more than 15, got {VALUE}'],
  },

  createdAt: {
    type: String,
    required: [true, 'The createdAt field is required'],
  },
})

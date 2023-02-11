import mongoose from 'mongoose'
const { Schema } = mongoose
import { BlogType } from '../types'

export const blogSchema = new Schema<BlogType>({
  id: {
    type: String,
    required: [true, 'The id field is required'],
  },

  name: {
    type: String,
    required: [true, 'The name field is required'],
    trim: true,
    minLength: [3, 'The name field must be at least 3, got {VALUE}'],
    maxLength: [15, 'The name field must be no more than 15, got {VALUE}'],
  },

  description: {
    type: String,
    required: [true, 'The description field is required'],
    trim: true,
    minLength: [3, 'The description field must be at least 3, got {VALUE}'],
    maxLength: [500, 'The description field must be no more than 500, got {VALUE}'],
  },

  websiteUrl: {
    type: String,
    required: [true, 'The websiteUrl field is required'],
  },

  createdAt: {
    type: String,
    required: [true, 'The createdAt field is required'],
    trim: true,
  },
})

import mongoose from 'mongoose'
const { Schema } = mongoose

export const deviceSchema = new Schema({
  id: {
    type: String,
    required: [true, 'The id field is required'],
  },

  ip: {
    type: String,
    required: [true, 'The ip field is required'],
  },

  title: {
    type: String,
    required: [true, 'The title field is required'],
  },

  userId: {
    type: String,
    required: [true, 'The userId field is required'],
  },

  active: {
    type: Boolean,
    default: true,
  },

  lastActiveDate: {
    type: String,
    required: [true, 'The lastActiveDate field is required'],
    trim: true,
  },
})

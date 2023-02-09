import mongoose from 'mongoose'
const { Schema } = mongoose

export const sessionSchema = new Schema({
  id: {
    type: String,
    required: [true, 'The id field is required'],
  },

  ip: {
    type: String,
    required: [true, 'The ip field is required'],
  },

  deviceTitle: {
    type: String,
    required: [true, 'The deviceTitle field is required'],
  },

  userId: {
    type: String,
    required: [true, 'The userId field is required'],
  },

  url: {
    type: Boolean,
    required: [true, 'The url field is required'],
  },

  issuedAtt: {
    type: String,
    required: [true, 'The lastActiveDate field is required'],
    trim: true,
  },

  attempt: {
    type: Number,
    default: 1,
  },
})

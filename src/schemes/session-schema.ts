import mongoose from 'mongoose'
const { Schema } = mongoose
import { SessionType } from '../types'

export const sessionSchema = new Schema<SessionType>({
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

  url: {
    type: String,
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

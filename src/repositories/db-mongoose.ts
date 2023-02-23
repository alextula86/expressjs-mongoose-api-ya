import mongoose from 'mongoose'
import * as dotenv from 'dotenv'

import {
  blogSchema,
  postSchema,
  commentSchema,
  deviceSchema,
  sessionSchema,
} from '../schemes'

dotenv.config()

const mongoUri = process.env.MONGO_ATLAS_URI || 'mongodb://localhost:27017/bloggers'

if (!mongoUri) {
  throw new Error('Url doesnt found')
}

mongoose.set('strictQuery', true)

export const BlogModel = mongoose.model('blogs', blogSchema)
export const PostModel = mongoose.model('posts', postSchema)
export const CommentModel = mongoose.model('comments', commentSchema)
export const DeviceModel = mongoose.model('devices', deviceSchema)
export const SessionModel = mongoose.model('sessions', sessionSchema)

export async function runDb() {
  try {
    await mongoose.connect(mongoUri)
    console.log('Connected successfully to server by mongoose')
  } catch {
    console.log('Can`t connect to db')
    await mongoose.disconnect()
  }
}

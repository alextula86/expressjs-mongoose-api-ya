import { MongoClient } from 'mongodb'
import mongoose from 'mongoose'
import * as dotenv from 'dotenv'
import {
  BlogType,
  PostType,
  UserType,
  CommentType, 
  DeviceType,
  SessionType,
} from '../types'

import {
  userSchema,
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

const client = new MongoClient(mongoUri)
const db = client.db()

export const userCollection = db.collection<UserType>('users')
export const blogCollection = db.collection<BlogType>('blogs')
export const postCollection = db.collection<PostType>('posts')
export const commentCollection = db.collection<CommentType>('comments')
export const deviceCollection = db.collection<DeviceType>('devices')
export const sessionCollection = db.collection<SessionType>('sessions')

export const UserModel = mongoose.model('users', userSchema)
export const BlogModel = mongoose.model('blogs', blogSchema)
export const PostModel = mongoose.model('posts', postSchema)
export const CommentModel = mongoose.model('comments', commentSchema)
export const DeviceModel = mongoose.model('devices', deviceSchema)
export const SessionModel = mongoose.model('sessions', sessionSchema)

export async function runDb() {
  try {
    await client.connect()
    await client.db().command({ ping: 1 })
    console.log('Connected successfully to server by MongoClient')

    await mongoose.connect('mongodb://localhost:27017/bloggers')
    console.log('Connected successfully to server by mongoose')
  } catch {
    console.log('Can`t connect to db')
    await client.close()
    await mongoose.disconnect()
  }
}

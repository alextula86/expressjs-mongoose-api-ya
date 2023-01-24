import express from "express";
import bodyParser from 'body-parser'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import { runDb } from './repositories/db'
import { blogsRouter } from './routers/blogs-router'
import { postsRouter } from './routers/posts-router'
import { commentsRouter } from './routers/comments-router'
import { usersRouter } from './routers/users-router'
import { authRouter } from './routers/auth-router'
import { securityRouter } from './routers/security-router'
import { testingRouter } from './routers/testing-router'

export const app = express()
const port = process.env.PORT || 5000

app.set('trust proxy', true)

const jsonBodyMiddleware = bodyParser.json()
const jsonCookieMiddleware = cookieParser()
app.use(cors())
app.use(jsonBodyMiddleware)
app.use(jsonCookieMiddleware)

app.use('/api/blogs', blogsRouter)
app.use('/api/posts', postsRouter)
app.use('/api/comments', commentsRouter)
app.use('/api/users', usersRouter)
app.use('/api/auth', authRouter)
app.use('/api/security', securityRouter)
app.use('/api/testing', testingRouter)

const startApp = async () => {
  await runDb()
  app.listen(port, () => {
    console.log(`App listening on port ${port}`)
  })
}

startApp()

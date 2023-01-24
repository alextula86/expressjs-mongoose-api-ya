import { NextFunction, Request, Response } from "express";
import * as dotenv from 'dotenv'
dotenv.config()
import { HTTPStatuses } from '../types'

export const authBasicMiddleware = (req: Request, res: Response, next: NextFunction) => {
  if (!req.headers.authorization) {
    return res.status(HTTPStatuses.UNAUTHORIZED401).send()
  }  

  const [authType, authInBase64] = req.headers.authorization.split(' ')
  const authToString = Buffer.from(authInBase64, 'base64').toString('utf8')

  const [login, password] = authToString.split(':')

  if (authType !== 'Basic' || login !== process.env.LOGIN || password !== process.env.PASSWORD) {
    return res.status(HTTPStatuses.UNAUTHORIZED401).send()
  }

  next()
}

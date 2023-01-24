import { NextFunction, Request, Response } from "express";
import { validationResult } from 'express-validator';
import { uniqBy } from "lodash";
import { HTTPStatuses } from "../types";

export const inputValidationMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req)

  if (!errors.isEmpty()) {
    return res.status(HTTPStatuses.BADREQUEST400).send({
      errorsMessages: uniqBy(errors.array().map(item => ({
        message: item.msg,
        field: item.param
      })), 'field')
    })
  }

  next()
}

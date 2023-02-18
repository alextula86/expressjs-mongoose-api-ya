import { Router } from "express";
import { HTTPStatuses } from '../types'

import { testingRepository } from '../repositories'

export const testingRouter = Router()

testingRouter.delete('/all-data', async (_, res) => {
  const isAllDeleted = await testingRepository.deleteAll()

  if (!isAllDeleted) {
    return res.status(HTTPStatuses.BADREQUEST400).send()
  }
  
  res.status(HTTPStatuses.NOCONTENT204).send()
})

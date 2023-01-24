import { Router, Response, Request } from 'express'
import { isEmpty } from 'lodash'
import { deviceService } from '../services'
import { authRefreshTokenMiddleware } from '../middlewares'
import {
  RequestWithParams,
  URIParamsDeviceModel,
  HTTPStatuses,
} from '../types'

export const securityRouter = Router()

securityRouter
  // Возвращает все устройства с активными сеансами для текущего пользователя
  .get('/devices', authRefreshTokenMiddleware, async (req: Request & any, res: Response) => {
    const allDevices = await deviceService.findAllDevices(req.user.userId)  

    res.status(HTTPStatuses.SUCCESS200).send(allDevices)
  })
  // Завершите все другие (исключая текущие) сеансы устройства
  .delete('/devices', authRefreshTokenMiddleware, async (req: Request & any, res: Response<boolean | string>) => {
    const isDeleteAllDevices = await deviceService.deleteAllDevices(req.user.userId, req.device.id)

    if (!isDeleteAllDevices) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  })
  // Terminate specified device session
  .delete('/devices/:deviceId', authRefreshTokenMiddleware, async (req: RequestWithParams<URIParamsDeviceModel> & any, res: Response<boolean | string>) => {
    if (!req.params.deviceId) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    const deviceById = await deviceService.findDeviceById(req.params.deviceId)
    
    if (!isEmpty(deviceById) && deviceById.userId !== req.user!.userId) {
      return res.status(HTTPStatuses.FORBIDDEN403).send()
    }
    
    const isDeletedDeviceById = await deviceService.deleteDeviceById(req.params.deviceId)

    if (!isDeletedDeviceById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  })

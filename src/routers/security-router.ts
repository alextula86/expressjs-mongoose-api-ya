import { Router } from 'express'
import { deviceController } from '../composition-roots'
import { authRefreshTokenMiddleware } from '../middlewares'

export const securityRouter = Router()

securityRouter
  // Возвращает все устройства с активными сеансами для текущего пользователя
  .get('/devices', authRefreshTokenMiddleware, deviceController.getDevices.bind(deviceController))
  // Завершите все другие (исключая текущие) сеансы устройства
  .delete('/devices', authRefreshTokenMiddleware, deviceController.deleteDevices.bind(deviceController))
  // Terminate specified device session
  .delete('/devices/:deviceId', authRefreshTokenMiddleware, deviceController.deleteDevice.bind(deviceController))

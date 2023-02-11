import { Router } from 'express'
import { authRefreshTokenMiddleware } from '../middlewares'
import { DeviceController } from '../controllers'
import { container } from '../composition-roots'

export const securityRouter = Router()

const deviceController = container.resolve(DeviceController)

securityRouter
  // Возвращает все устройства с активными сеансами для текущего пользователя
  .get('/devices', authRefreshTokenMiddleware, deviceController.getDevices.bind(deviceController))
  // Завершите все другие (исключая текущие) сеансы устройства
  .delete('/devices', authRefreshTokenMiddleware, deviceController.deleteDevices.bind(deviceController))
  // Terminate specified device session
  .delete('/devices/:deviceId', authRefreshTokenMiddleware, deviceController.deleteDevice.bind(deviceController))

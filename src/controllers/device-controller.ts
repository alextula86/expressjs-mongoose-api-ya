import { Response, Request } from 'express'
import { isEmpty } from 'lodash'
import { DeviceService } from '../services'

import {
  RequestWithParams,
  URIParamsDeviceModel,
  HTTPStatuses,
} from '../types'

export class DeviceController {
  constructor(protected deviceService: DeviceService) {}

  async getDevices(req: Request & any, res: Response) {
    const allDevices = await this.deviceService.findAllDevices(req.user.userId)  

    res.status(HTTPStatuses.SUCCESS200).send(allDevices)
  }
  async deleteDevices(req: Request & any, res: Response<boolean | string>) {
    const isDeleteAllDevices = await this.deviceService.deleteAllDevices(req.user.userId, req.device.id)

    if (!isDeleteAllDevices) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
  async deleteDevice(req: RequestWithParams<URIParamsDeviceModel> & any, res: Response<boolean | string>) {
    if (!req.params.deviceId) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    const deviceById = await this.deviceService.findDeviceById(req.params.deviceId)
    
    if (!isEmpty(deviceById) && deviceById.userId !== req.user!.userId) {
      return res.status(HTTPStatuses.FORBIDDEN403).send()
    }
    
    const isDeletedDeviceById = await this.deviceService.deleteDeviceById(req.params.deviceId)

    if (!isDeletedDeviceById) {
      return res.status(HTTPStatuses.NOTFOUND404).send()
    }
    
    res.status(HTTPStatuses.NOCONTENT204).send()
  }
}

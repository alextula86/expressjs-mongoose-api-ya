import { DeviceViewModel } from '../../models'
import { CreaetDeviceService } from '../../service'
import { DeviceType } from '../../schema'

export type ServiceDeviceType = {
  findAllDevices: (userId: string) => Promise<DeviceViewModel[]>
  findDeviceById: (id: string) => Promise<DeviceType | null>
  createdDevice: ({ id, ip, title, lastActiveDate, userId }: CreaetDeviceService) => Promise<DeviceType>
  deleteAllDevices: (userId: string, currentDeviceId: string) => Promise<boolean>
  deleteDeviceById: (id: string) => Promise<boolean>
  updateLastActiveDateDevice: (deviceId: string, lastActiveDate: string) => Promise<boolean>
}

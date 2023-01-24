import { DeviceViewModel } from '../models'
import { DeviceType } from '../schema'

export type RepositoryDeviceType = {
  findAllDevices: (userId: string) => Promise<DeviceViewModel[]>
  findDeviceById: (id: string) => Promise<DeviceType | null>
  createdDevice: (createdDevice: DeviceType) => Promise<DeviceType>
  deleteAllDevices: (userId: string, currentDeviceId: string) => Promise<boolean>
  deleteDeviceById: (id: string) => Promise<boolean>
  updateLastActiveDateDevice: (deviceId: string, lastActiveDate: string) => Promise<boolean>
  _getDeviceViewModel: (dbDevice: DeviceType) => DeviceViewModel
  _getDevicesViewModel: (dbDevices: DeviceType[]) => DeviceViewModel[]
}

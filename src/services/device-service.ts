import { DeviceRepository } from '../repositories/device/device-db-repository'
import { DeviceType, DeviceViewModel, CreaetDeviceService } from '../types'

export class DeviceService {
  constructor(protected deviceRepository: DeviceRepository) {}

  async findAllDevices(userId: string): Promise<DeviceViewModel[]> {
    const foundAllDevices = await this.deviceRepository.findAllDevices(userId)

    return foundAllDevices
  }
  async findDeviceById(id: string): Promise<DeviceType | null> {
    const foundDeviceById = await this.deviceRepository.findDeviceById(id)

    return foundDeviceById
  }
  async createdDevice({
    id,
    ip,
    title,
    lastActiveDate,
    userId,
  }: CreaetDeviceService): Promise<DeviceType> {
    const active = true

    const newDevice = new DeviceType(id, ip, title, lastActiveDate, userId, active)
    const createdDevice = await this.deviceRepository.createdDevice(newDevice)

    return createdDevice
  }
  async deleteAllDevices(userId: string, currentDeviceId: string): Promise<boolean> {
    const isDeleteAllDevices = await this.deviceRepository.deleteAllDevices(userId, currentDeviceId)

    return isDeleteAllDevices
  }
  async deleteDeviceById(id: string): Promise<boolean> {
    const isDeletedDeviceById = await this.deviceRepository.deleteDeviceById(id)

    return isDeletedDeviceById
  }
  async updateLastActiveDateDevice(deviceId: string, lastActiveDate: string): Promise<boolean> {
    const isUpdatedDevice = await this.deviceRepository.updateLastActiveDateDevice(deviceId, lastActiveDate)

    return isUpdatedDevice
  }
}

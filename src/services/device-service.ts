import { deviceRepository } from '../repositories/device/device-db-repository'
import { DeviceType, ServiceDeviceType } from '../types'
import { getNextStrId } from '../utils'

export const deviceService: ServiceDeviceType = {
  async findAllDevices(userId) {
    const foundAllDevices = await deviceRepository.findAllDevices(userId)

    return foundAllDevices
  },
  async findDeviceById(id) {
    const foundDeviceById = await deviceRepository.findDeviceById(id)

    return foundDeviceById
  },  
  async createdDevice({ id, ip, title, lastActiveDate, userId }) {
    const newDevice: DeviceType = {
      id,
      ip,
      title,
      userId,
      lastActiveDate,
      active: true,
    }

    const createdDevice = await deviceRepository.createdDevice(newDevice)

    return createdDevice
  },
  async deleteAllDevices(userId, currentDeviceId) {
    const isDeleteAllDevices = await deviceRepository.deleteAllDevices(userId, currentDeviceId)

    return isDeleteAllDevices
  },
  async deleteDeviceById(id) {
    const isDeletedDeviceById = await deviceRepository.deleteDeviceById(id)

    return isDeletedDeviceById
  },
  async updateLastActiveDateDevice(deviceId, lastActiveDate) {
    const isUpdatedDevice = await deviceRepository.updateLastActiveDateDevice(deviceId, lastActiveDate)

    return isUpdatedDevice
  },
}

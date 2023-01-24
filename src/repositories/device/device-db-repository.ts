import { deviceCollection } from '../db'
import { RepositoryDeviceType, DeviceType } from '../../types'

export const deviceRepository: RepositoryDeviceType = {
  async findAllDevices(userId) {
    const devices: DeviceType[] = await deviceCollection.find({ userId }).toArray()

    return this._getDevicesViewModel(devices)
  },
  async findDeviceById(id) {
    const foundDevice: DeviceType | null = await deviceCollection.findOne({ id })

    if (!foundDevice) {
      return null
    }

    return foundDevice
  },  
  async createdDevice(createdDevice) {
    await deviceCollection.insertOne(createdDevice)

    return createdDevice
  },  
  async deleteAllDevices(userId, currentDeviceId) {
    const { deletedCount } = await deviceCollection.deleteMany({ $and: [{ userId }, { id: { $ne: currentDeviceId } }] })

    return deletedCount > 0
  },
  async deleteDeviceById(id) {
    const { deletedCount } = await deviceCollection.deleteOne({ id })

    return deletedCount === 1
  },
  async updateLastActiveDateDevice(deviceId, lastActiveDate) {
    const result = await deviceCollection.updateOne({ id: deviceId }, {
      $set: { lastActiveDate }
    })

    return result.modifiedCount === 1
  },
  _getDeviceViewModel(dbDevice) {
    return {
      ip: dbDevice.ip,
      title: dbDevice.title,
      lastActiveDate: dbDevice.lastActiveDate,
      deviceId: dbDevice.id,
    }
  },  
  _getDevicesViewModel(dbDevices) {
    return dbDevices.map(item => ({
      ip: item.ip,
      title: item.title,
      lastActiveDate: item.lastActiveDate,
      deviceId: item.id,
    }))
  },
}

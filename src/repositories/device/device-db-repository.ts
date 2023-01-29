import { deviceCollection } from '../../repositories/db'
import { DeviceType, DeviceViewModel } from '../../types'

export class DeviceRepository {
  async findAllDevices(userId: string): Promise<DeviceViewModel[]> {
    const devices: DeviceType[] = await deviceCollection.find({ userId }).toArray()

    return this._getDevicesViewModel(devices)
  }
  async findDeviceById(id: string): Promise<DeviceType | null> {
    const foundDevice: DeviceType | null = await deviceCollection.findOne({ id })

    if (!foundDevice) {
      return null
    }

    return foundDevice
  }
  async createdDevice(createdDevice: DeviceType): Promise<DeviceType> {
    await deviceCollection.insertOne(createdDevice)

    return createdDevice
  }
  async deleteAllDevices(userId: string, currentDeviceId: string): Promise<boolean> {
    const { deletedCount } = await deviceCollection.deleteMany({ $and: [{ userId }, { id: { $ne: currentDeviceId } }] })

    return deletedCount > 0
  }
  async deleteDeviceById(id: string): Promise<boolean> {
    const { deletedCount } = await deviceCollection.deleteOne({ id })

    return deletedCount === 1
  }
  async updateLastActiveDateDevice(deviceId: string, lastActiveDate: string): Promise<boolean> {
    const result = await deviceCollection.updateOne({ id: deviceId }, {
      $set: { lastActiveDate }
    })

    return result.modifiedCount === 1
  }
  _getDeviceViewModel(dbDevice: DeviceType): DeviceViewModel {
    return {
      ip: dbDevice.ip,
      title: dbDevice.title,
      lastActiveDate: dbDevice.lastActiveDate,
      deviceId: dbDevice.id,
    }
  }
  _getDevicesViewModel(dbDevices: DeviceType[]): DeviceViewModel[] {
    return dbDevices.map(item => ({
      ip: item.ip,
      title: item.title,
      lastActiveDate: item.lastActiveDate,
      deviceId: item.id,
    }))
  }
}

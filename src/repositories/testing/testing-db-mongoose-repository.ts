import {
  BlogModel,
  PostModel,
  CommentModel,
  UserModel,
  DeviceModel,
  SessionModel,
} from '../db-mongoose'
import { RepositoryTestingType } from '../../types'

export const testingRepository: RepositoryTestingType = {
  deleteAll: async () => {
    await BlogModel.deleteMany({})
    await PostModel.deleteMany({})
    await CommentModel.deleteMany({})
    await UserModel.deleteMany({})
    await DeviceModel.deleteMany({})
    await SessionModel.deleteMany({})

    return true
  },
}

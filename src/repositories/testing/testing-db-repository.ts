import {
  blogCollection,
  postCollection,
  commentCollection,
  userCollection,
  deviceCollection,
  sessionCollection,
} from '../../repositories/db'
import { RepositoryTestingType } from '../../types'

export const testingRepository: RepositoryTestingType = {
  deleteAll: async () => {
    await blogCollection.deleteMany({})
    await postCollection.deleteMany({})
    await commentCollection.deleteMany({})
    await userCollection.deleteMany({})
    await deviceCollection.deleteMany({})
    await sessionCollection.deleteMany({})

    return true
  },
}

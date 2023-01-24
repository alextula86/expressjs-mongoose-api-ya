import { UserViewModel, UserAuthViewModel, QueryUserModel } from '../../models'
import { UserType } from '../../schema'
import { ResponseViewModelDetail } from '../../response'
import { CreaetUserService } from '../users'

export type ServiceUserType = {
  findAllUsers: ({ searchLoginTerm, searchEmailTerm, pageNumber, pageSize, sortBy, sortDirection}: QueryUserModel) => Promise<ResponseViewModelDetail<UserViewModel>>
  findUserById: (id: string) => Promise<UserAuthViewModel | null>
  createdUser: ({ login, password, email }: CreaetUserService) => Promise<UserViewModel>
  deleteUserById: (id: string) => Promise<boolean>
  checkCredentials: (loginOrEmail: string, password: string) => Promise<UserType | null>
  _generateHash: (password: string, salt: string) => Promise<string>
}

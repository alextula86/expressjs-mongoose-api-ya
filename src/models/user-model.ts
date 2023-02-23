import mongoose, { HydratedDocument } from 'mongoose'
import { UserType, UserMethodsType } from '../types'
import { userSchema } from '../schemes'

export type UserHydratedDocumentType = HydratedDocument<UserType, UserMethodsType>

export type UserModelType = mongoose.Model<UserType, {}, UserMethodsType>

export type UserModelStaticType = mongoose.Model<UserType> & {
    make: (login: string, passwordHash: string, email: string) => UserHydratedDocumentType
}

export type UserModelFullType = UserModelType & UserModelStaticType

export const UserModel = mongoose.model<UserType, UserModelFullType>('users', userSchema)

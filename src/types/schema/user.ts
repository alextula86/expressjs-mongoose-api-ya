import { getNextStrId } from '../../utils'

type UserDataType = {
  login: string
  email: string
  passwordHash: string
  createdAt: string
}

type EmailConfirmationType = {
  confirmationCode: string
  expirationDate: Date
  isConfirmed: boolean
}

type PasswordRecoveryType = {
  recoveryCode: string
  expirationDate: Date
  isRecovered: boolean
}

export class UserType {
  id: string
  constructor(
    public accountData: UserDataType,
    public emailConfirmation: EmailConfirmationType,
    public passwordRecovery: PasswordRecoveryType,
    public refreshToken: string,
  ) {
    this.id = getNextStrId()
  }
}

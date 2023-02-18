import { getNextStrId } from '../../utils'

export type AccountDataType = {
  login: string
  email: string
  passwordHash: string
  createdAt: string
}

export type EmailConfirmationType = {
  confirmationCode: string
  expirationDate: Date
  isConfirmed: boolean
}

export type PasswordRecoveryType = {
  recoveryCode: string
  expirationDate: Date
  isRecovered: boolean
}

export class UserType {
  id: string
  constructor(
    public accountData: AccountDataType,
    public emailConfirmation: EmailConfirmationType,
    public passwordRecovery: PasswordRecoveryType,
    public refreshToken: string,
  ) {
    this.id = getNextStrId()
  }
}

export type UserOldType = {
  /** 
  * id of existing user
  * login of existing user
  * email of existing user
  * passwordHash of existing user
  * createdAt of existing user    
  */
  id: string
  login: string
  email: string
  passwordHash: string
  // passwordSalt: string
  createdAt: string
}

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

export type UserType = {
  id: string
  accountData: UserDataType
  emailConfirmation: EmailConfirmationType
  passwordRecovery: PasswordRecoveryType
  refreshToken: string
}

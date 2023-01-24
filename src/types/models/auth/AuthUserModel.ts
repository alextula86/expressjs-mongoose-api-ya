export type AuthUserModel = {
  /** 
    * loginOrEmail of auth user
    * password of auth user
  */
  loginOrEmail: string,
  password: string,
}

export type AuthAccessTokenModel = {
  accessToken: string
}

export type RegistrationConfirmationModel = {
  code: string,
}

export type RegistrationEmailResendingModel = {
  email: string,
}

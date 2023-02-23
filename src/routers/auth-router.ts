import { Router } from 'express'
import { AuthController } from '../controllers'
import { container } from '../composition-roots'
import {
  authBearerMiddleware,
  authRefreshTokenMiddleware,
  loginOrEmailUserValidation,
  passwordUserValidation,
  newPasswordUserValidation,
  loginUserValidation,
  emailUserValidation,
  codeUserValidation,
  recoveryCodeUserValidation,
  inputValidationMiddleware,
  existsUserByLoginOrEmail,
  existsUserByEmail,
  existsUserByConfirmationCode,
  existsUserByRecoveryCode,
  сountRequestsMiddleware,
} from '../middlewares'

export const authRouter = Router()

const middlewaresLogin = [
  сountRequestsMiddleware,
  loginOrEmailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
]

const middlewaresRegistration = [
  сountRequestsMiddleware,
  loginUserValidation,
  emailUserValidation,
  passwordUserValidation,
  inputValidationMiddleware,
  existsUserByLoginOrEmail,
]

const middlewaresRefreshToken = [
  сountRequestsMiddleware,
  authRefreshTokenMiddleware,
]

const middlewaresRegistrationConfirmation = [
  сountRequestsMiddleware,
  codeUserValidation,
  // existsUserByConfirmationCode,
]

const middlewaresRegistrationEmailResending = [
  сountRequestsMiddleware,
  emailUserValidation,
  existsUserByEmail,
]

const middlewaresRecoveryCode = [
  сountRequestsMiddleware,
  emailUserValidation,
  inputValidationMiddleware,
]

const middlewaresConfirmPasswordModel = [
  сountRequestsMiddleware,
  newPasswordUserValidation,
  recoveryCodeUserValidation,
  inputValidationMiddleware,
  existsUserByRecoveryCode,
]

const authController = container.resolve(AuthController)

authRouter
  // Получение данных о пользователе
  .get('/me', authBearerMiddleware, authController.me.bind(authController))
  // Аутентификация пользователя
  .post('/login', middlewaresLogin, authController.login.bind(authController))
  .post('/refresh-token', middlewaresRefreshToken, authController.refreshToken.bind(authController))
  .post('/logout', authRefreshTokenMiddleware, authController.logout.bind(authController))  
  // Регистрация пользователя
  .post('/registration', middlewaresRegistration, authController.registration.bind(authController))
  // Подтверждение email по коду
  .post('/registration-confirmation', middlewaresRegistrationConfirmation, authController.registrationConfirmation.bind(authController))
  // Повторная отправка кода подтверждения email
  .post('/registration-email-resending', middlewaresRegistrationEmailResending, authController.registrationEmailResending.bind(authController))
  // Восстановление пароля с помощью подтверждения по электронной почте. 
  .post('/password-recovery', middlewaresRecoveryCode, authController.passwordRecovery.bind(authController))
  // Подтверждение восстановление пароля
  .post('/new-password', middlewaresConfirmPasswordModel, authController.newPassword.bind(authController))

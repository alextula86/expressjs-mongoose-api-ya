import { Schema } from 'mongoose'
import { add } from 'date-fns'
import { trim } from 'lodash'
import { generateUUID } from '../utils'

import {
  AccountDataType,
  EmailConfirmationType,
  PasswordRecoveryType,
  UserType,
  UserMethodsType,
} from '../types'

import { UserModel, UserModelFullType } from '../models'

const accountDataSchema = new Schema<AccountDataType>({
  login: {
    type: String,
    required: [true, 'The login field is required'],
    trim: true,
    minLength: [3, 'The login field must be at least 3, got {VALUE}'],
    maxLength: [10, 'The login field must be no more than 10, got {VALUE}'],
    match: /^[a-zA-Z0-9_-]*$/,
  },

  email: {
    type: String,
    required: [true, 'The email field is required'],
    trim: true,
    match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
  },

  passwordHash: {
    type: String,
    required: [true, 'The passwordHash field is required'],
  },

  createdAt: {
    type: String,
    required: [true, 'The createdAt field is required'],
  },
})

const emailConfirmationSchema = new Schema<EmailConfirmationType>({
  confirmationCode: {
    type: String,
    required: [true, 'The confirmationCode field is required'],
    trim: true,
  },

  expirationDate: {
    type: Date,
    required: [true, 'The expirationDate field is required'],
  },

  isConfirmed: {
    type: Boolean,
    default: true,
  },
})

const passwordRecoverySchema = new Schema<PasswordRecoveryType>({
  recoveryCode: {
    type: String,
    trim: true,
    default: '',
  },

  expirationDate: {
    type: Date,
    required: [true, 'The expirationDate field is required'],
  },

  isRecovered: {
    type: Boolean,
    default: true,
  },
})

export const userSchema = new Schema<UserType, UserModelFullType, UserMethodsType>({
  id: {
    type: String,
    required: [true, 'The id field is required'],
  },

  accountData: {
    type: accountDataSchema,
    required: true,
  },

  emailConfirmation: {
    type: emailConfirmationSchema,
    required: true,
  },

  passwordRecovery: {
    type: passwordRecoverySchema,
    required: true,
  },

  refreshToken: {
    type: String,
    default: '',
  },
})

userSchema.method('canBeConfirmed', function canBeConfirmed() {
  const that = this as UserType
  return that.emailConfirmation.expirationDate > new Date() && !that.emailConfirmation.isConfirmed
})

userSchema.method('confirm', function confirm() {
  const that = this as UserType & UserMethodsType
  if (!that.canBeConfirmed()) throw new Error(`Account can't be confirm!`)
  if (that.emailConfirmation.isConfirmed) throw new Error(`Already confirmed account can't be confirmed again!`)
  that.emailConfirmation.isConfirmed = true
})

userSchema.static('make', function make(login: string, passwordHash: string, email: string) {
  // Генерируем код для подтверждения email
  const confirmationCode = generateUUID()

  const accountData = {
    login: trim(String(login)),
    email: trim(String(email)),
    passwordHash,
    createdAt: new Date().toISOString(),
  }

  const emailConfirmation = {
    confirmationCode,
    expirationDate: add(new Date(), { hours: 1, minutes: 30 }),
    isConfirmed: false,
  }

  const passwordRecovery = {
    recoveryCode: '',
    expirationDate: new Date(),
    isRecovered: true,
  }

  const refreshToken = ''
  
  const user = new UserType(accountData, emailConfirmation, passwordRecovery, refreshToken)
  
  return new UserModel(user)
})
  
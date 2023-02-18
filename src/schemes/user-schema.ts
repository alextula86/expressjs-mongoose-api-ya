import mongoose from 'mongoose'
import { AccountDataType, EmailConfirmationType, PasswordRecoveryType, UserType } from '../types'
const { Schema } = mongoose

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

export const userSchema = new Schema<UserType>({
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
  
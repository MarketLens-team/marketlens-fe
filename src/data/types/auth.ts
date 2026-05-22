export type { ApiEnvelope, ApiErrorBody } from './api'

export interface LoginRequest {
  email: string
  password: string
}

export interface SignupRequest {
  email: string
  password: string
  nickname: string
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
}

export interface ReissueRequest {
  refreshToken: string
}

export type EmailVerificationPurpose = 'SIGNUP' | 'PASSWORD_RESET'

export interface AvailabilityResponse {
  available: boolean
}

export interface EmailVerificationSendRequest {
  email: string
  purpose: EmailVerificationPurpose
}

export interface EmailVerificationConfirmRequest {
  email: string
  purpose: EmailVerificationPurpose
  code: string
}

export interface PendingSignupRequest {
  email: string
  password: string
  nickname: string
}

export interface PendingSignupResponse {
  pendingSignupToken: string
}

export interface CompleteSignupRequest {
  pendingSignupToken: string
}

export interface PasswordResetRequest {
  email: string
  newPassword: string
}

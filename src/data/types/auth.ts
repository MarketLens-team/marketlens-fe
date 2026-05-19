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

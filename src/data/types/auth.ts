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

export interface ApiErrorBody {
  code?: string
  message?: string
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: ApiErrorBody
}

/** 백엔드 `ApiResponse` / OpenAPI `Error` */
export interface ApiErrorBody {
  code?: string
  message?: string
}

export interface ApiEnvelope<T> {
  success: boolean
  data: T
  error?: ApiErrorBody
}

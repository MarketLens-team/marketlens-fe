import axios from 'axios'
import { ERROR_CODE_MESSAGES } from '../constants/errorCodes'
import type { ApiEnvelope, ApiErrorBody } from '../types/api'

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return Boolean(value && typeof value === 'object' && 'success' in value)
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return Boolean(value && typeof value === 'object' && ('code' in value || 'message' in value))
}

/** `error.message` 우선, 없으면 `error.code` → ERROR_CODE_MESSAGES */
export function messageFromApiError(error: ApiErrorBody | undefined, fallback: string): string {
  const trimmed = error?.message?.trim()
  if (trimmed) return trimmed
  if (error?.code && ERROR_CODE_MESSAGES[error.code]) {
    return ERROR_CODE_MESSAGES[error.code]
  }
  return fallback
}

function extractApiError(error: unknown): ApiErrorBody | undefined {
  if (axios.isAxiosError(error)) {
    const body = error.response?.data
    if (isApiEnvelope(body) && body.error) return body.error
    if (isApiErrorBody(body)) return body
  }
  return undefined
}

/** HTTP 4xx·5xx, success:false, assertSuccess throw 공통 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const apiError = extractApiError(error)
    if (apiError) {
      const resolved = messageFromApiError(apiError, '')
      if (resolved) return resolved
    }

    if (!error.response) {
      return '서버에 연결할 수 없습니다. 개발 서버를 재시작했는지 확인해 주세요.'
    }
  }

  if (error instanceof Error && error.message && error.message !== 'Network Error') {
    return error.message
  }
  return fallback
}

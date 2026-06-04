import axios from 'axios'
import { ERROR_CODE_MESSAGES } from '../constants/errorCodes'
import type { ApiEnvelope, ApiErrorBody } from '../types/api'

function isApiEnvelope(value: unknown): value is ApiEnvelope<unknown> {
  return Boolean(value && typeof value === 'object' && 'success' in value)
}

function isApiErrorBody(value: unknown): value is ApiErrorBody {
  return Boolean(value && typeof value === 'object' && ('code' in value || 'message' in value))
}

export type ApiValidationField = 'email' | 'nickname' | 'password' | 'code'

const VALIDATION_FIELD_MESSAGES: Record<ApiValidationField, string> = {
  email: '올바른 이메일 형식을 입력해주세요.',
  nickname: '닉네임은 2~20자로 입력해주세요.',
  password: '비밀번호는 8자 이상이어야 합니다.',
  code: '인증 코드 6자리를 입력해주세요.',
}

function inferFieldFromPath(path: string): ApiValidationField | undefined {
  const lower = path.toLowerCase()
  if (lower.includes('email')) return 'email'
  if (lower.includes('nickname')) return 'nickname'
  if (lower.includes('password')) return 'password'
  if (lower.includes('code')) return 'code'
  return undefined
}

/** 필드 검증 문구가 아닌, 그대로 보여줘야 하는 인증·중복 등 메시지 */
function isPreservedApiMessage(message: string): boolean {
  return (
    message.includes('이메일 또는 비밀번호') ||
    message.includes('이미 사용 중인') ||
    message.includes('인증이 완료되지 않았습니다') ||
    message.includes('인증 코드가') ||
    message.includes('회원가입 세션') ||
    message.includes('서버에 연결') ||
    message.includes('로그인에 실패') ||
    message.includes('회원가입')
  )
}

function inferFieldFromDetail(detail: string): ApiValidationField | undefined {
  if (isPreservedApiMessage(detail)) return undefined
  if (detail.includes('이메일')) return 'email'
  if (detail.includes('닉네임')) return 'nickname'
  if (detail.includes('비밀번호') || detail.includes('password')) return 'password'
  if (detail.includes('인증 코드') || detail.includes('코드')) return 'code'
  return undefined
}

/** `checkEmail.email: …` 같은 백엔드 검증 메시지를 사용자용 문구로 변환 */
export function normalizeValidationMessage(message: string): string {
  if (isPreservedApiMessage(message)) return message

  const colonIdx = message.indexOf(':')
  if (colonIdx === -1) {
    const field = inferFieldFromDetail(message)
    return field ? VALIDATION_FIELD_MESSAGES[field] : message
  }

  const pathPart = message.slice(0, colonIdx).trim()
  const detail = message.slice(colonIdx + 1).trim()
  const fieldKey = pathPart.split('.').pop()?.toLowerCase() ?? ''
  const field =
    (fieldKey in VALIDATION_FIELD_MESSAGES ? (fieldKey as ApiValidationField) : undefined) ??
    inferFieldFromPath(pathPart) ??
    inferFieldFromDetail(detail)

  if (field) return VALIDATION_FIELD_MESSAGES[field]
  if (detail) return detail
  return message
}

export function parseApiFieldError(message: string): {
  field: ApiValidationField | null
  message: string
} {
  const normalized = normalizeValidationMessage(message)
  const colonIdx = message.indexOf(':')
  if (colonIdx === -1) {
    const field = inferFieldFromDetail(message)
    return { field: field ?? null, message: normalized }
  }

  const pathPart = message.slice(0, colonIdx).trim()
  const fieldKey = pathPart.split('.').pop()?.toLowerCase() ?? ''
  const field =
    (fieldKey in VALIDATION_FIELD_MESSAGES ? (fieldKey as ApiValidationField) : undefined) ??
    inferFieldFromPath(pathPart) ??
    inferFieldFromDetail(message.slice(colonIdx + 1))

  return { field: field ?? null, message: normalized }
}

/** `error.message` 우선, 없으면 `error.code` → ERROR_CODE_MESSAGES */
export function messageFromApiError(error: ApiErrorBody | undefined, fallback: string): string {
  const trimmed = error?.message?.trim()
  if (trimmed) return normalizeValidationMessage(trimmed)
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
    return normalizeValidationMessage(error.message)
  }
  return fallback
}

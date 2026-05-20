import axios from 'axios'
import { ERROR_PAGE_PRESETS, type ErrorPagePreset } from '../errorPagePresets'

/** Axios 원본·`Error.cause`·영문 status 메시지에서 HTTP 상태 추출 */
export function getHttpStatusFromAppError(error: unknown): number | 'network' | null {
  if (axios.isAxiosError(error)) {
    if (!error.response) return 'network'
    return error.response.status
  }
  if (error instanceof Error && 'cause' in error && error.cause != null) {
    return getHttpStatusFromAppError(error.cause)
  }
  if (error instanceof Error) {
    const m = /status code (\d{3})/i.exec(error.message)
    if (m) return Number(m[1])
  }
  return null
}

/**
 * 401·403·404·5xx·네트워크 — `/dev/errors/*`와 동일한 풀스크린 프리셋.
 * 그 외(400 등)는 null → embedded 카드 유지.
 */
export function fullscreenPresetFromAppError(error: unknown): ErrorPagePreset | null {
  const status = getHttpStatusFromAppError(error)
  if (status === 'network') return ERROR_PAGE_PRESETS.network
  if (status === 401) return ERROR_PAGE_PRESETS['401']
  if (status === 403) return ERROR_PAGE_PRESETS['403']
  if (status === 404) return ERROR_PAGE_PRESETS['404']
  if (status != null && status >= 500) return ERROR_PAGE_PRESETS['500']
  return null
}

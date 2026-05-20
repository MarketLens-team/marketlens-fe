import { ERROR_CODE_MESSAGES } from './constants/errorCodes'

export type ErrorPageVariant = '404' | '401' | '403' | '500' | 'network' | 'unknown'

/** UI accent — fintech empty-state 톤 */
export type ErrorPageTone = 'neutral' | 'auth' | 'danger' | 'offline'

export type ErrorPagePrimaryCta = 'home' | 'login'

export interface ErrorPagePreset {
  variant: ErrorPageVariant
  tone: ErrorPageTone
  statusCode: number | null
  title: string
  message: string
  hint?: string
  errorCode?: string
  /** 메인 pill CTA — 401은 로그인 유도 */
  primaryCta?: ErrorPagePrimaryCta
  loginHref?: string
}

export const ERROR_PAGE_PRESETS: Record<ErrorPageVariant, ErrorPagePreset> = {
  '404': {
    variant: '404',
    tone: 'neutral',
    statusCode: 404,
    title: '페이지를 찾을 수 없습니다',
    message: ERROR_CODE_MESSAGES.C002,
    hint: '주소가 바뀌었거나 삭제된 페이지일 수 있어요.',
    errorCode: 'C002',
  },
  '401': {
    variant: '401',
    tone: 'auth',
    statusCode: 401,
    title: '로그인이 필요합니다',
    message: '이 페이지를 보려면 로그인이 필요해요.',
    hint: '로그인 페이지로 이동하시겠어요?',
    errorCode: 'C004',
    primaryCta: 'login',
    loginHref: '/login',
  },
  '403': {
    variant: '403',
    tone: 'auth',
    statusCode: 403,
    title: '접근할 수 없습니다',
    message: ERROR_CODE_MESSAGES.C005,
    hint: '권한이 있는 메뉴인지 확인해 주세요.',
    errorCode: 'C005',
  },
  '500': {
    variant: '500',
    tone: 'danger',
    statusCode: 500,
    title: '일시적인 오류가 발생했습니다',
    message: ERROR_CODE_MESSAGES.C003,
    hint: '잠시 후 다시 시도해 주세요. 실시간 데이터는 곧 복구됩니다.',
    errorCode: 'C003',
  },
  network: {
    variant: 'network',
    tone: 'offline',
    statusCode: null,
    title: '서버에 연결할 수 없습니다',
    message: '네트워크 연결을 확인한 뒤 다시 시도해 주세요.',
    hint: 'Wi-Fi 또는 데이터 연결 상태를 확인해 주세요.',
  },
  unknown: {
    variant: 'unknown',
    tone: 'neutral',
    statusCode: null,
    title: '알 수 없는 오류',
    message: '잠시 후 다시 시도해 주세요. 문제가 계속되면 관리자에게 문의해 주세요.',
    hint: '동일한 증상이 반복되면 고객센터로 문의해 주세요.',
  },
}

export const ERROR_PAGE_VARIANTS = Object.keys(ERROR_PAGE_PRESETS) as ErrorPageVariant[]

export function isErrorPageVariant(value: string): value is ErrorPageVariant {
  return value in ERROR_PAGE_PRESETS
}

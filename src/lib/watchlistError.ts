import axios from 'axios'
import { ERROR_CODE_MESSAGES } from '../data/constants/errorCodes'
import { MY_PAGE_WATCHLIST_MAX } from '../data/types/myPage'

export const WATCHLIST_LIMIT_MESSAGE =
  ERROR_CODE_MESSAGES.W002 ??
  `관심종목은 최대 ${MY_PAGE_WATCHLIST_MAX}개까지 추가할 수 있습니다.`

export type WatchlistToggleResult =
  | 'auth'
  | 'pending'
  | 'added'
  | 'removed'
  | 'error'
  | 'limit'

export type WatchlistActionSnackbarResult = 'added' | 'removed' | 'error' | 'limit'

export type WatchlistActionUndoResult =
  | WatchlistActionSnackbarResult
  | 'auth'
  | 'pending'
  | undefined

export type WatchlistActionHandler = (
  result: WatchlistActionSnackbarResult,
  onUndo: () => Promise<WatchlistActionUndoResult>,
) => void

function isWatchlistLimitApiBody(body: unknown): boolean {
  if (!body || typeof body !== 'object' || !('error' in body)) return false
  const apiError = (body as { error?: { code?: string; message?: string } }).error
  if (apiError?.code === 'W002') return true
  const message = apiError?.message?.trim() ?? ''
  return message.includes('최대 10개') || message.includes('최대 10')
}

export function isWatchlistLimitError(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    if (isWatchlistLimitApiBody(error.response?.data)) return true
  }
  if (error instanceof Error) {
    const message = error.message.trim()
    if (message === WATCHLIST_LIMIT_MESSAGE) return true
    if (message.includes('최대 10개') || message.includes('최대 10')) return true
  }
  return false
}

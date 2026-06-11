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

export function isWatchlistLimitError(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false
  const body = error.response?.data
  if (body && typeof body === 'object' && 'error' in body) {
    const apiError = (body as { error?: { code?: string } }).error
    if (apiError?.code === 'W002') return true
  }
  return false
}

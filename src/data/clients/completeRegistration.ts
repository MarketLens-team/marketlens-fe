import { AUTH_TOKEN_KEY } from '../../constants/storage'
import type { WatchlistItem } from '../../store/watchlistStore'
import { completeSignup } from './authClient'
import { updateAlertSettings } from './memberClient'
import type { AlertSettings } from '../types/member'
import type { TokenResponse } from '../types/auth'
import { syncWatchlistItems } from './watchlistClient'

export interface CompleteRegistrationInput {
  pendingSignupToken: string
  watchlist: WatchlistItem[]
  alertSettings: AlertSettings
}

export async function completeRegistration(input: CompleteRegistrationInput): Promise<TokenResponse> {
  const tokens = await completeSignup({ pendingSignupToken: input.pendingSignupToken })
  localStorage.setItem(AUTH_TOKEN_KEY, tokens.accessToken)
  try {
    if (input.watchlist.length > 0) {
      await syncWatchlistItems(input.watchlist)
    }
    await updateAlertSettings(input.alertSettings)
  } catch (error) {
    localStorage.removeItem(AUTH_TOKEN_KEY)
    throw error
  }
  return tokens
}

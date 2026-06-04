import type { WatchlistItem } from '../types/watchlist'
import { useAuthStore } from '../../store/authStore'
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
  useAuthStore.getState().setTokens(tokens, 'USER')
  try {
    if (input.watchlist.length > 0) {
      await syncWatchlistItems(input.watchlist)
    }
    await updateAlertSettings(input.alertSettings)
  } catch (error) {
    useAuthStore.getState().logout()
    throw error
  }
  return tokens
}

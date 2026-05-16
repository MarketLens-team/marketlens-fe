import type { WatchlistItem } from '../../store/watchlistStore'
import { loginWithCredentials, signupWithCredentials } from './authClient'
import { updateAlertSettings } from './memberClient'
import type { AlertSettings } from '../types/member'
import type { TokenResponse } from '../types/auth'
import { syncWatchlistItems } from './watchlistClient'

export interface CompleteRegistrationInput {
  email: string
  password: string
  nickname: string
  watchlist: WatchlistItem[]
  alertSettings: AlertSettings
}

export async function completeRegistration(input: CompleteRegistrationInput): Promise<TokenResponse> {
  await signupWithCredentials({
    email: input.email,
    password: input.password,
    nickname: input.nickname,
  })
  const tokens = await loginWithCredentials({
    email: input.email,
    password: input.password,
  })
  if (input.watchlist.length > 0) {
    await syncWatchlistItems(input.watchlist)
  }
  await updateAlertSettings(input.alertSettings)
  return tokens
}

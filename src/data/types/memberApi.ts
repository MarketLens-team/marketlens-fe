/** OpenAPI `MemberResponse` */
export interface MemberResponse {
  nickname: string
  email: string
  createdAt: string
  plan: string
}

/** OpenAPI `TelegramLinkTokenResponse` */
export interface TelegramLinkTokenResponse {
  token: string
}

/** OpenAPI `PasswordChangeRequest` */
export interface PasswordChangeRequest {
  currentPassword: string
  newPassword: string
}

/** OpenAPI `WatchlistResponse` */
export interface WatchlistResponse {
  stockCode: string
  stockName: string
  sectorName: string
  market: string
  imageUrl?: string
}

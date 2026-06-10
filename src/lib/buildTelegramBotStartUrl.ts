import { resolveTelegramBotUsername } from '../constants/telegram'

export function buildTelegramWebStartUrl(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): string {
  const encodedToken = encodeURIComponent(token.trim())
  return `https://t.me/${botUsername}?start=${encodedToken}`
}

/** @alias buildTelegramWebStartUrl */
export const buildTelegramBotStartUrl = buildTelegramWebStartUrl

export function buildTelegramAppStartUrl(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): string {
  const encodedToken = encodeURIComponent(token.trim())
  return `tg://resolve?domain=${botUsername}&start=${encodedToken}`
}

export const TELEGRAM_WEB_LOGIN_URL = 'https://web.telegram.org/a/'

/** QR만 — Web A 빈 화면 폴백용 */
export function buildTelegramWebLoginUrl(): string {
  return TELEGRAM_WEB_LOGIN_URL
}

/** Web A: QR 로그인 + 로그인 후 봇 /start 딥링크 (tgaddr) */
export function buildTelegramWebBotStartUrl(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): string {
  const trimmed = token.trim()
  const tgAddr = `tg://resolve?domain=${botUsername}&start=${trimmed}`
  return `${TELEGRAM_WEB_LOGIN_URL}#?tgaddr=${encodeURIComponent(tgAddr)}`
}

/** @deprecated buildTelegramWebBotStartUrl */
export const buildTelegramWebClientStartUrl = buildTelegramWebBotStartUrl

export function isMobileUserAgent(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

interface OpenTelegramBotLinkOptions {
  /** 클릭 직후(동기) 연 blank 탭 — await 이후 t.me 이동용 (모바일 폴백) */
  assistWindow?: Window | null
}

function openTelegramWebBotTab(
  token: string,
  assistWindow?: Window | null,
  botUsername = resolveTelegramBotUsername(),
): void {
  const webBotUrl = buildTelegramWebBotStartUrl(token, botUsername)
  if (assistWindow && !assistWindow.closed) {
    assistWindow.location.replace(webBotUrl)
    return
  }
  window.open(webBotUrl, '_blank', 'noopener,noreferrer')
}

/**
 * 데스크톱: Web A QR + tgaddr 딥링크 한 URL.
 * 모바일: tg:// → t.me 폴백.
 */
export function openTelegramBotLink(
  token: string,
  options?: OpenTelegramBotLinkOptions,
  botUsername = resolveTelegramBotUsername(),
): void {
  const appUrl = buildTelegramAppStartUrl(token, botUsername)
  const tmeUrl = buildTelegramWebStartUrl(token, botUsername)

  if (isMobileUserAgent()) {
    window.location.assign(appUrl)
    window.setTimeout(() => {
      const assistWindow = options?.assistWindow
      if (assistWindow && !assistWindow.closed) {
        assistWindow.location.href = tmeUrl
        return
      }
      window.open(tmeUrl, '_blank', 'noopener,noreferrer')
    }, 1200)
    return
  }

  openTelegramWebBotTab(token, options?.assistWindow, botUsername)
}

export interface TelegramLinkUrls {
  tme: string
  webLogin: string
  webBot: string
}

export function buildTelegramLinkUrls(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): TelegramLinkUrls {
  return {
    tme: buildTelegramWebStartUrl(token, botUsername),
    webLogin: buildTelegramWebLoginUrl(),
    webBot: buildTelegramWebBotStartUrl(token, botUsername),
  }
}

/** await 전 클릭 핸들러 안에서 호출 — noopener 없이 열어야 토큰 후 location.replace 가능 */
export function openTelegramAssistWindow(): Window | null {
  if (isMobileUserAgent()) return null
  return window.open('', '_blank')
}

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

/** 앱 미설치·브라우저: Telegram Web에서 봇 /start 로 연동 */
export function buildTelegramWebClientStartUrl(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): string {
  const trimmed = token.trim()
  const tgAddr = `tg://resolve?domain=${botUsername}&start=${encodeURIComponent(trimmed)}`
  return `https://web.telegram.org/k/#?tgaddr=${encodeURIComponent(tgAddr)}`
}

export function isMobileUserAgent(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

interface OpenTelegramWebLinkOptions {
  /** 클릭 직후(동기) 연 blank 탭 — await 이후 Telegram Web 이동용 (팝업 차단 회피) */
  assistWindow?: Window | null
}

const DESKTOP_APP_TRY_MS = 1500

function isAssistWindowBlank(assistWindow: Window): boolean {
  try {
    return assistWindow.location.href === 'about:blank'
  } catch {
    return false
  }
}

function navigateAssistWindow(assistWindow: Window, url: string): void {
  if (assistWindow.closed) return
  assistWindow.location.replace(url)
}

/**
 * 단일 연동 진입점.
 * 데스크톱: assist 탭에서 tg:// 앱 시도 → 여전히 blank면 Telegram Web(QR) 폴백.
 * 메인 탭이 아닌 assist 탭에서 tg://를 쓰면 QR 다녀온 뒤 「Telegram 열기」가 늦게 뜨지 않는다.
 * 모바일: tg:// 앱 시도 후 t.me 폴백.
 */
export function openTelegramLink(
  token: string,
  options?: OpenTelegramWebLinkOptions,
  botUsername = resolveTelegramBotUsername(),
): void {
  const appUrl = buildTelegramAppStartUrl(token, botUsername)
  const tmeUrl = buildTelegramWebStartUrl(token, botUsername)
  const webClientUrl = buildTelegramWebClientStartUrl(token, botUsername)

  if (isMobileUserAgent()) {
    window.location.assign(appUrl)
    window.setTimeout(() => {
      window.open(tmeUrl, '_blank', 'noopener,noreferrer')
    }, 1200)
    return
  }

  const assistWindow = options?.assistWindow
  if (!assistWindow || assistWindow.closed) {
    window.open(webClientUrl, '_blank', 'noopener,noreferrer')
    return
  }

  try {
    assistWindow.location.assign(appUrl)
  } catch {
    navigateAssistWindow(assistWindow, webClientUrl)
    return
  }

  window.setTimeout(() => {
    if (assistWindow.closed) return
    if (!isAssistWindowBlank(assistWindow)) return
    navigateAssistWindow(assistWindow, webClientUrl)
  }, DESKTOP_APP_TRY_MS)
}

export interface TelegramLinkUrls {
  tme: string
  webClient: string
}

export function buildTelegramLinkUrls(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): TelegramLinkUrls {
  return {
    tme: buildTelegramWebStartUrl(token, botUsername),
    webClient: buildTelegramWebClientStartUrl(token, botUsername),
  }
}

/** await 전 클릭 핸들러 안에서 호출 — noopener 없이 열어야 토큰 후 location.replace 가능 */
export function openTelegramAssistWindow(): Window | null {
  if (isMobileUserAgent()) return null
  return window.open('', '_blank')
}

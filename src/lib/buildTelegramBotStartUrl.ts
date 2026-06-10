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

/** tg:// 을 window.open 으로 열면 about:blank 가 남는다. */
function tryOpenAppDeepLink(appUrl: string): void {
  const link = document.createElement('a')
  link.href = appUrl
  link.style.display = 'none'
  document.body.appendChild(link)
  link.click()
  link.remove()
}

interface OpenTelegramBotLinkOptions {
  /** 클릭 직후(동기) 연 blank 탭 — await 이후 Telegram Web 이동용 (팝업 차단 회피) */
  assistWindow?: Window | null
}

function navigateAssistWindow(assistWindow: Window, url: string): void {
  if (assistWindow.closed) return
  assistWindow.location.href = url
}

/**
 * 브라우저는 텔레그램 앱 설치 여부를 reliably 판별할 수 없다.
 * 데스크톱: tg:// 시도(앱 있으면 OS 핸드오프) + assist 탭은 항상 Telegram Web(QR)으로 연다.
 * assist 탭을 미리 열면 부모 탭이 hidden/blur 되므로, visibility·blur로 폴백을 취소하지 않는다.
 * 모바일: tg:// → t.me 폴백.
 */
export function openTelegramBotLink(
  token: string,
  options?: OpenTelegramBotLinkOptions,
  botUsername = resolveTelegramBotUsername(),
): void {
  const appUrl = buildTelegramAppStartUrl(token, botUsername)
  const tmeUrl = buildTelegramWebStartUrl(token, botUsername)
  const webClientUrl = buildTelegramWebClientStartUrl(token, botUsername)

  const openFallback = (url: string) => {
    const assistWindow = options?.assistWindow
    if (assistWindow && !assistWindow.closed) {
      navigateAssistWindow(assistWindow, url)
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isMobileUserAgent()) {
    window.location.assign(appUrl)
    window.setTimeout(() => openFallback(tmeUrl), 1200)
    return
  }

  tryOpenAppDeepLink(appUrl)
  openFallback(webClientUrl)
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

/** await 전 클릭 핸들러 안에서 호출 — 사용자 제스처 유지 */
export function openTelegramAssistWindow(): Window | null {
  if (isMobileUserAgent()) return null
  return window.open('', '_blank', 'noopener,noreferrer')
}

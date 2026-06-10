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
  /** 클릭 직후(동기) 연 blank 탭 — await 이후 t.me 이동용 (모바일 폴백) */
  assistWindow?: Window | null
}

/**
 * 데스크톱: tg:// 시도 후 앱 전환(blur)이 없으면 Telegram Web 폴백.
 * 모바일: tg:// → t.me 폴백.
 * t.me·Web 클라이언트 재오픈 링크는 UI 폴백으로도 제공한다.
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
      assistWindow.location.href = url
      return
    }
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  if (isMobileUserAgent()) {
    window.location.assign(appUrl)
    window.setTimeout(() => openFallback(tmeUrl), 1200)
    return
  }

  let cancelled = false
  const cancelFallback = () => {
    cancelled = true
  }

  const onBlur = () => cancelFallback()
  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') cancelFallback()
  }

  window.addEventListener('blur', onBlur)
  document.addEventListener('visibilitychange', onVisibilityChange)

  tryOpenAppDeepLink(appUrl)

  window.setTimeout(() => {
    window.removeEventListener('blur', onBlur)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    if (cancelled) return
    openFallback(webClientUrl)
  }, 1500)
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

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

/** 앱 미설치·데스크톱 브라우저: Telegram Web에서 봇 /start 로 연동 */
export function buildTelegramWebClientStartUrl(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): string {
  const trimmed = token.trim()
  const tgAddr = `tg://resolve?domain=${botUsername}&start=${encodeURIComponent(trimmed)}`
  return `https://web.telegram.org/k/#?tgaddr=${encodeURIComponent(tgAddr)}`
}

function isMobileUserAgent(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

/**
 * 모바일: tg:// 앱 우선 → t.me 폴백.
 * 데스크톱: Telegram Web (t.me START BOT은 앱 없으면 동작 안 하는 경우 많음).
 */
export function openTelegramBotLink(token: string, botUsername = resolveTelegramBotUsername()): void {
  if (isMobileUserAgent()) {
    window.location.assign(buildTelegramAppStartUrl(token, botUsername))
    window.setTimeout(() => {
      window.open(buildTelegramWebStartUrl(token, botUsername), '_blank', 'noopener,noreferrer')
    }, 1200)
    return
  }

  window.open(
    buildTelegramWebClientStartUrl(token, botUsername),
    '_blank',
    'noopener,noreferrer',
  )
}

/** 연동 페이지 다시 열기용 — 데스크톱은 Web, 모바일은 t.me */
export function buildTelegramLinkReopenUrl(
  token: string,
  botUsername = resolveTelegramBotUsername(),
): string {
  return isMobileUserAgent()
    ? buildTelegramWebStartUrl(token, botUsername)
    : buildTelegramWebClientStartUrl(token, botUsername)
}

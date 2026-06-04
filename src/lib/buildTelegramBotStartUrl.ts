import { resolveTelegramBotUsername } from '../constants/telegram'

export function buildTelegramBotStartUrl(token: string, botUsername = resolveTelegramBotUsername()): string {
  const encodedToken = encodeURIComponent(token.trim())
  return `https://t.me/${botUsername}?start=${encodedToken}`
}

const DEFAULT_TELEGRAM_BOT_USERNAME = 'marketlens_noti_bot'

/** @env VITE_TELEGRAM_BOT_USERNAME — BotFather username without @ */
export function resolveTelegramBotUsername(): string {
  const configured = import.meta.env.VITE_TELEGRAM_BOT_USERNAME?.trim()
  if (configured) return configured.replace(/^@/, '')
  return DEFAULT_TELEGRAM_BOT_USERNAME
}

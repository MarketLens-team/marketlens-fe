import { useCallback, useRef, useState } from 'react'
import { issueTelegramLinkToken } from '../data/clients/memberClient'
import { getApiErrorMessage } from '../data/util/apiError'
import {
  buildTelegramLinkUrls,
  isMobileUserAgent,
  openTelegramAssistWindow,
  openTelegramBotLink,
  type TelegramLinkUrls,
} from '../lib/buildTelegramBotStartUrl'

interface UseTelegramLinkOptions {
  onOpened?: () => void
  onError?: (message: string) => void
}

export function useTelegramLink(options?: UseTelegramLinkOptions) {
  const [linking, setLinking] = useState(false)
  const [linkUrls, setLinkUrls] = useState<TelegramLinkUrls | null>(null)
  const onOpenedRef = useRef(options?.onOpened)
  const onErrorRef = useRef(options?.onError)
  onOpenedRef.current = options?.onOpened
  onErrorRef.current = options?.onError

  const linkTelegram = useCallback(async () => {
    if (linking) return

    // 모바일만 await 전 assist 탭 — tg:// 실패 시 t.me 폴백용
    const assistWindow = isMobileUserAgent() ? openTelegramAssistWindow() : null

    setLinking(true)
    try {
      const { token } = await issueTelegramLinkToken()
      setLinkUrls(buildTelegramLinkUrls(token))
      openTelegramBotLink(token, { assistWindow })
      onOpenedRef.current?.()
    } catch (error) {
      assistWindow?.close()
      setLinkUrls(null)
      onErrorRef.current?.(getApiErrorMessage(error, '텔레그램 연동 준비에 실패했습니다.'))
    } finally {
      setLinking(false)
    }
  }, [linking])

  return { linking, linkTelegram, linkUrls }
}

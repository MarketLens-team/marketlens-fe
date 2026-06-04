import { useCallback, useRef, useState } from 'react'
import { issueTelegramLinkToken } from '../data/clients/memberClient'
import { getApiErrorMessage } from '../data/util/apiError'
import {
  buildTelegramLinkUrls,
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

    // await 전 동기 호출 — Chrome이 사용자 클릭으로 인식해 t.me·tg:// 허용
    const assistWindow = openTelegramAssistWindow()

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

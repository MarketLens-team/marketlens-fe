import { useCallback, useRef, useState } from 'react'
import { issueTelegramLinkToken } from '../data/clients/memberClient'
import { getApiErrorMessage } from '../data/util/apiError'
import { buildTelegramBotStartUrl } from '../lib/buildTelegramBotStartUrl'

interface UseTelegramLinkOptions {
  onOpened?: () => void
  onError?: (message: string) => void
}

export function useTelegramLink(options?: UseTelegramLinkOptions) {
  const [linking, setLinking] = useState(false)
  const onOpenedRef = useRef(options?.onOpened)
  const onErrorRef = useRef(options?.onError)
  onOpenedRef.current = options?.onOpened
  onErrorRef.current = options?.onError

  const linkTelegram = useCallback(async () => {
    if (linking) return
    setLinking(true)
    try {
      const { token } = await issueTelegramLinkToken()
      const url = buildTelegramBotStartUrl(token)
      window.open(url, '_blank', 'noopener,noreferrer')
      onOpenedRef.current?.()
    } catch (error) {
      onErrorRef.current?.(getApiErrorMessage(error, '텔레그램 연동 준비에 실패했습니다.'))
    } finally {
      setLinking(false)
    }
  }, [linking])

  return { linking, linkTelegram }
}

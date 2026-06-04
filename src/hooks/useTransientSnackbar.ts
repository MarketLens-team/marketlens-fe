import { useCallback, useEffect, useRef, useState } from 'react'

interface SnackbarAction {
  label: string
  onAction: () => void
}

interface ShowSnackbarOptions {
  durationMs?: number
  action?: SnackbarAction
}

export function useTransientSnackbar(defaultDurationMs = 2800) {
  const [message, setMessage] = useState<string | null>(null)
  const [action, setAction] = useState<SnackbarAction | null>(null)
  const timerRef = useRef<number | null>(null)

  const hide = useCallback(() => {
    if (timerRef.current != null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
    setMessage(null)
    setAction(null)
  }, [])

  const show = useCallback(
    (nextMessage: string, options?: ShowSnackbarOptions) => {
      if (timerRef.current != null) {
        window.clearTimeout(timerRef.current)
      }
      const durationMs = options?.durationMs ?? defaultDurationMs
      setMessage(nextMessage)
      setAction(options?.action ?? null)
      timerRef.current = window.setTimeout(() => {
        setMessage(null)
        setAction(null)
        timerRef.current = null
      }, durationMs)
    },
    [defaultDurationMs],
  )

  useEffect(() => hide, [hide])

  return {
    message,
    actionLabel: action?.label,
    onAction: action?.onAction,
    show,
    hide,
  }
}

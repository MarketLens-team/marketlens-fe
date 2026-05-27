import { useCallback, useEffect, useState } from 'react'

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function useResendCooldown(durationSeconds: number) {
  const [remaining, setRemaining] = useState(durationSeconds)

  useEffect(() => {
    if (remaining <= 0) return
    const timer = window.setInterval(() => {
      setRemaining((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => window.clearInterval(timer)
  }, [remaining])

  const restart = useCallback(() => {
    setRemaining(durationSeconds)
  }, [durationSeconds])

  return {
    canResend: remaining === 0,
    formatted: formatCountdown(remaining),
    restart,
  }
}

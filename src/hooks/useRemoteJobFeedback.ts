import { useEffect, useRef, useState } from 'react'

export type RemoteJobStatus = 'idle' | 'pending' | 'success' | 'error' | 'cancelled'

interface UseRemoteJobFeedbackOptions {
  intervalMs?: number
  minStep?: number
  maxStep?: number
}

export function useRemoteJobFeedback(options?: UseRemoteJobFeedbackOptions) {
  const intervalMs = options?.intervalMs ?? 420
  const minStep = options?.minStep ?? 8
  const maxStep = options?.maxStep ?? 18

  const [status, setStatus] = useState<RemoteJobStatus>('idle')
  const [progress, setProgress] = useState(0)
  const [jobId, setJobId] = useState(0)
  const [isRunning, setIsRunning] = useState(false)

  const timerRef = useRef<number | null>(null)

  const stopTimer = () => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current)
      timerRef.current = null
    }
  }

  const start = (onDone?: (nextJobId: number) => void) => {
    if (isRunning) return

    const nextJobId = jobId + 1
    setJobId(nextJobId)
    setProgress(0)
    setStatus('pending')
    setIsRunning(true)
    stopTimer()

    timerRef.current = window.setInterval(() => {
      setProgress((prev) => {
        const step = Math.floor(Math.random() * (maxStep - minStep + 1)) + minStep
        const next = Math.min(prev + step, 100)
        if (next >= 100) {
          stopTimer()
          setIsRunning(false)
          setStatus('success')
          onDone?.(nextJobId)
        }
        return next
      })
    }, intervalMs)
  }

  const cancel = (onCancelled?: () => void) => {
    if (!isRunning) return
    stopTimer()
    setIsRunning(false)
    setStatus('cancelled')
    onCancelled?.()
  }

  useEffect(() => {
    return () => {
      stopTimer()
    }
  }, [])

  return {
    status,
    progress,
    jobId,
    isRunning,
    start,
    cancel,
  }
}

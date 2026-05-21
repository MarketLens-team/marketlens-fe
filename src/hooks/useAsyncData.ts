import { useEffect, useState } from 'react'
import { MIN_LOADING_MS, withMinDuration } from '../lib/withMinDuration'
import { useAuthStore } from '../store/authStore'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
}

export interface UseAsyncDataOptions {
  enabled?: boolean
  /** 로딩 UI 최소 노출 시간(ms). 기본 500 */
  minLoadingMs?: number
}

export function useAsyncData<T>(
  factory: () => Promise<T>,
  options?: UseAsyncDataOptions,
): AsyncState<T> {
  const enabled = options?.enabled !== false
  const minLoadingMs = options?.minLoadingMs ?? MIN_LOADING_MS
  const authToken = useAuthStore((state) => state.token)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      return
    }
    let cancelled = false
    setData(null)
    setLoading(true)
    setError(null)

    void withMinDuration(factory, minLoadingMs)
      .then((value) => {
        if (!cancelled) {
          setData(value)
          setLoading(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setLoading(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [authToken, enabled, factory, minLoadingMs])

  return { data, loading, error }
}

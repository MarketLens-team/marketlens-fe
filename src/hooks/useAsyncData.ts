import { useEffect, useRef, useState } from 'react'
import { MIN_LOADING_MS, withMinDuration } from '../lib/withMinDuration'
import { useAuthStore } from '../store/authStore'

export interface AsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  /** keepPreviousData 시 재요청 중 (첫 로딩이 아님) */
  refreshing: boolean
}

export interface UseAsyncDataOptions {
  enabled?: boolean
  /** 로딩 UI 최소 노출 시간(ms). 기본 500 */
  minLoadingMs?: number
  /** true면 재요청 시 data를 비우지 않음 — 패널 기간 토글 등 깜빡임 방지 */
  keepPreviousData?: boolean
}

export function useAsyncData<T>(
  factory: () => Promise<T>,
  options?: UseAsyncDataOptions,
): AsyncState<T> {
  const enabled = options?.enabled !== false
  const minLoadingMs = options?.minLoadingMs ?? MIN_LOADING_MS
  const keepPreviousData = options?.keepPreviousData === true
  const authToken = useAuthStore((state) => state.token)
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(enabled)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const dataRef = useRef(data)
  dataRef.current = data

  useEffect(() => {
    if (!enabled) {
      setLoading(false)
      setRefreshing(false)
      return
    }
    let cancelled = false
    setError(null)

    const hadData = keepPreviousData && dataRef.current != null
    if (hadData) {
      setRefreshing(true)
      setLoading(false)
    } else {
      setData(null)
      setLoading(true)
      setRefreshing(false)
    }

    void withMinDuration(factory, minLoadingMs)
      .then((value) => {
        if (!cancelled) {
          setData(value)
          setLoading(false)
          setRefreshing(false)
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e instanceof Error ? e : new Error(String(e)))
          setLoading(false)
          setRefreshing(false)
        }
      })

    return () => {
      cancelled = true
    }
  }, [authToken, enabled, factory, minLoadingMs, keepPreviousData])

  return { data, loading, error, refreshing }
}

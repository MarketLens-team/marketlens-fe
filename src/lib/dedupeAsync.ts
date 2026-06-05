type CacheEntry<T> = {
  promise: Promise<T>
  expiresAt: number
}

const inFlight = new Map<string, CacheEntry<unknown>>()
const settled = new Map<string, CacheEntry<unknown>>()

/** React 18 StrictMode 이중 mount·근접 effect 재실행 병합 */
export const STRICT_MODE_DEDUPE_TTL_MS = 5_000

export interface DedupeAsyncOptions {
  /** resolve 후 재사용(ms). StrictMode 이중 mount 병합용 */
  ttlMs?: number
}

/** 동일 key의 동시·근접 요청을 1회로 합칩니다. */
export function dedupeAsync<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: DedupeAsyncOptions,
): Promise<T> {
  const ttlMs = options?.ttlMs ?? 0
  const now = Date.now()

  const cached = settled.get(key) as CacheEntry<T> | undefined
  if (cached && cached.expiresAt > now) {
    return cached.promise
  }
  if (cached) {
    settled.delete(key)
  }

  const pending = inFlight.get(key) as CacheEntry<T> | undefined
  if (pending) {
    return pending.promise
  }

  const promise = fetcher()
    .then((value) => {
      if (ttlMs > 0) {
        settled.set(key, {
          promise: Promise.resolve(value),
          expiresAt: Date.now() + ttlMs,
        })
      }
      return value
    })
    .finally(() => {
      inFlight.delete(key)
    })

  inFlight.set(key, { promise, expiresAt: 0 })
  return promise
}

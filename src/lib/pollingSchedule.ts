const MS_PER_MINUTE = 60_000

/**
 * 다음 wall-clock 구간까지 대기(ms).
 * 예: interval 5분, lag 15초 → :00:15, :05:15, :10:15 …
 */
export function msUntilNextWallClockInterval(intervalMs: number, lagMs = 0): number {
  const phase = ((lagMs % intervalMs) + intervalMs) % intervalMs
  const elapsed = (Date.now() - phase) % intervalMs
  return elapsed === 0 ? intervalMs : intervalMs - elapsed
}

export const STOCK_PRICE_POLL_INTERVAL_MS = 5 * MS_PER_MINUTE

/** 백엔드 주가 스케줄(5분) 직후 DB 반영 여유 */
export const STOCK_PRICE_POLL_LAG_MS = 15_000

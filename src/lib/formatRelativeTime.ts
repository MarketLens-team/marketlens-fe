const PERSON_TIMELINE_FRESH_MS = 60 * 60 * 1000

/** 종목 상세 인물 발언 타임라인 — 1시간 이내 `N분 전` + fresh 플래그 */
export function formatPersonTimelineTime(iso: string): { label: string; isFresh: boolean } {
  const then = new Date(iso).getTime()
  const diff = Math.max(0, Date.now() - then)
  const isFresh = diff < PERSON_TIMELINE_FRESH_MS
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (isFresh) {
    return { label: `${mins}분 전`, isFresh: true }
  }
  if (hours < 24) return { label: `${hours}시간 전`, isFresh: false }
  if (days >= 1) return { label: `${days}일 전`, isFresh: false }
  return { label: `${mins}분 전`, isFresh: false }
}

/** 한국어 상대 시각 (목록·메타용) */
export function formatRelativeTimeKo(iso: string): string {
  const then = new Date(iso).getTime()
  const diff = Date.now() - then
  if (diff < 0) return '방금 전'
  const days = Math.floor(diff / 86400000)
  if (days >= 1) return `${days}일 전`
  const hours = Math.floor(diff / 3600000)
  if (hours >= 1) return `${hours}시간 전`
  const mins = Math.floor(diff / 60000)
  if (mins >= 1) return `${mins}분 전`
  return '방금 전'
}

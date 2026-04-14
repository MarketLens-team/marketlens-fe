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

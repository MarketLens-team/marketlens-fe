/** 시간 뱃지 (04:20) */
export function formatNewsTimeBadge(iso: string): string {
  return new Date(iso).toLocaleTimeString('ko-KR', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })
}

/**  날짜 (2026년 5월 19일 화요일) */
export function formatNewsDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })
}

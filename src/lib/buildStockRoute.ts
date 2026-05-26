/** 종목 목록·상세 경로 */
export function buildStockListPath(): string {
  return '/stock'
}

export function buildStockDetailPath(
  stockCode: string,
  focus?: { newsId?: string; /** 기본 true — 전체 뉴스 등에서는 false */ scrollToNews?: boolean },
): string {
  const path = `/stock/${stockCode}`
  if (!focus?.newsId) return path
  const params = new URLSearchParams({ newsId: focus.newsId })
  if (focus.scrollToNews === false) params.set('scrollToNews', '0')
  return `${path}?${params.toString()}`
}

/** 종목 목록·상세 경로 */
export function buildStockListPath(): string {
  return '/stock'
}

export function buildStockDetailPath(stockCode: string, focus?: { newsId?: string }): string {
  const path = `/stock/${stockCode}`
  if (!focus?.newsId) return path
  return `${path}?newsId=${encodeURIComponent(focus.newsId)}`
}

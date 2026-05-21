import type { SearchNewsPreview } from '../data/types/search'

export function resolveSearchNewsStockCode(item: SearchNewsPreview): string | null {
  if (item.primaryStockCode) return item.primaryStockCode
  if (item.sourceType === 'mixed' && item.stocks.length > 0) return item.stocks[0].stockCode
  if (item.stocks.length > 0) return item.stocks[0].stockCode
  return null
}

export function buildStockDetailPath(stockCode: string, newsId?: string): string {
  const path = `/stock/${stockCode}`
  if (!newsId) return path
  return `${path}?newsId=${encodeURIComponent(newsId)}`
}

/** 검색 뉴스 행 클릭 — 종목 상세 + 해당 뉴스 포커스 */
export function resolveSearchNewsRoute(item: SearchNewsPreview): string | null {
  const stockCode = resolveSearchNewsStockCode(item)
  if (stockCode) return buildStockDetailPath(stockCode, item.id)

  if (item.sourceType === 'person' && item.stocks.length === 0 && item.persons.length > 0) {
    return '/person'
  }

  if (item.sourceType === 'person' && item.persons.length > 0) {
    return '/person'
  }

  return null
}

/** 뉴스 카드 종목명 클릭 — 종목 상세만 */
export function resolveSearchNewsStockRoute(item: SearchNewsPreview): string | null {
  const stockCode = resolveSearchNewsStockCode(item)
  if (!stockCode) return null
  return buildStockDetailPath(stockCode)
}

/** 뉴스 카드 좌상단 종목명 (대표 종목 우선) */
export function formatSearchNewsStockLabel(item: SearchNewsPreview): string | undefined {
  if (item.primaryStockCode) {
    const primary = item.stocks.find((s) => s.stockCode === item.primaryStockCode)
    if (primary) return primary.stockName
  }
  if (item.stocks.length === 1) return item.stocks[0].stockName
  if (item.sourceType === 'person' && item.persons.length === 1) return item.persons[0].personName
  if (item.persons.length === 1) return item.persons[0].personName
  return undefined
}

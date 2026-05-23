import type { SearchNewsPreview } from '../data/types/search'

/** 종목 검색 결과가 1개일 때 — 뉴스 행을 해당 종목 뉴스로 취급 */
export type SearchNewsStockContext = {
  stockCode: string
  stockName: string
}

export function resolveSearchNewsStockCode(
  item: SearchNewsPreview,
  singleStock?: SearchNewsStockContext | null,
): string | null {
  if (singleStock) return singleStock.stockCode
  if (item.primaryStockCode) return item.primaryStockCode
  if (item.sourceType === 'mixed' && item.stocks.length > 0) return item.stocks[0].stockCode
  if (item.stocks.length > 0) return item.stocks[0].stockCode
  return null
}

export function buildStockDetailPath(stockCode: string, focus?: { newsId?: string }): string {
  const path = `/stock/${stockCode}`
  if (!focus?.newsId) return path
  return `${path}?newsId=${encodeURIComponent(focus.newsId)}`
}

/** 검색 뉴스 행 클릭 — 종목 상세 + 해당 뉴스 포커스 */
export function resolveSearchNewsRoute(
  item: SearchNewsPreview,
  singleStock?: SearchNewsStockContext | null,
): string | null {
  const stockCode = resolveSearchNewsStockCode(item, singleStock)
  if (stockCode) return buildStockDetailPath(stockCode, { newsId: item.id })

  if (item.sourceType === 'person' && item.stocks.length === 0 && item.persons.length > 0) {
    return '/person'
  }

  if (item.sourceType === 'person' && item.persons.length > 0) {
    return '/person'
  }

  return null
}

/** 뉴스 카드 종목명 클릭 — 종목 상세만 */
export function resolveSearchNewsStockRoute(
  item: SearchNewsPreview,
  singleStock?: SearchNewsStockContext | null,
): string | null {
  const stockCode = resolveSearchNewsStockCode(item, singleStock)
  if (!stockCode) return null
  return buildStockDetailPath(stockCode)
}

/** 뉴스 카드 좌상단 종목명 (대표 종목 우선) */
export function formatSearchNewsStockLabel(
  item: SearchNewsPreview,
  singleStock?: SearchNewsStockContext | null,
): string | undefined {
  if (singleStock) return singleStock.stockName
  if (item.primaryStockCode) {
    const primary = item.stocks.find((s) => s.stockCode === item.primaryStockCode)
    if (primary) return primary.stockName
  }
  if (item.stocks.length === 1) return item.stocks[0].stockName
  if (item.sourceType === 'person' && item.persons.length === 1) return item.persons[0].personName
  if (item.persons.length === 1) return item.persons[0].personName
  return undefined
}

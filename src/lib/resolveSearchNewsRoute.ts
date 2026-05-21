import type { SearchNewsPreview } from '../data/types/search'

/** 검색 뉴스 행 클릭 시 앱 내 라우트 (없으면 originalLink 등 외부 링크 사용) */
export function resolveSearchNewsRoute(item: SearchNewsPreview): string | null {
  if (item.primaryStockCode) {
    return `/stock/${item.primaryStockCode}`
  }

  if (item.sourceType === 'mixed' && item.stocks.length > 0) {
    return `/stock/${item.stocks[0].stockCode}`
  }

  if (item.sourceType === 'person' && item.stocks.length === 0 && item.persons.length > 0) {
    return '/person'
  }

  if (item.stocks.length > 0) {
    return `/stock/${item.stocks[0].stockCode}`
  }

  if (item.sourceType === 'person' && item.persons.length > 0) {
    return '/person'
  }

  return null
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

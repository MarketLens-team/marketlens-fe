import { mapStockTodayNewsResponse } from '../mappers/stockMapper'
import type { StockTodayNewsResponse } from '../types/stockApi'
import { buildMockStockOverviewResponse } from './stockOverview.mock'

export function buildMockStockTodayNewsResponse(): StockTodayNewsResponse {
  const overview = buildMockStockOverviewResponse()
  const items = overview.items
    .map((row, index) => ({
      stockCode: row.stockCode,
      stockName: row.stockName,
      market: row.market,
      sectorCode: row.sectorCode,
      sectorName: row.sectorName,
      imageUrl: row.imageUrl,
      todayNewsCount: Math.max(1, 120 - index * 11 - (index % 3) * 4),
    }))
    .sort((a, b) => b.todayNewsCount - a.todayNewsCount)

  const totalTodayNewsCount = items.reduce((sum, row) => sum + row.todayNewsCount, 0)

  return {
    updatedAt: new Date().toISOString(),
    totalTodayNewsCount,
    items,
  }
}

export function buildMockStockTodayNews() {
  return mapStockTodayNewsResponse(buildMockStockTodayNewsResponse())
}

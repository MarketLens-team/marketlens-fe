import { mapStockOverviewResponse, mapStockRankingsResponse } from '../mappers/stockMapper'
import type { StockOverviewResponse, StockRankingsResponse } from '../types/stockApi'
import { buildMockStockPricesForDirectory } from './stockPrices.mock'
import { mockStockDirectory } from './stockDirectory.mock'
import { mockStockDetails } from './stock.mock'

function mockMentionMetrics(index: number): {
  mentionCount24h: number
  mentionChangeRate24h: number | null
  sentimentScore24h: number
  sentimentDelta24h: number | null
} {
  const detail = mockStockDetails[Object.keys(mockStockDetails)[index % 5]]
  const baseMention = 12 + (index % 17) * 3
  const mentionChange = index % 6 === 0 ? null : ((index % 9) - 4) * 4.2
  const sentiment =
    detail?.stock.sentimentScore ?? ((index % 7) - 3) * 8 + (index % 3) * 2
  const sentimentDelta = index % 4 === 0 ? null : ((index % 5) - 2) * 6

  return {
    mentionCount24h: baseMention,
    mentionChangeRate24h: mentionChange,
    sentimentScore24h: sentiment,
    sentimentDelta24h: sentimentDelta,
  }
}

export function buildMockStockOverviewResponse(): StockOverviewResponse {
  const prices = buildMockStockPricesForDirectory(mockStockDirectory)
  const stocks = prices.items.map((item, index) => {
    const sector = mockStockDirectory.sectors.find((group) =>
      group.stocks.some((stock) => stock.code === item.stockCode),
    )
    const directoryStock = sector?.stocks.find((stock) => stock.code === item.stockCode)
    const metrics = mockMentionMetrics(index)

    return {
      stockCode: item.stockCode,
      stockName: item.stockName,
      market: item.market ?? directoryStock?.market ?? 'KOSPI',
      sectorCode: sector?.sectorCode ?? '',
      sectorName: sector?.sectorName ?? '—',
      imageUrl: item.imageUrl,
      currentPrice: item.currentPrice,
      changeRate: item.changeRate,
      ...metrics,
    }
  })

  const currentNewsCount = stocks.reduce((sum, row) => sum + (row.mentionCount24h ?? 0), 0)

  return { currentNewsCount, items: stocks }
}

function topBy<T>(items: T[], selector: (item: T) => number, limit = 5): T[] {
  return [...items].sort((a, b) => selector(b) - selector(a)).slice(0, limit)
}

export function buildMockStockRankingsResponse(): StockRankingsResponse {
  const overview = buildMockStockOverviewResponse()

  const currentNewsCount = overview.currentNewsCount

  return {
    currentNewsCount,
    topMentionCount: topBy(overview.items, (row) => row.mentionCount24h ?? 0),
    topSentimentScore: topBy(overview.items, (row) => row.sentimentScore24h ?? 0),
    topChangeRate: topBy(overview.items, (row) => row.changeRate ?? 0),
  }
}

export function buildMockStockOverview() {
  return mapStockOverviewResponse(buildMockStockOverviewResponse())
}

export function buildMockStockRankings() {
  return mapStockRankingsResponse(buildMockStockRankingsResponse())
}

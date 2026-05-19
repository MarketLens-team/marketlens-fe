import type { StockBuzzSurgeResponse } from '../types/stockApi'
import type { BuzzSurgePage, BuzzSurgeRow } from '../types/buzzSurge'

const SURGE_DETECT_THRESHOLD = 180

function mapItems(items: StockBuzzSurgeResponse['items']): BuzzSurgeRow[] {
  return items.map((item) => ({
    rank: item.rank,
    stockCode: item.stockCode,
    stockName: item.stockName,
    currentMentionCount: item.currentMentionCount,
    surgePercent: item.rolling24hChangeRate,
    sentimentScore: item.sentimentScore,
    aiSummary: item.aiSummary,
  }))
}

function averageSentiment(items: BuzzSurgeRow[]): number {
  if (!items.length) return 0
  const sum = items.reduce((acc, row) => acc + row.sentimentScore, 0)
  return Math.round(sum / items.length)
}

export function mapBuzzSurgePage(response: StockBuzzSurgeResponse): BuzzSurgePage {
  const items = mapItems(response.items)

  return {
    updatedAt: response.updatedAt,
    summary: {
      detectedCount: items.filter((row) => row.surgePercent >= SURGE_DETECT_THRESHOLD).length,
      topMoverName: response.topMover.stockName,
      topMoverSurgePercent: response.topMover.rolling24hChangeRate,
      avgSentiment: averageSentiment(items),
      newsCount: response.currentNewsCount,
    },
    items,
  }
}

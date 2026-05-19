import type { UTCTimestamp } from 'lightweight-charts'
import type { StockSentimentTrendPoint } from '../../data/types/stock'

export function toChartTime(recordedAt: string): UTCTimestamp {
  return (Math.floor(new Date(recordedAt).getTime() / 1000) as UTCTimestamp)
}

export function trendToAreaData(trend: StockSentimentTrendPoint[]) {
  return trend.map((p) => ({
    time: toChartTime(p.recordedAt),
    value: p.score,
  }))
}

export function trendToHistogramData(trend: StockSentimentTrendPoint[]) {
  return trend.map((p) => ({
    time: toChartTime(p.recordedAt),
    value: p.mentionCount,
  }))
}

export function maxMentionCount(trend: StockSentimentTrendPoint[]): number {
  return Math.max(...trend.map((p) => p.mentionCount), 1)
}

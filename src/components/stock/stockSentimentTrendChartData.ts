import type { UTCTimestamp } from 'lightweight-charts'
import { toFiniteNumber } from '../../lib/toFiniteNumber'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import {
  STOCK_SENTIMENT_EXTREME_NEGATIVE_BAND,
  STOCK_SENTIMENT_EXTREME_NEGATIVE_Y1,
} from './stockSentimentZones'

export function toChartTime(recordedAt: string): UTCTimestamp {
  return (Math.floor(new Date(recordedAt).getTime() / 1000) as UTCTimestamp)
}

export function trendToAreaData(trend: StockSentimentTrendPoint[]) {
  return trend.map((p) => ({
    time: toChartTime(p.recordedAt),
    value: toFiniteNumber(p.score),
  }))
}

/** 언급량을 극도 부정 구간(-100~-60) 높이로 매핑 (CMC 극도 공포 하단 거래량) */
export function trendToMentionHistogramData(
  trend: StockSentimentTrendPoint[],
  mentionMax: number,
) {
  const scaleMax = Math.max(mentionMax, 1)
  return trend.map((p) => ({
    time: toChartTime(p.recordedAt),
    value:
      STOCK_SENTIMENT_EXTREME_NEGATIVE_Y1 +
      (toFiniteNumber(p.mentionCount) / scaleMax) * STOCK_SENTIMENT_EXTREME_NEGATIVE_BAND,
  }))
}

export function maxMentionCount(trend: StockSentimentTrendPoint[]): number {
  return Math.max(...trend.map((p) => p.mentionCount), 1)
}

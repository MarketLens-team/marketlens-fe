import { formatStockScore, STOCK_SENTIMENT_NEUTRAL_BAND } from '../stock/stockScore'

export { formatStockScore }

export type BuzzSentimentTone = 'pos' | 'warm' | 'neg' | 'neu'

/** stockSentimentZones 중립 구간(±20) — warm=노란색, pos/neg=초록/빨강 */
export function buzzSentimentClass(score: number): BuzzSentimentTone {
  if (score > STOCK_SENTIMENT_NEUTRAL_BAND) return 'pos'
  if (score < -STOCK_SENTIMENT_NEUTRAL_BAND) return 'neg'
  return 'warm'
}

export function formatSurgePercent(value: number): string {
  return `+${value}%`
}

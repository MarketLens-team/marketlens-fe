import { formatStockScore } from '../stock/stockScore'

export { formatStockScore }

export type BuzzSentimentTone = 'pos' | 'warm' | 'neg' | 'neu'

export function buzzSentimentClass(score: number): BuzzSentimentTone {
  if (score >= 20) return 'pos'
  if (score > 0) return 'warm'
  if (score < 0) return 'neg'
  return 'neu'
}

export function formatSurgePercent(value: number): string {
  return `+${value}%`
}

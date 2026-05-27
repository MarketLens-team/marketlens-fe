/** stockSentimentZones 중립 구간(±20)과 동일 */
export const STOCK_SENTIMENT_NEUTRAL_BAND = 20

export type StockSentimentTone = 'positive' | 'negative' | 'neutral'

export function stockSentimentTone(score: number): StockSentimentTone {
  if (score > STOCK_SENTIMENT_NEUTRAL_BAND) return 'positive'
  if (score < -STOCK_SENTIMENT_NEUTRAL_BAND) return 'negative'
  return 'neutral'
}

export function formatStockScore(score: number): string {
  if (score === 0) return '0'
  return score > 0 ? `+${score}` : String(score)
}

export function formatPercent(value: number, signed = true): string {
  const prefix = signed && value > 0 ? '+' : ''
  return `${prefix}${value}%`
}

export function formatPrice(value: number): string {
  return value.toLocaleString('ko-KR')
}

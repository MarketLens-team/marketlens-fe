/** stockSentimentZones 중립 구간(±20)과 동일 */
export const STOCK_SENTIMENT_NEUTRAL_BAND = 20

export type PriceChangeDirection = 'up' | 'down' | 'flat'

export function priceChangeDirection(value: number): PriceChangeDirection {
  if (value > 0) return 'up'
  if (value < 0) return 'down'
  return 'flat'
}

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

const SENTIMENT_TONE_LABEL: Record<StockSentimentTone, string> = {
  positive: '긍정',
  negative: '부정',
  neutral: '중립',
}

/** UI 보조 문장 — 예: 뉴스 감성 중립(0) · 뉴스 감성 부정 -32 */
export function formatSentimentReadable(score: number): string {
  const tone = stockSentimentTone(score)
  const label = SENTIMENT_TONE_LABEL[tone]
  const value = formatStockScore(score)
  if (tone === 'neutral' && score === 0) return `뉴스 감성 ${label}`
  return `뉴스 감성 ${label} ${value}`
}

export function formatPercent(value: number, signed = true): string {
  const prefix = signed && value > 0 ? '+' : ''
  return `${prefix}${value}%`
}

export function formatPrice(value: number): string {
  return value.toLocaleString('ko-KR')
}

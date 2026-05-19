import type { SentimentTone } from './stockSentimentInterpretation'
import { SENTIMENT_BAND_COLORS } from './stockSentimentChartColors'

export interface StockSentimentBand {
  y1: number
  y2: number
  tone: SentimentTone
}

/** 5구간 — CMC Fear & Greed 배경 */
export const STOCK_SENTIMENT_BANDS: StockSentimentBand[] = [
  { y1: 60, y2: 100, tone: 'extremePositive' },
  { y1: 20, y2: 60, tone: 'positive' },
  { y1: -20, y2: 20, tone: 'neutral' },
  { y1: -60, y2: -20, tone: 'negative' },
  { y1: -100, y2: -60, tone: 'extremeNegative' },
]

export function bandBackgroundColor(band: StockSentimentBand): string {
  return SENTIMENT_BAND_COLORS[band.tone]
}

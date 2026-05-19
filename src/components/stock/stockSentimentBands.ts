import { SENTIMENT_BAND_COLORS } from './stockSentimentChartColors'

export type StockSentimentExtremeTone = 'extremeNegative' | 'extremePositive'

export interface StockSentimentBand {
  y1: number
  y2: number
  tone: StockSentimentExtremeTone
}

/** CMC 스타일 — 극단 구간(±60~)만 배경 강조 */
export const STOCK_SENTIMENT_BANDS: StockSentimentBand[] = [
  { y1: 60, y2: 100, tone: 'extremePositive' },
  { y1: -100, y2: -60, tone: 'extremeNegative' },
]

export function bandBackgroundColor(band: StockSentimentBand): string {
  return SENTIMENT_BAND_COLORS[band.tone]
}

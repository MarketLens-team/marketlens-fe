import type { SentimentTone } from '../components/stock/stockSentimentInterpretation'

/** 대시보드 게이지·종목 차트 공통 5단계 색 (좌→우: 부정→긍정) */
export const SENTIMENT_GAUGE_COLORS: Record<SentimentTone, string> = {
  extremeNegative: '#f6465d',
  negative: '#f18a42',
  neutral: '#f0b429',
  positive: '#79b852',
  extremePositive: '#02c076',
}

export const SENTIMENT_GAUGE_COLORS_LIST = [
  SENTIMENT_GAUGE_COLORS.extremeNegative,
  SENTIMENT_GAUGE_COLORS.negative,
  SENTIMENT_GAUGE_COLORS.neutral,
  SENTIMENT_GAUGE_COLORS.positive,
  SENTIMENT_GAUGE_COLORS.extremePositive,
] as const

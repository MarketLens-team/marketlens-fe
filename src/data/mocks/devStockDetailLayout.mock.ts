import type { StockNewsItem, StockSentimentTrendPoint } from '../types/stock'
import { buildStockSentimentTrend } from './stockSentimentTrend.mock'

export interface DevStockLayoutRelatedStock {
  code: string
  name: string
  price: number
  changePercent: number
}

export interface DevIssueStreamItem {
  id: string
  title: string
  timeLabel: string
  sentiment: 'positive' | 'negative' | 'neutral'
}

export interface DevCandlePoint {
  dateLabel: string
  open: number
  high: number
  low: number
  close: number
  mention: number
  bullish: boolean
}

export interface DevStockLayoutPreview {
  stock: {
    code: string
    name: string
    market: string
    sector: string
    sentimentScore: number
    mentionChangePercent: number
    mentionCount: number
    price: { current: number; change: number; changePercent: number }
    aiSummary: string
  }
  sentimentContext: {
    current: number
    avg30d: number
    high30d: number
    low30d: number
    volatility: number
    trend: StockSentimentTrendPoint[]
  }
  breakdown: {
    positive: number
    neutral: number
    negative: number
  }
  relatedStocks: DevStockLayoutRelatedStock[]
  issueStream: DevIssueStreamItem[]
  /** C안 — 오늘 핫 이슈 불릿 */
  hotIssueBullets: string[]
  news: StockNewsItem[]
}

const AI_SUMMARY =
  '반도체 투자 관련 정치적 논란이 일부 부정 언급을 유발했으나, 국내 브랜드 가치 1위 선정 등 긍정 이슈가 상쇄했습니다.'

export const DEV_STOCK_LAYOUT_PREVIEW: DevStockLayoutPreview = {
  stock: {
    code: '005930',
    name: '삼성전자',
    market: 'KOSPI',
    sector: '반도체',
    sentimentScore: 10,
    mentionChangePercent: 15,
    mentionCount: 177,
    price: { current: 297_000, change: -5_506, changePercent: -1.82 },
    aiSummary: AI_SUMMARY,
  },
  sentimentContext: {
    current: 10,
    avg30d: 7,
    high30d: 36,
    low30d: -18,
    volatility: 12,
    trend: buildStockSentimentTrend(10, 7, 30),
  },
  breakdown: {
    positive: 69,
    neutral: 58,
    negative: 50,
  },
  relatedStocks: [
    { code: '000990', name: 'DB하이텍', price: 45_600, changePercent: 2.08 },
    { code: '000660', name: 'SK하이닉스', price: 198_500, changePercent: 1.86 },
    { code: '009150', name: '삼성전기', price: 142_000, changePercent: -1.44 },
  ],
  hotIssueBullets: [
    '반도체 투자 관련 정치 논란으로 부정 언급이 늘었습니다.',
    '국내 브랜드 가치 1위 재선정 등 긍정 이슈가 상쇄했습니다.',
    'HBM 수요 전망 상향으로 메모리 업황 개선 기대가 이어집니다.',
  ],
  issueStream: [
    {
      id: 's1',
      title: '미국 반도체 보조금 조건 논란… 국내 투자 일정 변수',
      timeLabel: '14:32',
      sentiment: 'negative',
    },
    {
      id: 's2',
      title: '삼성전자, 국내 브랜드 가치 1위 재선정',
      timeLabel: '11:15',
      sentiment: 'positive',
    },
    {
      id: 's3',
      title: 'HBM 수요 전망 상향… 메모리 업황 개선 기대',
      timeLabel: '09:48',
      sentiment: 'positive',
    },
    {
      id: 's4',
      title: '파운드리 가동률 회복세… 2분기 수익성 주목',
      timeLabel: '어제',
      sentiment: 'neutral',
    },
    {
      id: 's5',
      title: '원·달러 환율 급등… 수출주 실적 모멘텀 점검',
      timeLabel: '어제',
      sentiment: 'negative',
    },
    {
      id: 's6',
      title: 'AI 서버 수요 확대… DRAM 가격 상승 전망',
      timeLabel: '어제',
      sentiment: 'positive',
    },
  ],
  news: [
    {
      id: 'n1',
      title: '삼성전자, 국내 브랜드 가치 1위… 반도체 투자 논란은 부담',
      source: '연합뉴스',
      publishedAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
      sentiment: 'neutral',
      sentimentScore: 10,
      aiReason: '브랜드 가치 긍정과 투자 논란 부정이 혼재',
      description: '삼성전자가 국내 브랜드 가치 1위에 올랐으나 반도체 투자 관련 정치적 논란이 이어지고 있다.',
    },
    {
      id: 'n2',
      title: 'HBM3E 양산 본격화… AI 메모리 수요 회복 신호',
      source: '한국경제',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      sentiment: 'positive',
      sentimentScore: 62,
      aiReason: '양산·수요 확대 등 성장 키워드 다수',
      description: '차세대 HBM3E 양산이 본격화되며 AI 가속기용 메모리 수요 회복 기대감이 커지고 있다.',
    },
    {
      id: 'n3',
      title: '미국 반도체 보조금 조건 강화 검토… 국내 투자 일정 변수',
      source: '매일경제',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
      sentiment: 'negative',
      sentimentScore: -48,
      aiReason: '규제·변수·리스크 표현 반복',
      description: '미국이 반도체 보조금 조건을 강화할 경우 국내 대규모 투자 일정에 영향을 줄 수 있다.',
    },
    {
      id: 'n4',
      title: '2분기 메모리 가격 상승 전망… 업황 회복세 지속',
      source: '이데일리',
      publishedAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
      sentiment: 'positive',
      sentimentScore: 35,
      aiReason: '가격 상승·회복 전망을 긍정적으로 서술',
      description: '글로벌 메모리 가격 상승 전망이 이어지며 2분기 업황 회복 기대감이 확대되고 있다.',
    },
  ],
}

export function trendToCandles(trend: StockSentimentTrendPoint[]): DevCandlePoint[] {
  return trend.map((point, index) => {
    const open = index === 0 ? point.score : trend[index - 1].score
    const close = point.score
    const wick = 5
    const high = Math.min(100, Math.max(open, close) + wick)
    const low = Math.max(-100, Math.min(open, close) - wick)
    const date = new Date(point.recordedAt)

    return {
      dateLabel: `${date.getDate()}일`,
      open,
      high,
      low,
      close,
      mention: point.mentionCount,
      bullish: close >= open,
    }
  })
}

export function breakdownPercents(breakdown: DevStockLayoutPreview['breakdown']) {
  const total = breakdown.positive + breakdown.neutral + breakdown.negative
  if (total === 0) {
    return { positive: 0, neutral: 0, negative: 0, total: 0 }
  }
  return {
    positive: Math.round((breakdown.positive / total) * 100),
    neutral: Math.round((breakdown.neutral / total) * 100),
    negative: Math.round((breakdown.negative / total) * 100),
    total,
  }
}

import type { StockDetail } from '../types/stock'

const baseNews = (stockName: string) => [
  {
    id: 'n1',
    title: `${stockName} 실적 컨센서스 상회 전망 — 외인 순매수 지속`,
    source: '연합인포맥스',
    publishedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    sentiment: 'positive' as const,
  },
  {
    id: 'n2',
    title: `규제 이슈 재부각… ${stockName} 단기 변동성 확대`,
    source: '한국경제',
    publishedAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    sentiment: 'negative' as const,
  },
  {
    id: 'n3',
    title: `${stockName}, 차세대 라인 투자 계획 발표`,
    source: '매일경제',
    publishedAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    sentiment: 'neutral' as const,
  },
]

export const mockStockDetails: Record<string, StockDetail> = {
  '005930': {
    stock: {
      code: '005930',
      name: '삼성전자',
      sentimentScore: 58,
      buzz24h: 94,
    },
    recentNews: baseNews('삼성전자'),
  },
  '000660': {
    stock: {
      code: '000660',
      name: 'SK하이닉스',
      sentimentScore: 44,
      buzz24h: 71,
    },
    recentNews: baseNews('SK하이닉스'),
  },
  '035420': {
    stock: {
      code: '035420',
      name: 'NAVER',
      sentimentScore: 12,
      buzz24h: 33,
    },
    recentNews: baseNews('NAVER'),
  },
}

export const mockDefaultStockCode = '005930'

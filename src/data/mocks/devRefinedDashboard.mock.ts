export interface DevRefinedMetric {
  id: string
  label: string
  value: string
  caption: string
}

export interface DevRefinedWatchItem {
  id: string
  name: string
  code: string
  score: number
}

export interface DevRefinedNewsItem {
  id: string
  time: string
  title: string
  source: string
  sentiment: '긍정' | '중립' | '부정'
}

export const DEV_REFINED_METRICS: DevRefinedMetric[] = [
  {
    id: 'portfolio',
    label: 'PORTFOLIO SENTIMENT',
    value: '+12',
    caption: '오늘 관심 종목 평균',
  },
  {
    id: 'buzz',
    label: 'ACTIVE BUZZ',
    value: '34',
    caption: '24시간 내 고감성 뉴스',
  },
]

export const DEV_REFINED_WATCHLIST: DevRefinedWatchItem[] = [
  { id: '1', name: '삼성전자', code: '005930', score: 6 },
  { id: '2', name: 'SK하이닉스', code: '000660', score: -3 },
  { id: '3', name: 'NAVER', code: '035420', score: 0 },
  { id: '4', name: '카카오', code: '035720', score: 4 },
  { id: '5', name: 'LG에너지솔루션', code: '373220', score: -8 },
]

export const DEV_REFINED_NEWS: DevRefinedNewsItem[] = [
  {
    id: 'n1',
    time: '12분 전',
    title: '반도체 수출 회복 기대감… HBM 수요 확대',
    source: 'MarketWire',
    sentiment: '긍정',
  },
  {
    id: 'n2',
    time: '28분 전',
    title: '환율 변동성 확대, 수입주 실적 주의',
    source: 'FinPulse',
    sentiment: '중립',
  },
  {
    id: 'n3',
    time: '41분 전',
    title: '2차전지 밸류에이션 부담… 단기 조정 가능',
    source: 'Alpha Desk',
    sentiment: '부정',
  },
]

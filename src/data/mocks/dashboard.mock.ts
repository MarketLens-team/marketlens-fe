import type { DashboardBriefing, DashboardOverview } from '../types/dashboard'

export const mockDashboardBriefing: DashboardBriefing = {
  todaySummary:
    '오늘 포트폴리오 전반에 긍정적인 이슈가 혼재하고 있습니다. SK하이닉스는 AI 투자 확산과 반도체 밸류체인 주목으로 감성이 개선됐고, 셀트리온은 규제 이슈로 단기 주의가 필요합니다.',
  updatedAt: '2026-06-04T14:00:03+09:00',
}

export const mockDashboardOverview: DashboardOverview = {
  portfolioSentiment: {
    score: 23,
    min: -100,
    max: 100,
    distribution: { positive: 50, neutral: 17, negative: 33 },
  },
  stocksToWatch: [
    { name: 'SK하이닉스', metricLabel: '언급량', metricValue: '+189%', tone: 'positive' },
    { name: '셀트리온', metricLabel: '감성', metricValue: '-34', tone: 'negative' },
    { name: '카카오', metricLabel: '언급량', metricValue: '+84%', tone: 'positive' },
  ],
  watchlist: [
    {
      name: '셀트리온',
      code: '068270',
      imageUrl: '/images/stocks/Stock068270.svg',
      price: 168500,
      changePercent: -0.8,
      sentimentScore: -34,
      newsCount: 12,
      mentionSurgePercent: 45,
    },
    {
      name: '카카오',
      code: '035720',
      imageUrl: '/images/stocks/Stock035720.svg',
      price: 45200,
      changePercent: 1.4,
      sentimentScore: 28,
      newsCount: 18,
      mentionSurgePercent: 84,
    },
    {
      name: '현대차',
      code: '005380',
      imageUrl: '/images/stocks/Stock005380.svg',
      price: 248500,
      changePercent: 0.6,
      sentimentScore: 41,
      newsCount: 9,
      mentionSurgePercent: 22,
    },
    {
      name: 'LG에너지솔루션',
      code: '373220',
      imageUrl: '/images/stocks/Stock373220.svg',
      price: 412000,
      changePercent: -1.2,
      sentimentScore: 15,
      newsCount: 14,
      mentionSurgePercent: 31,
    },
    {
      name: 'SK하이닉스',
      code: '000660',
      imageUrl: '/images/stocks/Stock000660.svg',
      price: 198500,
      changePercent: 2.8,
      sentimentScore: 62,
      newsCount: 32,
      mentionSurgePercent: 189,
    },
    {
      name: '삼성전자',
      code: '005930',
      imageUrl: '/images/stocks/Stock005930.svg',
      price: 87400,
      changePercent: 1.2,
      sentimentScore: 73,
      newsCount: 25,
      mentionSurgePercent: 89,
    },
  ],
  kospiSentiment: {
    score: 38,
    min: -100,
    max: 100,
    distribution: { positive: 61, neutral: 15, negative: 24 },
  },
  buzzSurgeTop3: [
    { rank: 1, code: '042660', name: '한화오션', surgePercent: 347 },
    { rank: 2, code: '005930', name: '삼성전자', surgePercent: 289 },
    { rank: 3, code: '000660', name: 'SK하이닉스', surgePercent: 189 },
  ],
  sectorHeatmap: [
    { name: '반도체', sentimentScore: 62, mentionCount: 184 },
    { name: '바이오', sentimentScore: -18, mentionCount: 92 },
    { name: '자동차', sentimentScore: 24, mentionCount: 76 },
    { name: '2차전지', sentimentScore: 11, mentionCount: 118 },
    { name: '조선', sentimentScore: 55, mentionCount: 143 },
    { name: '금융', sentimentScore: -8, mentionCount: 64 },
    { name: '플랫폼', sentimentScore: 19, mentionCount: 88 },
    { name: '화학', sentimentScore: -22, mentionCount: 51 },
  ],
}

import type { DashboardOverview } from '../types/dashboard'

const dayPoints = (base: Date, scores: number[]) =>
  scores.map((score, i) => {
    const d = new Date(base)
    d.setDate(d.getDate() - (scores.length - 1 - i))
    return { at: d.toISOString(), score }
  })

export const mockDashboardOverview: DashboardOverview = {
  stats: [
    {
      id: 'sentiment',
      label: 'Market sentiment',
      value: '+62',
      changePercent: 1.8,
      hint: '전일 대비 종합 스코어',
    },
    {
      id: 'buzz',
      label: 'Active buzz',
      value: '128',
      changePercent: -3.2,
      hint: '감지된 버즈 토픽 수',
    },
    {
      id: 'news',
      label: 'News flow',
      value: '2.4k',
      changePercent: null,
      hint: '24h 뉴스 처리량',
    },
    {
      id: 'risk',
      label: 'Risk flags',
      value: '7',
      changePercent: 0,
      hint: '리스크 태그 뉴스',
    },
  ],
  sentimentTimeline: dayPoints(new Date(), [48, 52, 55, 51, 58, 60, 62]),
  sectorHeat: [
    { sectorCode: 'IT', sectorName: 'IT·반도체', buzzCount: 412, sentimentAvg: 18 },
    { sectorCode: 'FIN', sectorName: '금융', buzzCount: 301, sentimentAvg: -6 },
    { sectorCode: 'BIO', sectorName: '바이오', buzzCount: 267, sentimentAvg: 42 },
    { sectorCode: 'AUTO', sectorName: '자동차', buzzCount: 198, sentimentAvg: 9 },
    { sectorCode: 'RET', sectorName: '유통', buzzCount: 144, sentimentAvg: -12 },
  ],
}

import type { BuzzAlert } from '../types/buzz'

export const mockBuzzAlerts: BuzzAlert[] = [
  {
    id: 'b1',
    topic: 'HBM·AI 반도체 수요',
    spikeScore: 2.8,
    detectedAt: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    relatedStocks: ['000660', '005930'],
  },
  {
    id: 'b2',
    topic: '전기차 보조금 정책',
    spikeScore: 2.1,
    detectedAt: new Date(Date.now() - 1000 * 60 * 55).toISOString(),
    relatedStocks: ['005380'],
  },
  {
    id: 'b3',
    topic: '가상자산 과세 유예',
    spikeScore: 1.6,
    detectedAt: new Date(Date.now() - 1000 * 60 * 140).toISOString(),
    relatedStocks: [],
  },
]

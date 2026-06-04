import { formatStockScore } from '../buzz/buzzSurgeScore'

export type SentimentDeltaTone = 'up' | 'down' | null

export interface SentimentDeltaDisplay {
  text: string
  tone: SentimentDeltaTone
  /** 스크린리더·툴팁용 */
  title?: string
}

/** sentimentDelta24h: 양수=개선, 음수=악화, 0=변화 없음·비교 불가 */
export function formatSentimentDelta24h(delta: number): SentimentDeltaDisplay {
  if (delta === 0) {
    return { text: '0', tone: null }
  }
  const text = formatStockScore(delta)
  return {
    text,
    tone: delta > 0 ? 'up' : 'down',
    title: delta > 0 ? '감성 개선' : '감성 악화',
  }
}

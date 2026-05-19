import type { UTCTimestamp } from 'lightweight-charts'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import { getSentimentTone, type SentimentTone } from './stockSentimentInterpretation'
import { getLineColorForTone } from './stockSentimentChartColors'
import { toChartTime } from './stockSentimentTrendChartData'

export interface SentimentLineSegment {
  tone: SentimentTone
  color: string
  data: Array<{ time: UTCTimestamp; value: number }>
}

/** 구간이 바뀔 때 이전 점을 브릿지해 라인이 끊기지 않게 함 */
export function buildSentimentLineSegments(trend: StockSentimentTrendPoint[]): SentimentLineSegment[] {
  if (trend.length === 0) return []

  const segments: SentimentLineSegment[] = []
  let currentTone = getSentimentTone(trend[0].score)
  let buffer: Array<{ time: UTCTimestamp; value: number }> = []

  const pushSegment = () => {
    if (buffer.length === 0) return
    segments.push({
      tone: currentTone,
      color: getLineColorForTone(currentTone),
      data: buffer,
    })
  }

  for (const point of trend) {
    const tone = getSentimentTone(point.score)
    const item = { time: toChartTime(point.recordedAt), value: point.score }

    if (tone !== currentTone && buffer.length > 0) {
      const bridge = buffer[buffer.length - 1]
      pushSegment()
      buffer = [bridge, item]
      currentTone = tone
    } else {
      buffer.push(item)
      currentTone = tone
    }
  }

  pushSegment()
  return segments
}

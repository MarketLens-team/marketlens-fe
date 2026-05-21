import type { UTCTimestamp } from 'lightweight-charts'
import { toFiniteNumber } from '../../lib/toFiniteNumber'
import type { StockSentimentTrendPoint } from '../../data/types/stock'
import { getSentimentTone, type SentimentTone } from './stockSentimentInterpretation'
import { getLineColorForTone } from './stockSentimentChartColors'
import { toChartTime } from './stockSentimentTrendChartData'
import { STOCK_SENTIMENT_ZONE_BOUNDARIES } from './stockSentimentZones'

export interface SentimentLineSegment {
  tone: SentimentTone
  color: string
  data: Array<{ time: UTCTimestamp; value: number }>
}

interface ChartPoint {
  time: UTCTimestamp
  value: number
}

function appendPoint(
  data: ChartPoint[],
  point: ChartPoint,
) {
  const last = data[data.length - 1]
  if (last && last.time === point.time && last.value === point.value) return
  data.push(point)
}

/** 일별 두 점 사이 직선이 Y축 구간 경계를 지날 때 경계에서 분할 */
function splitEdgeByZoneBoundaries(start: ChartPoint, end: ChartPoint): ChartPoint[] {
  const t0 = start.time as number
  const t1 = end.time as number
  const v0 = start.value
  const v1 = end.value

  const knots: ChartPoint[] = [start]
  const lo = Math.min(v0, v1)
  const hi = Math.max(v0, v1)

  if (v0 !== v1) {
    for (const boundary of STOCK_SENTIMENT_ZONE_BOUNDARIES) {
      if (boundary > lo && boundary < hi) {
        const ratio = (boundary - v0) / (v1 - v0)
        const time = Math.round(t0 + (t1 - t0) * ratio) as UTCTimestamp
        knots.push({ time, value: boundary })
      }
    }
  }

  knots.push(end)
  knots.sort((a, b) => (a.time as number) - (b.time as number))

  const deduped: ChartPoint[] = []
  for (const knot of knots) {
    const last = deduped[deduped.length - 1]
    if (last && (last.time as number) === (knot.time as number)) {
      deduped[deduped.length - 1] = knot
    } else {
      deduped.push(knot)
    }
  }

  return deduped
}

function toneForSubEdge(a: ChartPoint, b: ChartPoint): SentimentTone {
  return getSentimentTone((a.value + b.value) / 2)
}

/**
 * 선 색 = Y축 감성 구간 색.
 * 날짜별 점수 톤이 아니라, 두 일자 사이 직선이 실제로 지나는 구간(±20 등 경계) 기준으로 분할한다.
 */
export function buildSentimentLineSegments(trend: StockSentimentTrendPoint[]): SentimentLineSegment[] {
  if (trend.length === 0) return []

  const chartPoints: ChartPoint[] = trend.map((point) => ({
    time: toChartTime(point.recordedAt),
    value: toFiniteNumber(point.score),
  }))

  if (chartPoints.length === 1) {
    const tone = getSentimentTone(chartPoints[0].value)
    return [
      {
        tone,
        color: getLineColorForTone(tone),
        data: [chartPoints[0]],
      },
    ]
  }

  const segments: SentimentLineSegment[] = []

  for (let i = 0; i < chartPoints.length - 1; i += 1) {
    const edgeKnots = splitEdgeByZoneBoundaries(chartPoints[i], chartPoints[i + 1])

    for (let j = 0; j < edgeKnots.length - 1; j += 1) {
      const from = edgeKnots[j]
      const to = edgeKnots[j + 1]
      const tone = toneForSubEdge(from, to)
      const last = segments[segments.length - 1]

      if (last && last.tone === tone) {
        appendPoint(last.data, to)
      } else {
        segments.push({
          tone,
          color: getLineColorForTone(tone),
          data: [from, to],
        })
      }
    }
  }

  return segments
}

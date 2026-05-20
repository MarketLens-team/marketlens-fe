import type { StockSentimentTrendPoint } from '../types/stock'

function clampScore(score: number): number {
  return Math.min(100, Math.max(-100, Math.round(score)))
}

/**
 * 구간별 목표 점수 — 60일 동안 부정→중립→긍정 스토리 (게이지 5색이 모두 보이도록)
 */
const STORY_WAYPOINTS: Array<{ dayIndex: number; score: number; mention: number }> = [
  { dayIndex: 0, score: -72, mention: 22 },
  { dayIndex: 8, score: -48, mention: 31 },
  { dayIndex: 14, score: -12, mention: 38 },
  { dayIndex: 20, score: 18, mention: 45 },
  { dayIndex: 26, score: 8, mention: 52 },
  { dayIndex: 32, score: 42, mention: 58 },
  { dayIndex: 38, score: 28, mention: 64 },
  { dayIndex: 44, score: 55, mention: 71 },
  { dayIndex: 50, score: 38, mention: 68 },
  { dayIndex: 55, score: 62, mention: 82 },
  { dayIndex: 59, score: 73, mention: 94 },
]

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

function scoreAtDay(dayIndex: number, days: number, current: number): number {
  const lastWaypoint = STORY_WAYPOINTS[STORY_WAYPOINTS.length - 1]
  const effectiveWaypoints =
    lastWaypoint.dayIndex === days - 1
      ? STORY_WAYPOINTS
      : [...STORY_WAYPOINTS.slice(0, -1), { dayIndex: days - 1, score: current, mention: lastWaypoint.mention }]

  if (dayIndex <= effectiveWaypoints[0].dayIndex) {
    return effectiveWaypoints[0].score
  }

  for (let w = 0; w < effectiveWaypoints.length - 1; w++) {
    const a = effectiveWaypoints[w]
    const b = effectiveWaypoints[w + 1]
    if (dayIndex >= a.dayIndex && dayIndex <= b.dayIndex) {
      const span = b.dayIndex - a.dayIndex || 1
      const t = (dayIndex - a.dayIndex) / span
      const base = lerp(a.score, b.score, t)
      const wobble = Math.sin(dayIndex * 0.65) * 6 + Math.cos(dayIndex * 0.38) * 4
      return clampScore(base + wobble)
    }
  }

  return clampScore(current)
}

function mentionAtDay(dayIndex: number, days: number): number {
  const lastWaypoint = STORY_WAYPOINTS[STORY_WAYPOINTS.length - 1]
  const effectiveWaypoints =
    lastWaypoint.dayIndex === days - 1
      ? STORY_WAYPOINTS
      : [...STORY_WAYPOINTS.slice(0, -1), { dayIndex: days - 1, score: 0, mention: lastWaypoint.mention }]

  if (dayIndex <= effectiveWaypoints[0].dayIndex) {
    return effectiveWaypoints[0].mention
  }

  for (let w = 0; w < effectiveWaypoints.length - 1; w++) {
    const a = effectiveWaypoints[w]
    const b = effectiveWaypoints[w + 1]
    if (dayIndex >= a.dayIndex && dayIndex <= b.dayIndex) {
      const span = b.dayIndex - a.dayIndex || 1
      const t = (dayIndex - a.dayIndex) / span
      const base = lerp(a.mention, b.mention, t)
      const noise = Math.round(8 * Math.sin(dayIndex * 0.5 + 1))
      return Math.max(12, Math.round(base + noise))
    }
  }

  return lastWaypoint.mention
}

/** 목업용 30일(기본 60일) 감성·언급량 시계열 */
export function buildStockSentimentTrend(
  current: number,
  avg30d: number,
  days = 60,
): StockSentimentTrendPoint[] {
  void avg30d
  const points: StockSentimentTrendPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - i)

    const dayIndex = days - 1 - i
    const score = dayIndex === days - 1 ? clampScore(current) : scoreAtDay(dayIndex, days, current)
    const mentionCount =
      dayIndex === days - 1
        ? mentionAtDay(dayIndex, days)
        : mentionAtDay(dayIndex, days)

    points.push({
      recordedAt: d.toISOString(),
      score,
      mentionCount,
    })
  }

  return points
}

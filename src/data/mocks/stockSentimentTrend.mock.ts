import type { StockSentimentTrendPoint } from '../types/stock'

function clampScore(score: number): number {
  return Math.min(100, Math.max(-100, Math.round(score)))
}

/** 목업용 30일 감성·언급량 시계열 */
export function buildStockSentimentTrend(
  current: number,
  avg30d: number,
  days = 30,
): StockSentimentTrendPoint[] {
  const points: StockSentimentTrendPoint[] = []

  for (let i = days - 1; i >= 0; i--) {
    const d = new Date()
    d.setHours(12, 0, 0, 0)
    d.setDate(d.getDate() - i)

    const progress = (days - 1 - i) / Math.max(days - 1, 1)
    const wave = Math.sin(i * 0.55) * 14 + Math.cos(i * 0.31) * 8
    const score = clampScore(avg30d + (current - avg30d) * progress + wave)

    const mentionBase = 48 + Math.round(28 * Math.sin(i * 0.4 + 1))
    const mentionBoost = i < 4 ? 55 - i * 10 : 0
    const mentionCount = Math.max(8, mentionBase + mentionBoost)

    points.push({
      recordedAt: d.toISOString(),
      score,
      mentionCount,
    })
  }

  return points
}

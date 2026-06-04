import type { SentimentTone } from './stockSentimentInterpretation'
import { SENTIMENT_GAUGE_COLORS } from '../../lib/sentimentPalette'

/** CMC Fear & Greed 스타일 팔레트 */
export interface StockChartColors {
  bg: string
  elevated: string
  border: string
  textMuted: string
  textSecondary: string
  chartBg: string
  chartText: string
  chartGrid: string
}

export { SENTIMENT_GAUGE_COLORS }

/** 구간별 라인 — 게이지와 동일 색 */
export function getLineColorForTone(tone: SentimentTone): string {
  return SENTIMENT_GAUGE_COLORS[tone]
}

/** 구간 배경 — 극단 구간만 (CMC Fear & Greed 상·하단 밴드) */
export const SENTIMENT_BAND_COLORS: Pick<
  Record<SentimentTone, string>,
  'extremeNegative' | 'extremePositive'
> = {
  extremeNegative: 'rgba(246, 70, 93, 0.12)',
  extremePositive: 'rgba(2, 192, 118, 0.12)',
}

/** 구간 경계 점선 (CMC Fear & Greed) */
export const SENTIMENT_ZONE_LINE_COLOR = 'rgba(148, 163, 184, 0.52)'

/** 언급량 막대 (CMC 거래량 — 회색) */
export const MENTION_HISTOGRAM_COLOR = 'rgba(148, 163, 184, 0.55)'

function readVar(name: string, fallback: string): string {
  if (typeof document === 'undefined') return fallback
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
  return value || fallback
}

export function readStockChartColors(): StockChartColors {
  return {
    bg: readVar('--color-bg-app', '#0a0f16'),
    elevated: readVar('--color-bg-elevated', '#243040'),
    border: readVar('--color-border-strong', '#344757'),
    textMuted: readVar('--color-text-muted', '#7c93a6'),
    textSecondary: readVar('--color-text-secondary', '#b8c2cc'),
    chartBg: '#131722',
    chartText: '#94a3b8',
    chartGrid: 'rgba(148, 163, 184, 0.14)',
  }
}

export function withAlpha(color: string, alpha: number): string {
  const hex = color.trim()
  if (hex.startsWith('#')) {
    const raw = hex.slice(1)
    const full =
      raw.length === 3
        ? raw
            .split('')
            .map((c) => c + c)
            .join('')
        : raw.slice(0, 6)
    const r = Number.parseInt(full.slice(0, 2), 16)
    const g = Number.parseInt(full.slice(2, 4), 16)
    const b = Number.parseInt(full.slice(4, 6), 16)
    return `rgba(${r}, ${g}, ${b}, ${alpha})`
  }
  return color
}

/** Y축 눈금은 HTML 오버레이로 통일 (라이브러리 눈금 비활성) */
export function formatChartAxisPrice(): string {
  return ''
}

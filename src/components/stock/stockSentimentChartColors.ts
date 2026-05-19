import type { SentimentTone } from './stockSentimentInterpretation'

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

/** 구간별 라인 — 대비 강화 */
export const SENTIMENT_LINE_COLORS: Record<SentimentTone, string> = {
  extremePositive: '#22c55e',
  positive: '#a3e635',
  neutral: '#facc15',
  negative: '#fb923c',
  extremeNegative: '#ef4444',
}

/** 5구간 배경 — CMC처럼 뚜렷하게 */
export const SENTIMENT_BAND_COLORS: Record<SentimentTone, string> = {
  extremePositive: 'rgba(13, 148, 68, 0.42)',
  positive: 'rgba(34, 197, 94, 0.2)',
  neutral: 'rgba(234, 179, 8, 0.14)',
  negative: 'rgba(249, 115, 22, 0.2)',
  extremeNegative: 'rgba(220, 38, 38, 0.42)',
}

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

/** Y축 정수 눈금만 표시 */
export function formatChartAxisPrice(price: number): string {
  const rounded = Math.round(price)
  if (Math.abs(price - rounded) > 0.001) return ''
  return String(rounded)
}

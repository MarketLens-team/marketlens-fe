/** ECharts 옵션용 — 런타임 CSS 변수 읽기 */
export interface StockChartColors {
  bg: string
  elevated: string
  border: string
  textMuted: string
  textSecondary: string
  warning: string
  success: string
  danger: string
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
    warning: readVar('--color-warning', '#f0b429'),
    success: readVar('--color-success', '#02c076'),
    danger: readVar('--color-danger', '#f6465d'),
  }
}

/** hex/rgb에 alpha 적용 (ECharts markArea용) */
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

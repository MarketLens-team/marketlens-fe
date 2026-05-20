export function formatStockScore(score: number): string {
  if (score === 0) return '0'
  return score > 0 ? `+${score}` : String(score)
}

export function formatPercent(value: number, signed = true): string {
  const prefix = signed && value > 0 ? '+' : ''
  return `${prefix}${value}%`
}

export function formatPrice(value: number): string {
  return value.toLocaleString('ko-KR')
}

/**
 * 종목 코드 비교용 정규화 (URL·링크에 `5930`처럼 들어와도 `005930`과 매칭).
 * 숫자만 있고 1~6자리면 KRX식 6자리 zero-pad.
 */
export function normalizeStockCodeForMatch(code: string): string {
  const trimmed = code.trim()
  if (/^\d+$/.test(trimmed) && trimmed.length > 0 && trimmed.length <= 6) {
    return trimmed.padStart(6, '0')
  }
  return trimmed.toUpperCase()
}

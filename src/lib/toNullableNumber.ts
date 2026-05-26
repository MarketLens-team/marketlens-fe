/** API null·undefined·비숫자 → null. 0은 유효한 값으로 유지 */
export function toNullableNumber(value: unknown): number | null {
  if (value === null || value === undefined || value === '') return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

/** 인물 트래커·상세 — 검색 등에서 발언 포커스용 쿼리 */
export function buildPersonDetailPath(
  personId: string | number,
  focus?: { statementId?: string },
): string {
  const path = `/person/${personId}`
  if (!focus?.statementId) return path
  return `${path}?statementId=${encodeURIComponent(focus.statementId)}`
}

export function buildPersonTrackerPath(focus?: { statementId?: string }): string {
  if (!focus?.statementId) return '/person'
  return `/person?statementId=${encodeURIComponent(focus.statementId)}`
}

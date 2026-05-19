/**
 * 뉴스 커서 쿼리 인코딩 (`2026-05-19T09:20:00Z|7262` → `...%7C7262`).
 * Tomcat 등은 쿼리/경로에 raw `|`(0x7C)가 있으면 요청을 거부할 수 있습니다.
 */
export function encodeNewsCursor(cursor: string): string {
  return encodeURIComponent(cursor)
}

/** `URLSearchParams`용 — 값은 raw 커서, 직렬화 시 자동 인코딩 */
export function appendNewsCursorParam(params: URLSearchParams, cursor: string): void {
  params.set('cursor', cursor)
}

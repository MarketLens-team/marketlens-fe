/**
 * 데이터 소스 전환: 목은 픽스처만 사용하고, 실서버는 동일 타입으로 HTTP 응답을 매핑합니다.
 *
 * - VITE_USE_MOCK_DATA=true  → 항상 목
 * - VITE_USE_MOCK_DATA=false → 항상 API (axios `api` 인스턴스)
 * - 미설정 → 개발(dev)에서는 목, 프로덕션 빌드에서는 API
 *
 * 백엔드 준비 후: `.env`에 `VITE_USE_MOCK_DATA=false` 만 두면 페이지/훅 코드는 그대로 둡니다.
 */
export function isMockDataSource(): boolean {
  const raw = import.meta.env.VITE_USE_MOCK_DATA
  if (raw === 'true') return true
  if (raw === 'false') return false
  return import.meta.env.DEV
}

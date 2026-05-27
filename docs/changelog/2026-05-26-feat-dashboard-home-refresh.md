# Change Log — 2026-05-26 · feat/dashboard-home-refresh

홈(`/`) 대시보드 카드 UI 정리 및 비로그인 시 개인화 영역(포트폴리오·워치리스트) 로그인 유도.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| FE 커밋 | `b3e6bd8` · `85dd069` · `7e0ac37` |

## 요약

- **레이아웃** 상단 `PageHeader`(홈 제목·설명) 제거 — 카드 그리드만 표시
- **카드** 헤더 chevron(›) 제거 · 외곽 `border-radius: var(--radius-lg)` (종목 랭킹 카드와 동일)
- **비로그인** `내 포트폴리오 감성` · `내 관심 종목 워치리스트` — 빈 게이지/테이블 대신 안내 문구 + **로그인** 버튼 → `AuthLoginModal`
- **로그인 후** 기존 게이지·워치리스트 표시, 관심 종목 없으면 기존 empty 문구 유지
- **워치리스트** 카드 부제목 `현재가 · 감성 · 언급량` 제거

## Changed (커밋별)

| 커밋 | 내용 |
|------|------|
| `b3e6bd8` | 카드 chevron 제거, `radius-lg`, `PageHeader` 제거, 스켈레톤 카드 radius |
| `85dd069` | `DashboardLoginPrompt` · `useAuthStore` 기반 포트폴리오·워치리스트 분기 |
| `7e0ac37` | 워치리스트 `CardSectionHeader` subtitle 제거 · changelog |

## UI 컴포넌트

| 파일 | 내용 |
|------|------|
| `DashboardLoginPrompt.tsx` | `EmptyState` + `PillButton` → `useAuthModalStore.open('login')` |
| `PortfolioSentimentGauge.tsx` | 비로그인 시 게이지 대신 로그인 프롬프트 (`compact`) |
| `DashboardWatchlistTable.tsx` | 비로그인 시 테이블 대신 로그인 프롬프트 |
| `DashboardPage.tsx` | `PageHeader` 제거 |
| `*/*.module.css` (dashboard 카드 5종) | `.card { border-radius: var(--radius-lg) }` |

## Notes

- 공개 데이터(언급량 TOP 3, KOSPI, 섹터 히트맵)는 비로그인에서도 그대로 노출.
- mock 모드에서도 `authStore.isLoggedIn` 기준으로 분기 — 로그아웃 상태에서 홈 확인 권장.
- 스냅샷: 홈 Before/After 재촬영 시 `docs/snapshots/2026-05-26/` 추가 권장.

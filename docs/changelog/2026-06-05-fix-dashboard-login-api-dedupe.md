# Change Log — 2026-06-05 · fix · 홈 대시보드 로그인 API 중복·비로그인 watchlist

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/dedupe-dashboard-login-api` |
| 커밋 | (커밋 후 갱신) |

## 요약

홈 진입·로그인 직후 `overview`/`briefing`/`watchlist`가 StrictMode·중복 경로로 2~3회 나가던 문제를 client dedupe로 1회로 합쳤다. 비로그인 상태에서 회원 전용 `GET /watchlist`를 호출해 403이 나던 호출도 제거했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `fetchDashboardOverview` | 마운트마다 독립 HTTP, watchlist 항상 시도 | `dedupeAsync` 5s TTL, 로그인 시에만 watchlist |
| `fetchDashboardBriefing` | StrictMode 2회 | dedupe 1회 |
| `fetchWatchlist` / dashboard | dashboard가 `api.get` 직접 호출 | `fetchWatchlistResponses` 단일 진입 |
| 비로그인 홈 Network | `watchlist` 403 | `watchlist` 요청 없음 (`rankings`만) |
| 로그인 직후 Network | overview·briefing·watchlist 2~3회 | 각 1회 |

## 파일

- `src/lib/dedupeAsync.ts` (신규)
- `src/data/clients/dashboardClient.ts`
- `src/data/clients/watchlistClient.ts`

## 확인

- [ ] 비로그인 `localhost:5173` — `overview`·`rankings`·`prices`만, `watchlist` 0
- [ ] 로그인 직후 — `overview`·`briefing`·`watchlist`·`batch` 각 1회
- [ ] `npm run lint:js` · `npm run build` 통과

## 제외 (후속)

- `prices` TickerBar·대시보드 중복 — 별도 PR
- `useAsyncData` token refresh 연쇄 refetch — 별도 PR

# Change Log — 2026-06-05 · fix · watchlist 전역 스토어·마이페이지 중복 제거

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/globalize-watchlist-store` |
| 커밋 | (커밋 후 갱신) |

## 요약

`useServerWatchlist` 인스턴스마다 독립 `GET /watchlist`가 나가던 문제를 Zustand `watchlistStore`로 합쳤다. 마이페이지 `fetchMyPage`가 별도 `api.get`으로 중복 호출하던 경로도 스토어 캐시·`fetchWatchlistResponses` dedupe로 통일했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| `useServerWatchlist` | 훅 마운트마다 local state + fetch | `watchlistStore` 단일 상태 |
| 로그인 시 watchlist | 컴포넌트 수만큼 fetch 시도 | `isLoggedIn` 전환 시 스토어 1회 reload |
| 마이페이지 `fetchMyPage` | `api.get('/watchlist')` 직접 호출 | 스토어 `loaded` 시 캐시 재사용, 없으면 dedupe 경로 |
| 홈 → 마이페이지 Network | `watchlist` 2회 가능 | 스토어 캐시 hit 시 마이페이지 `watchlist` 0회 |

## 파일

- `src/store/watchlistStore.ts` (신규)
- `src/hooks/useServerWatchlist.ts`
- `src/data/clients/myPageClient.ts`
- `src/data/clients/watchlistClient.ts`
- `src/pages/MyPage.tsx`

## 확인

- [ ] 로그인 → 홈 → 마이페이지 — `watchlist` 추가 호출 없음
- [ ] 검색 모달·종목 테이블 ★ 토글 시 다른 UI 동기화
- [ ] 마이페이지 관심종목 삭제 후 목록·스토어 일치
- [ ] `npm run lint:js` · `npm run build` 통과

## 제외 (후속)

- `useNewsBookmarks` 전역화 — 별도 PR
- 마이페이지 북마크 lazy fetch — 별도 PR

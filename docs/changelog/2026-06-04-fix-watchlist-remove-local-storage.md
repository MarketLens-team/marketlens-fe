# Change Log — 2026-06-04 · fix · 로컬 watchlist 저장 제거·서버 API 통일

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | 상단 관심목록 메뉴 · `/watchlist` |

## 요약

사용하지 않던 `localStorage`(`marketlens_watchlist`) 기반 `watchlistStore`를 제거하고, 상단 메뉴·관심목록 페이지를 서버 `/api/v1/watchlist`와 동일한 `useServerWatchlist` 훅으로 통일했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 관심목록 저장 | `watchlistStore` + `localStorage` | 서버 API만 |
| `TopNavWatchlistMenu` | 로컬 store | `useServerWatchlist` |
| `WatchlistPage` | 로컬 store | `useServerWatchlist` |
| 회원가입 완료 | 서버 sync + 로컬 store 중복 저장 | 서버 sync만 (`completeRegistration`) |
| `WatchlistItem` 타입 | `store/watchlistStore` | `data/types/watchlist` |

## 파일

- 삭제: `src/store/watchlistStore.ts`
- 추가: `src/data/types/watchlist.ts`
- `src/hooks/useServerWatchlist.ts` — `items` · `remove` · legacy localStorage 정리
- `src/components/common/TopNavWatchlistMenu.tsx`
- `src/pages/WatchlistPage.tsx`
- `src/hooks/useAuthFlow.ts`
- `src/constants/storage.ts` — `WATCHLIST_KEY` 제거

## 확인

- DevTools Application → `marketlens_watchlist` 키 없음(새로고침 시 legacy 키 자동 삭제)
- 검색·종목 목록에서 ★ 추가 → 상단 관심목록·`/watchlist`에 서버 데이터 반영
- 회원가입 watchlist 선택 → 서버에만 저장

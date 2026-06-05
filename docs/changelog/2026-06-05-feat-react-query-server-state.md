# Change Log — 2026-06-05 · feat · React Query 서버 상태 1단계

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/react-query` |
| DDR | [DDR-0004](../ddr/0004-react-query-server-state.md) |

## 요약

관심종목·뉴스 북마크 ID를 Zustand 스토어에서 TanStack React Query로 이전했다. `useAsyncData`는 StrictMode 이중 mount 시 `dedupeAsync`로 근접 fetch를 병합한다. 동일 `queryKey`로 캐시·in-flight를 공유하고, 로그아웃 시에만 서버 쿼리 캐시를 제거한다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 관심종목 서버 상태 | `watchlistStore` | `useQuery(['watchlist','rows'])` + optimistic `setQueryData` |
| 북마크 ID 서버 상태 | `newsBookmarkStore` | `useQuery(['bookmarks','ids'])` + optimistic `setQueryData` |
| 마이페이지 캐시 hit | 스토어 `loaded` 플래그 | `queryClient.getQueryData` |
| 앱 루트 | — | `QueryClientProvider` (`RootLayout`) |
| Zustand | 인증 + 서버 목록 | 인증·UI만 (auth, modal, preferences) |
| `useAsyncData` | effect마다 독립 fetch (StrictMode 2회) | `useId` + `dedupeAsync` 5s TTL 병합 |
| RQ 로그인 동기화 | `invalidateQueries` + enabled fetch 겹침 | 로그아웃 `removeQueries`만 |
| RQ member list 쿼리 | 기본 `refetchOnMount` | `refetchOnMount: false`, `retry: false` |

## 파일

- `docs/ddr/0004-react-query-server-state.md` (신규)
- `package.json` · `package-lock.json` — `@tanstack/react-query`
- `src/lib/queryClient.ts` · `src/lib/queryKeys.ts` · `src/lib/queryCache.ts` (신규)
- `src/components/common/RootLayout.tsx`
- `src/hooks/useServerWatchlist.ts` · `src/hooks/useNewsBookmarks.ts` · `src/hooks/useAsyncData.ts`
- `src/data/clients/myPageClient.ts`
- `src/pages/MyPage.tsx`
- 삭제: `src/store/watchlistStore.ts` · `src/store/newsBookmarkStore.ts`

## 확인

- [ ] 로그인 → 홈·종목·뉴스 — `watchlist`·`bookmarks/ids` 각 1회 이하
- [ ] ★·북마크 토글 시 다른 화면 동기화
- [ ] 마이페이지 삭제 후 캐시·목록 일치
- [ ] 로그아웃 후 서버 쿼리 캐시 제거
- [ ] dev StrictMode — `fetchMyPage`·`bookmarks` 등 `useAsyncData` 화면에서 동일 API 1회
- [ ] `npm run typecheck` · `npm run build` 통과

## 제외 (후속)

- `useAsyncData` 훅 점진적 `useQuery` 이전
- `useTodayNewsStocks`·`useNewsFeedPage` 등 수동 `useEffect` fetch
- `dedupeAsync`·`stockPricesCache` RQ 흡수 검토

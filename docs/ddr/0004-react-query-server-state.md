# DDR-0004: 서버 상태 — Zustand 스토어·useAsyncData → TanStack React Query

## 상태
진행 중

## 날짜
2026-06-05

## Related PR
- `feat/react-query` 브랜치

## 맥락

- API 중복 호출 완화(1~8번)로 `dedupeAsync`, `watchlistStore`, `newsBookmarkStore`, `useAsyncData` 등 **패턴별 응급처치**가 늘어남
- `useAsyncData` 훅이 ~20곳에서 각각 loading/refetch 규칙을 따로 관리
- Zustand는 인증·UI 상태용인데, watchlist·bookmark ID처럼 **서버에서 온 목록**도 스토어로 들어가 경계가 흐려짐
- 로그인 전환·StrictMode·다중 마운트 시 dedupe·`loaded` 플래그를 훅/스토어마다 반복 구현

## 결정

**TanStack React Query v5**를 서버 상태 레이어로 도입한다.

| 계층 | 담당 |
|------|------|
| React Query | API 목록·상세·가격 등 **서버 캐시** (`queryKey`, `staleTime`, `enabled`, mutation `invalidate`) |
| Zustand | `authStore`, `authModalStore`, `userPreferencesStore` 등 **클라이언트 UI·세션** |
| axios `api` | HTTP·토큰 인터셉터 (기존 유지) |

### 1단계 (본 브랜치)

- `QueryClientProvider`를 `RootLayout`에 추가
- `queryKeys` · `queryClient` 기본 옵션 (`refetchOnWindowFocus: false`, `retry: 1`)
- 로그아웃 시 `removeQueries`, 로그인 시 `invalidateQueries` (`syncAuthQueries`)
- **`watchlistStore` 제거** → `useServerWatchlist`가 `useQuery` + mutation
- **`newsBookmarkStore` 제거** → `useNewsBookmarks`가 `useQuery` + mutation
- `myPageClient` 캐시 hit은 `queryClient.getQueryData`로 유지

### 후속 (별 PR)

- `useAsyncData` 훅을 화면 단위로 `useQuery` 이전 (dashboard, stock, news, person…)
- `stockPricesCache` · `dedupeAsync`를 `staleTime`·queryKey로 흡수 검토
- DevTools·queryKey 네이밍 표 문서화

## 근거

### 변경 전 (1~8번 이후)

- 관심종목: `watchlistStore` + `fetchWatchlistResponses` dedupe
- 북마크 ID: `newsBookmarkStore` + `fetchBookmarkIds` dedupe
- 나머지 데이터: `useAsyncData` + `isLoggedIn` 의존

### 변경 후 (1단계)

```ts
useQuery({ queryKey: queryKeys.watchlist.rows, queryFn: fetchWatchlistResponses, enabled: isLoggedIn })
useQuery({ queryKey: queryKeys.bookmarks.ids, queryFn: fetchBookmarkIds, enabled: isLoggedIn })
```

동일 `queryKey`를 쓰는 모든 컴포넌트가 **캐시·in-flight를 공유**한다.

## 결과

- 서버 목록 상태의 단일 진입점 확보 (스토어 module side-effect 제거)
- 마이페이지 `getCachedWatchlistResponses` 등 기존 캐시 재사용 패턴 유지
- 이후 `useAsyncData` 마이그레이션 시 동일 `queryClient`·`queryKeys` 규칙 확장

## queryKey 초안

| key | 용도 | staleTime |
|-----|------|-----------|
| `['watchlist','rows']` | `GET /watchlist` | 5s |
| `['bookmarks','ids']` | `GET /bookmarks/ids` | 5s |

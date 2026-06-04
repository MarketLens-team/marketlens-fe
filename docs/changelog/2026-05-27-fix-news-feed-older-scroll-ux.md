# Change Log — 2026-05-27 · fix/news-feed-older-scroll-ux

전체 뉴스 anchored 피드 — 하단 `older` 연속 API 호출 및 종목 상세 대비 어색한 로딩 UX 수정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 커밋 | `c6cd72f` · `661c50c` |
| 관련 | [2026-05-27-fix-news-feed-newer-scroll-ux.md](./2026-05-27-fix-news-feed-newer-scroll-ux.md) · [2026-05-26-fix-stock-news-pagination.md](./2026-05-26-fix-stock-news-pagination.md) |

## 증상

- `/news?newsId=…` anchored 모드에서 **하단 `older` 요청이 멈추지 않고 연속** 발생 (Network 탭에 `older?limit=20&cursor=…` 반복).
- 종목 상세 뉴스 피드는 같은 anchored 흐름인데 **한 페이지씩 자연스럽게** 붙음.

## 원인 (종목 상세와 비교)

| | 종목 `StockDetailContent` | 전체 `NewsFeedPage` (수정 전) |
|---|---|---|
| `loadOlder` 중복 방지 | `loadMoreNews`에서 `if (loadingOlderNews) return` | 없음 |
| 하단 센티넬 `enabled` | `items.length > 0 && feedReady` | `!loading && …` → 로딩마다 센티넬 on/off |
| 하단 로더 DOM | `ul` 밖 `newsScrollFoot` | `ul` 안쪽 `scrollFoot` |
| `useInfiniteScroll` | `disablePostLoadRetry` (anchored) | 동일했으나 `loading` 변경 시 **IO 재구독**으로 즉시 재트리거 |

`requireUserScrollDown` 추가는 종목에 없던 동작이라 **제거**하고, 종목과 같은 패턴으로 맞춤.

## 수정

| 파일 | 내용 |
|------|------|
| `useInfiniteScroll.ts` | `tryLoadMore`·IO 콜백을 **ref**로 고정 — `loading` 토글만으로 observer 재연결·연속 `older` 방지. |
| `useNewsFeedPage.ts` | anchored `loadMore`에 `if (loadingOlder) return` · `loadNewerWithError`. |
| `NewsFeedPage.tsx` | 하단 센티넬 `enabled`를 종목과 동일 (`feedReady`만) · `feedWrap` + `scrollFoot`를 `ul` 밖으로. |
| `NewsFeedPage.module.css` | `feedWrap` `contain` · `scrollFoot` `min-height`·`overflow-anchor: none`. |
| `StockDetailContent.tsx` · `PersonDetailPage.tsx` | 잘못 넣었던 `requireUserScrollDown` 제거. |

## Notes

- anchored `older`는 종목과 같이 **IntersectionObserver + prefetch margin**만 사용 (`requireUserScrollDown` 없음).
- `disablePostLoadRetry: true`는 anchored 공통 유지.

## 확인

- [ ] `/news?newsId=…` — 아래로 스크롤 시 `older` 한 번씩만 호출·`뉴스 더 불러오는 중` 표시
- [ ] 종목 상세 `?newsId=…` — 기존과 동일하게 동작
- [ ] Network — 응답 대기 중 `older` 폭주 없음

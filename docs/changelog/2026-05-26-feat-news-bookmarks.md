# Change Log — 2026-05-26 · feat/news-bookmarks

뉴스 즐겨찾기(북마크) API 연동. 전체 뉴스 피드에서 저장·해제, 마이페이지에서 저장 목록 조회.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |
| BE API | `GET/POST/DELETE /api/v1/bookmarks` · OpenAPI `Bookmark` 태그 |
| 인증 | 북마크 API Bearer 필수 · 비로그인 토글 시 로그인 모달 |

## 요약

- **전체 뉴스** (`/news`, `mode=all`) — ☆ 토글 · 저장 시 `contextType=ALL_NEWS`
- **종목 상세 뉴스** — ☆ 토글 · 저장 시 `contextType=STOCK` + `contextStockCode`
- **비로그인** — ☆ 클릭 시 로그인 모달
- **마이페이지** — 저장 맥락 라벨(전체/종목명) · 클릭 시 맥락별 anchored 이동
- **피드 응답** — `bookmarked` 필드 없음 → `GET /bookmarks` ID Set + POST 쿼리 컨텍스트

## Added

| 파일 | 내용 |
|------|------|
| `data/types/bookmark.ts` | `NewsBookmarkDto` |
| `data/clients/bookmarkClient.ts` | `fetchNewsBookmarks` · `addNewsBookmark` · `removeNewsBookmark` |
| `data/mappers/bookmarkMapper.ts` | DTO → `MyPageBookmarkItem` |
| `hooks/useNewsBookmarks.ts` | Set 상태 · 낙관적 토글 · `B001`/`B002` 동기화 |
| `components/news/NewsBookmarkButton.tsx` | ☆/★ 버튼 |
| `components/mypage/MyPageBookmarkList.tsx` | 마이페이지 저장 목록 |
| `lib/buildNewsFeedRoute.ts` | `buildNewsFeedPath({ newsId })` → `/news?newsId=` |
| `lib/bookmarkNavigation.ts` | 맥락 라벨 · `buildBookmarkItemPath` (ALL_NEWS→`/news`, STOCK→`/stock/:code?newsId=`) |

## Changed

| 파일 | 내용 |
|------|------|
| `components/news/AllNewsListItem.tsx` | 북마크 props · 행 전체 `<a>` 제거(버튼·`<a>` 중첩 방지) · 제목·썸네일만 원문 링크 |
| `pages/NewsFeedPage.tsx` | `useNewsBookmarks` 연동 · `?newsId=` 시 탭 `all` 고정(`resolveInitialNewsFeedMode`) |
| `components/mypage/MyPageBookmarkList.tsx` | 맥락 라벨 · 맥락별 내부 이동 |
| `components/stock/StockNewsListItem.tsx` | 북마크 버튼 · 행 `<a>` 중첩 제거 |
| `components/stock/StockDetailContent.tsx` | 종목 뉴스 탭 `STOCK` 컨텍스트 토글 |
| `data/clients/bookmarkClient.ts` | POST `contextType` · `contextStockCode` 쿼리 |
| `hooks/useNewsBookmarks.ts` | `toggleBookmark(id, context)` |
| `pages/MyPage.tsx` | 저장한 뉴스 섹션 · 해제 후 목록 갱신 |
| `data/types/myPage.ts` | `MyPageBookmarkItem` |
| `data/constants/errorCodes.ts` | `B001` · `B002` |

## 저장 컨텍스트 (BE)

| 저장 위치 | `contextType` | `contextStockCode` |
|-----------|---------------|-------------------|
| 전체 뉴스 피드 | `ALL_NEWS` | `null` |
| 종목 상세 뉴스 탭 | `STOCK` | 종목 코드 |

`PERSON` 등은 미도입(과설계 방지).

## API 매핑

| API 필드 | UI |
|----------|-----|
| `newsArticleId` | 피드 `item.id` (string) |
| `contextType` · `contextStockCode` · `contextStockName` | 마이페이지 라벨·이동 경로 |
| `publisherName` | `source` |
| `originalLink` | (미사용 — 피드/종목 anchored 이동) |
| `sentimentLabel` | `sentiment` |

## 확인

- [ ] 로그인 — `/news` 전체 탭에서 ☆ → ★ · 재클릭 해제
- [ ] 비로그인 — ☆ 클릭 → 로그인 모달
- [ ] `/news` · `/stock/:code` — ☆ 저장 시 각각 ALL_NEWS / STOCK 쿼리
- [ ] `/mypage` — 「전체 뉴스에서 저장」/「{종목명} 뉴스에서 저장」 · 클릭 시 맥락별 anchored
- [ ] `B001` 중복 추가 · `B002` 없는 삭제 시 UI Set 정합

## Notes

- 관심종목 뉴스 탭에는 미적용.
- 활성 북마크 색: `--color-warning`(노란 ★).
- mock: `bookmarkClient` 목록 빈 배열 · 토글은 메모리 Set.

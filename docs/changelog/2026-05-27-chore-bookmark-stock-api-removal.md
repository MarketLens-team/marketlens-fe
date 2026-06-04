# Change Log — 2026-05-27 · chore: 종목별 북마크 API 코드 제거

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-27 |

## 요약

종목별 탭 제거에 따라 프론트에서 `GET /api/v1/bookmarks/stocks` 관련 코드를 전부 삭제.
목록 필터용 `contextType` · `contextStockCode` 쿼리 파라미터도 함께 제거.

## Removed

| 파일 | 내용 |
|------|------|
| `data/types/bookmark.ts` | `BookmarkStockSummaryDto` 인터페이스 · `NewsBookmarkListQuery`에서 `contextType` · `contextStockCode` 필터 필드 |
| `data/types/myPage.ts` | `MyPageBookmarkStockSummary` · `MyPageBookmarkView` 타입 |
| `data/clients/bookmarkClient.ts` | `fetchBookmarkStockSummaries()` · `BOOKMARK_STOCKS_PATH` · mock 내 contextType/contextStockCode 필터 로직 |
| `data/mappers/bookmarkMapper.ts` | `mapBookmarkStockSummaryDto()` · `mapBookmarkStockSummaryList()` |

## 주의

- `contextStockCode` / `contextStockName` 은 **응답 필드**(`NewsBookmarkDto`)에는 그대로 유지 — 각 기사의 맥락 표시용
- `buildAddBookmarkQuery` 의 `contextType` · `contextStockCode` 는 북마크 **추가** 시 필요하므로 유지

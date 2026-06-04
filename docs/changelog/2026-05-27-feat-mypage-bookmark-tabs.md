# Change Log — 2026-05-27 · feat/mypage-bookmark-tabs

마이페이지 「저장한 뉴스」를 BE 북마크 API 확장(정렬·필터·종목 집계)에 맞춰 **날짜별 / 종목별** 탭으로 연동.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-27 |
| BE API | `GET /api/v1/bookmarks` (필터·`publishedAt` desc) · `GET /api/v1/bookmarks/stocks` |
| OpenAPI | `openapi.json`에 `/bookmarks/stocks`·목록 쿼리 파라미터 **미반영** (후속 동기화 필요) |

## 요약

- **날짜별 탭** — `GET /api/v1/bookmarks` (서버 정렬: `publishedAt` desc, 동률 시 `bookmarkedAt` desc)
- **종목별 탭** — 상단 `GET /api/v1/bookmarks/stocks` (종목 칩 + 저장 건수)
- **종목 선택 후** — `GET /api/v1/bookmarks?contextStockCode={code}` (`contextStockCode`만으로 STOCK 필터)
- 피드 ☆ 토글(`useNewsBookmarks`)은 기존처럼 필터 없이 전체 ID Set 조회

## Added

| 파일 | 내용 |
|------|------|
| `hooks/useMyPageBookmarks.ts` | 탭·종목 선택·3-way 데이터 로드·로딩/refresh 상태 |
| `components/mypage/MyPageBookmarkSection.tsx` | `UnderlineTabNav` · 종목 칩 · 목록 |
| `components/mypage/MyPageBookmarkSection.module.css` | 탭·칩·목록 스타일 |
| `data/types/bookmark.ts` | `NewsBookmarkListQuery` · `BookmarkStockSummaryDto` |

## Changed

| 파일 | 내용 |
|------|------|
| `data/clients/bookmarkClient.ts` | `fetchNewsBookmarks(query?)` · `fetchBookmarkStockSummaries()` |
| `data/mappers/bookmarkMapper.ts` | 종목 집계 DTO 매핑 |
| `data/types/myPage.ts` | `MyPageBookmarkView` · `MyPageBookmarkStockSummary` |
| `pages/MyPage.tsx` | `useMyPageBookmarks` 연동 |

## Removed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkList.tsx` | `MyPageBookmarkSection`으로 대체 |
| `components/mypage/MyPageBookmarkList.module.css` | 동일 |

## API ↔ UI

| 화면 | API |
|------|-----|
| 날짜별 목록 | `GET /api/v1/bookmarks` |
| 종목별 칩 | `GET /api/v1/bookmarks/stocks` → `stockCode`, `stockName`, `bookmarkCount` |
| 종목별 목록 | `GET /api/v1/bookmarks?contextStockCode={code}` |

## 확인

- [ ] `/mypage` — 날짜별: 전체 저장 뉴스가 게시일 최신순
- [ ] `/mypage` — 종목별: STOCK 맥락 저장 종목만 칩에 표시
- [ ] 종목 칩 클릭 시 해당 종목 북마크만 목록
- [ ] 해제 후 날짜/종목/집계 목록 갱신
- [ ] mock 데이터 소스에서 필터·집계 동작

## 후속 (고칠 것 많음)

- [ ] `openapi.json` Bookmark 경로·스키마 동기화 (`/bookmarks/stocks`, 목록 query)
- [ ] 종목 칩 UI/UX (로고, 정렬, 빈 상태 카피)
- [ ] 날짜별 탭에서 `ALL_NEWS`만 보여줄지 vs 전체 — BE/기획 확인
- [ ] 종목별 탭 전환·칩 선택 시 스크롤/포커스
- [ ] 디자인 시안(Figma) 대비 간격·타이포 정리
- [ ] `2026-05-26-feat-news-bookmarks.md` 내 `MyPageBookmarkList` 참조 갱신

## Notes

- 1차 구현: API 연동 + 탭·칩 골격. 디테일·폴리시는 후속 PR 예정.

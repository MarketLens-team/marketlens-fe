# Change Log — 2026-05-27 · feat: 북마크 정렬·페이지네이션 API 연동

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-27 |
| BE API | `GET /api/v1/bookmarks?page=1&size=10&sortOrder=LATEST\|OLDEST` |
| OpenAPI | `openapi.json` `NewsBookmarkPageResponse` 스키마 반영 완료 |

## 요약

BE staged 변경(`NewsBookmarkPageResponse` 도입, `page/size/sortOrder` 파라미터 추가)에 맞춰 프론트 전체 연동.
날짜별·종목별 탭 모두 정렬 토글과 페이지네이션 UI 추가.

## Added

| 파일 | 내용 |
|------|------|
| `data/types/bookmark.ts` | `BookmarkSortOrder` · `NewsBookmarkPageDto` · `NewsBookmarkListQuery`에 `page/size/sortOrder` · `NewsBookmarkDto`에 `contextLabel` |
| `data/types/myPage.ts` | `MyPageBookmarkItem`에 `contextLabel` · `MyPageBookmarkPage` 타입 |
| `data/mappers/bookmarkMapper.ts` | `mapNewsBookmarkPage()` 추가 |

## Changed

| 파일 | 내용 |
|------|------|
| `data/clients/bookmarkClient.ts` | `fetchNewsBookmarks` 반환 `List → PageDto` · 쿼리 빌더에 신규 파라미터 · API 1-based 변환 (`page + 1`) |
| `data/mappers/bookmarkMapper.ts` | `mapNewsBookmarkDto`에 `contextLabel` 매핑 |
| `hooks/useMyPageBookmarks.ts` | `sortOrder`·`page` 상태 추가 · view/sort/stock/refreshKey 변경 시 페이지 리셋 · `changeSortOrder`·`goToPage` 반환 |
| `components/mypage/MyPageBookmarkSection.tsx` | 최신순/오래된순 토글 버튼 · 이전/다음 페이지 컨트롤 추가 |
| `components/mypage/MyPageBookmarkSection.module.css` | `.sortBar` · `.sortBtn` · `.sortBtnActive` · `.pagination` · `.pageBtn` · `.pageInfo` 추가 |
| `pages/MyPage.tsx` | 신규 props 구조분해 및 컴포넌트 전달 |

## 주의

- 내부 페이지 상태는 **0-based**, API 전송 시 `+1`로 변환 (BE 1-based 요구)
- mock 데이터 소스도 동일 page-based 슬라이스 적용
- 종목별 탭도 정렬·페이지네이션 동일하게 적용

## 후속 (달력 기능 기획 중)

- 날짜별 탭: 달력 UI + 날짜 클릭 → 모달 (별도 이슈 확정 후 진행)
- BE `GET /api/v1/bookmarks/dates` (날짜별 count + context 집계) 스펙 협의 필요

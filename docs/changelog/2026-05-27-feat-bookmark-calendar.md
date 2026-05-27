# Change Log — 2026-05-27 · feat: 북마크 달력 날짜별 보기

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-27 |
| BE API | `GET /api/v1/bookmarks/dates` — 날짜별 context 집계 |
| BE API | `GET /api/v1/bookmarks?publishedDate=YYYY-MM-DD` — 날짜 필터 |
| OpenAPI | `BookmarkDateSummaryDto` · `BookmarkDateContextSummaryDto` 스키마 반영 |

## 요약

마이페이지 저장 뉴스 탭에 날짜별 보기 기능 추가.
정렬 바 우측 날짜 버튼 클릭 → 달력 피커 모달 → 날짜 선택 → 해당 날짜 기사 상세 모달.
종목별 탭은 제거하고 달력 + 페이지네이션 목록으로 단일 피드 구조로 통합.

## Added

| 파일 | 내용 |
|------|------|
| `components/mypage/BookmarkCalendar.tsx` | 월간 달력 그리드 · 북마크 있는 날 점 표시 · hover 툴팁(context별 종목·건수) · 날짜 클릭 핸들러 |
| `components/mypage/BookmarkCalendar.module.css` | 달력 스타일 전체 (토큰 전용) |
| `data/types/bookmark.ts` | `BookmarkDateContextSummaryDto` · `BookmarkDateSummaryDto` |
| `data/types/myPage.ts` | `MyPageBookmarkDateContext` · `MyPageBookmarkDateSummary` |
| `data/clients/bookmarkClient.ts` | `fetchBookmarkDateSummaries()` — `GET /api/v1/bookmarks/dates` |
| `data/mappers/bookmarkMapper.ts` | `mapBookmarkDateSummaryList()` |

## Changed

| 파일 | 내용 |
|------|------|
| `hooks/useMyPageBookmarks.ts` | `dateSummariesFactory` · `modalDateFactory` 추가 · `modalDate` 상태 · `openDateModal`/`closeDateModal` 반환 · refreshKey 변경 시 모달 닫기 |
| `components/mypage/MyPageBookmarkSection.tsx` | 정렬 바 우측에 날짜 버튼(`CalendarIcon` + 오늘 날짜) · 달력 피커 모달 · 날짜 상세 모달 · 종목별 탭 제거 |
| `components/mypage/MyPageBookmarkSection.module.css` | `.calendarBtn` · `.calendarModalContent` 추가 |
| `pages/MyPage.tsx` | `dateSummaries`·`dateSummariesLoading`·`modalDate`·`modalItems`·`modalLoading`·`openDateModal`·`closeDateModal` 구조분해 및 전달 |

## 흐름

```
[최신순] [오래된순]          [📅 5월 27일]
                                  ↓ 클릭
                         달력 피커 모달 (BookmarkCalendar)
                                  ↓ 날짜 클릭
                         날짜 상세 모달 (해당 날짜 기사 목록)
```

## 주의

- 날짜 기준은 **publishedAt** (기사 발행일), bookmarkedAt 아님
- `publishedDate` 쿼리 파라미터로 필터: `GET /api/v1/bookmarks?publishedDate=2026-05-27`
- 달력 피커 모달 → 날짜 선택 시 피커 닫힘 + 상세 모달 동시 오픈 (React 18 batch update)
- 북마크가 없으면 날짜 버튼 미노출 (`dateSummaries.length > 0` 조건)

# Change Log — 2026-05-28 · feat · 북마크 달력 모달 분리·반응형 폭

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/responsive-layout` |
| 관련 | [2026-05-27-feat-bookmark-calendar.md](./2026-05-27-feat-bookmark-calendar.md) |

## 요약

저장 뉴스 «날짜별 보기» 달력이 `26rem`/`22rem` 고정 폭이라 넓은 화면에서 크기가 변하지 않던 문제를 해결했다.
달력 UI(`BookmarkCalendar`)와 모달 껍데기(`BookmarkCalendarModal`)를 분리하고, 모달·셀을 `clamp`·`vw`로 스케일한다.

## 증상

- DevTools 폭을 1470→2560으로 바꿔도 달력 모달 크기 동일
- 원인: `calendarModalContent` `min(26rem, 92vw)` + `.calendar` `max-width: 22rem` 이중 상한

## Changed

| 파일 | 내용 |
|------|------|
| `BookmarkCalendarModal.tsx` | 신규 — `Modal` + 로딩 + `BookmarkCalendar` |
| `BookmarkCalendarModal.module.css` | `width: min(clamp(20rem, 38vw, 40rem), 92vw)` |
| `BookmarkCalendar.module.css` | `max-width` 제거 · 7열 `minmax(0,1fr)` · 날짜/네비 `clamp` |
| `MyPageBookmarkSection.tsx` | 인라인 모달 제거 → `BookmarkCalendarModal` 사용 |
| `MyPageBookmarkSection.module.css` | `.calendarModalContent` 삭제 |

## 스케일 참고 (모달 폭)

| 뷰포트 | 대략 폭 |
|--------|---------|
| 375px | ~320px (`20rem` 하한) |
| 1470px | ~558px (`38vw`) |
| 2560px+ | ~640px (`40rem` 상한) |

## Notes

- 달력은 모달 UX상 무한 확대하지 않음 — `40rem` 상한 유지
- 툴팁·hover 동작은 `BookmarkCalendar` 내부 로직 그대로

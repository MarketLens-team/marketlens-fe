# Change Log — 2026-05-28 · style: 북마크 정렬 바 UI 개선

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-28 |

## 요약

북마크 정렬 버튼을 pill 형태에서 언더라인 탭(D variant)으로 교체하고, 달력 버튼에 ring hover 효과(1-ring variant)를 적용. `/dev/sort-button` dev 페이지에서 비교 후 선택.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkSection.tsx` | 정렬 버튼 → 언더라인 탭 구조로 교체 · 달력 버튼 active 시 날짜(`YYYY-MM-DD`) + X 분리 (X=초기화, 날짜 영역=달력 재오픈) · `XIcon` 추가 · `formatTodayLabel` / `formatDateShort` 제거 |
| `components/mypage/MyPageBookmarkSection.module.css` | `.sortBtn` 계열 제거 → `.sortTab` / `.sortTabActive` (언더라인 탭, `font-size-lg`) · `.calendarBtn` ring hover(`--interactive-ring-hover`) · `.calendarBtnActive` primary ring 유지 · `.calendarBtnDate` / `.calendarBtnX` 추가 · 달력 아이콘 14→18px · 탭 패딩 확대 |

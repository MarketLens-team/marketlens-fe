# Change Log — 2026-05-27 · style: 북마크 달력 모달 UI 폴리시

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-27 |

## 요약

달력 모달 glow 제거, 툴팁 포지셔닝 개선, 날짜 버튼 레이블 수정.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkSection.module.css` | `.calendarModalContent` — `box-shadow` 제거, `contentClassOnly` 적용으로 `var(--color-bg-modal)` + `border: 1px solid var(--color-border-strong)` 사용 |
| `components/mypage/MyPageBookmarkSection.tsx` | `contentClassOnly` prop 추가 · 날짜 버튼 활성 시 오늘 날짜 대신 선택된 필터 날짜(`formatDateShort`) 표시 |
| `components/mypage/BookmarkCalendar.module.css` | `.tooltip` `box-shadow: none` |
| `components/mypage/BookmarkCalendar.tsx` | 툴팁 좌우 스마트 포지셔닝 — 달력 좌측 절반 날짜 → 우측, 우측 절반 → 좌측 (`side: 'left' \| 'right'` 상태 추가) |

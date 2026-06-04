# Change Log — 2026-05-28 · style: 북마크 목록 아이템 크기 확대

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-28 |

## 요약

북마크 목록 아이템의 제목 크기와 썸네일 크기를 전체 뉴스 피드(`AllNewsListItem`)와 동일한 수준으로 확대.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkSection.module.css` | `.title` `font-size-xl` → `font-size-2xl` · `.item` 그리드 컬럼 `5.5rem` → `8.5rem` · `.thumb` / `.thumbPlaceholder` `5.5rem × 3.75rem` → `8.5rem × 5.75rem` |

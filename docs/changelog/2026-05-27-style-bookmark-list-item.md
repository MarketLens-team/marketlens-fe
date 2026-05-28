# Change Log — 2026-05-27 · style: 북마크 목록 아이템 가시성 개선

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-27 |

## 요약

북마크 목록 아이템에서 불필요한 정보를 제거하고, 감성 점수를 종목 맥락에서만 표시하도록 수정.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkSection.tsx` | 저장 시각(`bookmarkedAt`) 표시 제거 · 감성 점수 `contextType === 'STOCK'` 일 때만 렌더링 (`ALL_NEWS` 맥락은 종목 기준 불명확하여 숨김) |

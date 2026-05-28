# Change Log — 2026-05-28 · style: 마이페이지 저장 뉴스 감성 점수 제거

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/setting-design` |
| 작업일 | 2026-05-28 |

## 요약

마이페이지 저장된 뉴스 목록에서 STOCK 컨텍스트 아이템의 감성 점수(`sentimentScore`) 표시 제거.

## Changed

| 파일 | 내용 |
|------|------|
| `components/mypage/MyPageBookmarkSection.tsx` | STOCK 컨텍스트 감성 점수 `<span>` 제거 · `buzzSentimentClass` · `formatStockScore` import 제거 · `SENTIMENT_SCORE_CLASS` 상수 제거 · `sentKey` 변수 제거 |

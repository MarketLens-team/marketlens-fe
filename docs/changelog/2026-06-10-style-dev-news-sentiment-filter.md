# Change Log — 2026-06-10 · style · 뉴스 감성 필터 dev 비교 페이지

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | `/dev/news-sentiment-filter` |

## 요약

종목 상세 「관련 뉴스」 긍정/부정 필터 UI를 프로덕션 반영 전에 비교할 dev 페이지를 추가했다. PillButton 현행·세그먼트·솔리드·보더·마이페이지 언더라인 탭 5가지 시안을 클릭해 선택 상태를 확인할 수 있다.

## Changed

| 항목 | 내용 |
|------|------|
| 라우트 | `/dev/news-sentiment-filter` |
| 시안 | Current(PillButton), V1 세그먼트, V2 그라데이션, V3 보더, V4 북마크 정렬 언더라인 |
| 진입 | `/dev` → News sentiment filter 링크 |

## 파일

- `src/pages/DevNewsSentimentFilterPage.tsx`
- `src/pages/DevNewsSentimentFilterPage.module.css`
- `src/router/index.tsx`
- `src/pages/DevActionButtonPage.tsx`

## 확인

- `npm run dev` → `/dev/news-sentiment-filter`
- 각 시안 탭 클릭 시 선택·언더라인/면 색 변화
- 프로덕션 종목 상세는 기존 PillButton 유지

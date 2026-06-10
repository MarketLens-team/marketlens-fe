# Change Log — 2026-06-10 · style · 종목 상세 관련 뉴스 감성 필터

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `develop` |
| 화면 | 종목 상세 → 관련 뉴스 |

## 요약

`/dev/news-sentiment-filter` 버전 4(마이페이지 북마크 정렬 탭 패턴)를 종목 상세 「관련 뉴스」에 반영했다. PillButton secondary 필터를 `NewsSentimentUnderlineFilter` 공용 컴포넌트로 교체하고, 제목과 필터를 한 행에 우측 정렬했다. 헤더 하단 구분선은 제거했다.

## Changed

| 항목 | 내용 |
|------|------|
| 필터 UI | 전체/긍정/부정 언더라인 탭, 활성 탭 색상(primary/success/danger) |
| 레이아웃 | `panelNewsHead` — 제목 좌측, 필터 우측 (`embedded`) |
| 구분선 | 관련 뉴스 헤더 `border-bottom` 제거 |
| dev | V4 시안이 공용 컴포넌트 사용, Current 라벨을 Legacy로 변경 |

## 파일

- `src/components/stock/NewsSentimentUnderlineFilter.tsx`
- `src/components/stock/NewsSentimentUnderlineFilter.module.css`
- `src/components/stock/StockDetailContent.tsx`
- `src/components/stock/StockDetailContent.module.css`
- `src/pages/DevNewsSentimentFilterPage.tsx`
- `src/pages/DevNewsSentimentFilterPage.module.css`

## 확인

- `npm run dev` → 종목 상세 → 관련 뉴스
- 전체/긍정/부정 탭 클릭 시 필터·피드 갱신, 활성 언더라인 색 확인
- `/dev/news-sentiment-filter` V4가 프로덕션과 동일 컴포넌트인지 확인

## 연관

- [2026-06-10-style-dev-news-sentiment-filter.md](./2026-06-10-style-dev-news-sentiment-filter.md) — 시안 비교 dev 페이지

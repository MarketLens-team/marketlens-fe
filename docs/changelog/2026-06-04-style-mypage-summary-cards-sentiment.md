# Change Log — 2026-06-04 · style · 마이페이지 요약 카드·감성 색상

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/mypage-telegram-link-password-change` |
| 화면 | `/mypage` · 관심종목 탭 |

## 요약

관심종목 탭 상단 요약 카드를 단일 Card 3열 레이아웃으로 정리하고, 감성 점수 색상을 stockSentimentZones 중립 구간(±20) 규칙에 맞춰 노란색으로 통일했다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 요약 카드 | StatTile 3장 분리 | Card 1장 · 3열 구분선 |
| 감성 색상 | 0~20 warm · 0 미만 neg | ±20 이내 warm(노란) · 초과 pos/neg |
| sentWarm 토큰 | `#b8860b` 하드코드 | `--color-warning` |
| StatTile | value 색상 고정 | `valueTone` prop (positive/negative) |

## 파일

- `src/components/mypage/MyPageSummaryCards.tsx`
- `src/components/mypage/MyPageSummaryCards.module.css`
- `src/components/mypage/MyPageWatchlistTable.module.css`
- `src/components/buzz/buzzSurgeScore.ts`
- `src/components/common/StatTile.tsx`
- `src/components/common/StatTile.module.css`
- `src/pages/MyPage.tsx`
- `src/pages/MyPage.module.css`

## 확인

- 요약 카드가 한 블록으로 보이고 라벨·숫자 톤이 하단 테이블과 맞음
- 감성 -17 등 ±20 구간 점수가 노란색
- 감성 +25 초과·-25 미만은 초록·빨강 유지

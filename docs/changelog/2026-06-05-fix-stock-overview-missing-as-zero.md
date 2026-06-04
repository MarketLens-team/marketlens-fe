# Change Log — 2026-06-05 · fix · 종목 전체 목록 결측 0 표기

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/stock-overview-missing-as-zero` |
| 화면 | 종목 목록(`/stock`) · 전체 종목 테이블 · 상단 랭킹 카드 |

## 요약

종목 전체 목록에서 API가 `mentionChangeRate24h`·`sentimentDelta24h`를 내려주지 않을 때 `—`로 보이던 문제를, 홈 관심종목·마이페이지와 같이 `0%`·`0`으로 통일했다.

## 증상

- 종목 탭 전체 목록에서 일부 행(예: 메리츠금융지주)의 **언급률**·**감성 변화** 열이 `—`로 표시됨
- 같은 지표가 없는 다른 종목은 `0`/`0%`로 표시되어 UI가 혼재됨

## 원인

- `stockMapper`가 overview·ranking의 `mentionChangeRate24h`·`sentimentDelta24h`를 `toNullableNumber`로 매핑 → null 유지
- `StockOverviewTable`·`formatSentimentDelta24h`·`StockRankingCard`가 null일 때 `—` 반환
- 홈 관심종목(`DashboardWatchlistTable`)은 이미 `toFiniteNumber`로 0% 표기 통일됨

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 언급률 결측 | `—` | `0%` |
| 감성 변화 결측 | `—` | `0` |
| 매핑 | `toNullableNumber` | `toFiniteNumber` (null/undefined → 0) |
| 타입 | `number \| null` | `number` |
| 정렬 | null을 목록 하단으로 밀기 | 0으로 비교 |

## 파일

- `src/data/mappers/stockMapper.ts`
- `src/data/types/stock.ts`
- `src/components/stock/StockOverviewTable.tsx`
- `src/components/stock/sentimentDelta.ts`
- `src/components/stock/StockRankingCard.tsx`
- `src/pages/StockListPage.tsx`

## 확인

- 종목 탭 전체 목록: 언급률·감성 변화 데이터 없음 → `0%`·`0`, 중립색
- 상단 랭킹 카드(언급·감성): 동일하게 `0%`·`0`
- 언급률·감성 변화 컬럼 정렬 시 결측 행이 하단 고정되지 않고 0 기준으로 정렬
- 홈·마이페이지 관심종목 표기와 일관

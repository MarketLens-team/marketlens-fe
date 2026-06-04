# Change Log — 2026-06-04 · fix · 등락 0% 표시·색상

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/home-watchlist-ai-summary` |
| 화면 | 홈 워치리스트 · 마이페이지 관심종목 · 종목 상세 · 종목 목록/시세 테이블 · 랭킹 카드 |

## 요약

등락률이 0일 때 상승(초록)으로 칠해지거나 `—`로 표시되던 문제를 `priceChangeDirection` 기준으로 통일했다. 0은 중립색·`0%` 텍스트로 표시한다.

## 증상

- 등락 0%인 종목(예: 한미약품)이 초록색 `+0 (+0%)`로 보임
- 홈·마이페이지 워치리스트 등락 열에서 0%가 `—`로 표시됨

## 원인

- 색상 판별에 `changePercent >= 0` / `change >= 0` 사용 → 0이 상승으로 분류
- `formatChangeCell`에서 `changePercent === 0`일 때 `—` 반환

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 등락 0% 색상 | 초록(상승) | 중립(기본 텍스트색) |
| 등락 0% 텍스트 | `—` (워치리스트) | `0%` |
| 등락 방향 판별 | `>= 0` / `< 0` | `> 0` / `< 0` / `flat` (`priceChangeDirection`) |

## 파일

- `src/components/stock/stockScore.ts` — `priceChangeDirection` 추가
- `src/components/stock/StockDetailContent.tsx`
- `src/components/dashboard/DashboardWatchlistTable.tsx`
- `src/components/mypage/MyPageWatchlistTable.tsx`
- `src/components/stock/StockOverviewTable.tsx`
- `src/components/stock/StockMarketTable.tsx`
- `src/components/stock/StockRankingCard.tsx`

## 확인

- 종목 상세: 등락 0 → `0 (0%)`, 초록/빨강 없음
- 홈·마이페이지 워치리스트: 등락 0 → `0%`, 중립색
- 양수·음수 등락은 기존처럼 초록·빨강 유지

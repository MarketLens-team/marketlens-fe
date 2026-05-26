# Change Log — 2026-05-26 · fix/dashboard-watchlist-prices

홈 대시보드 **내 관심 종목 워치리스트** 테이블의 현재가·등락이 항상 `0` / `0%`로 보이던 문제 수정.

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `feat/design-refresh` |
| 작업일 | 2026-05-26 |

## 요약

- 관심종목 행은 `summary`만 조회하고 `mapDashboardWatchlistRow`에서 시세를 `0`으로 고정하고 있었음.
- `fetchWatchlistForDashboard`에서 관심종목 `stockCode` 목록으로 `fetchStockPrices(codes)`를 **summary와 병렬** 호출 후 매퍼에 병합.
- 종목 상세 연관 종목 시세(`enrichRelatedStocksWithPrices`)와 동일하게 `GET /api/v1/stocks/prices` 응답을 코드별로 필터.

## Changed

| 파일 | 내용 |
|------|------|
| `dashboardClient.ts` | `fetchStockPrices(codes)` 병렬 호출 · `priceByCode` Map |
| `dashboardMapper.ts` | `mapDashboardWatchlistRow` — `TickerStockRow`에서 `price` · `changePercent` 매핑 |

## Notes

- API `prices.items`에 해당 종목이 없거나 `currentPrice`가 0이면 여전히 `0` 표시 — 백엔드 시세 데이터 확인.
- 마이페이지 관심종목(`myPageMapper`)은 동일 패턴(`price: 0` 고정) — 필요 시 별도 적용.

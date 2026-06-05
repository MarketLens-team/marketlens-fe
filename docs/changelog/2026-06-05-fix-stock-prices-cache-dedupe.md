# Change Log — 2026-06-05 · fix · `/stocks/prices` 중복 HTTP 제거

## 메타

| 항목 | 내용 |
|------|------|
| 브랜치 | `fix/dedupe-dashboard-login-api` |
| 커밋 | `ab47a14` |

## 요약

TickerBar·대시보드 관심종목·종목 상세 연관종목 등이 동시에 `GET /api/v1/stocks/prices`를 호출하던 것을 in-flight 병합 + 5분 TTL 캐시로 1회 HTTP로 합쳤다.

## Changed

| 항목 | Before | After |
|------|--------|-------|
| 로그인 직후 홈 | `prices` 2회 (티커 + watchlist) | `prices` 1회 |
| 5분 구간 내 재호출 | 매번 HTTP | 캐시 재사용 (폴링 주기와 동일 TTL) |
| `fetchStockMarketList` | prices 직접 fetch | 동일 캐시 경유 |

## 파일

- `src/lib/stockPricesCache.ts` (신규)
- `src/data/clients/stockClient.ts` — `fetchStockPrices`, `fetchStockMarketList`

## 확인

- [ ] 로그인 직후 Network `prices` 1회
- [ ] 5분 이내 페이지 이동 시 `prices` 추가 요청 없음
- [ ] 5분+ 경과 후 TickerBar 폴링 시 `prices` 1회 갱신
- [ ] `npm run lint:js` · `npm run build` 통과
